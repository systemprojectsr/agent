package service

import (
	"core/internal/api"
	"core/internal/database"
	"core/internal/database/repository"
	"errors"
	"fmt"
	"time"
)

type OrderService interface {
	CreateOrder(clientID, companyID, cardID uint, description string) (*database.Order, error)
	GetOrderByID(id uint) (*database.Order, error)
	GetOrdersByClient(clientID uint, page, limit int) ([]database.Order, error)
	GetOrdersByCompany(companyID uint, page, limit int) ([]database.Order, error)
	PayForOrder(orderID, clientID uint) error
	AcceptOrder(orderID, companyID uint) error
	StartOrder(orderID, companyID uint) error
	CompleteOrderByWorker(token string) error
	FinishOrder(orderID, clientID uint) error
	CancelOrder(orderID uint, userID uint, userType string) error
	GetAllOrders(page, limit int) ([]database.Order, error)
	GetOrdersWithFilter(userID uint, userType, status string, limit, offset int) ([]api.OrderInfo, int, error)
	GetOrderInfo(orderID, userID uint, userType string) (*api.OrderInfo, error)
}

type orderService struct {
	orderRepo      repository.OrderRepository
	cardRepo       repository.CardRepository
	balanceRepo    repository.BalanceRepository
	escrowRepo     repository.EscrowRepository
	workerLinkRepo repository.WorkerLinkRepository
}

func (s *orderService) CreateOrder(clientID, companyID, cardID uint, description string) (*database.Order, error) {
	// Получаем карточку услуги
	card, err := s.cardRepo.GetByID(cardID)
	if err != nil {
		return nil, fmt.Errorf("card not found: %w", err)
	}

	if card.CompanyID != companyID {
		return nil, errors.New("card does not belong to this company")
	}

	// Создаем заказ
	order := &database.Order{
		ClientID:      clientID,
		CompanyID:     companyID,
		CardID:        cardID,
		Amount:        card.Price,
		Status:        "created",
		PaymentStatus: "pending",
		Description:   description,
	}

	err = s.orderRepo.Create(order)
	if err != nil {
		return nil, fmt.Errorf("failed to create order: %w", err)
	}

	return order, nil
}

func (s *orderService) GetOrderByID(id uint) (*database.Order, error) {
	return s.orderRepo.GetByID(id)
}

func (s *orderService) GetOrdersByClient(clientID uint, page, limit int) ([]database.Order, error) {
	offset := (page - 1) * limit
	return s.orderRepo.GetByClientID(clientID, limit, offset)
}

func (s *orderService) GetOrdersByCompany(companyID uint, page, limit int) ([]database.Order, error) {
	offset := (page - 1) * limit
	return s.orderRepo.GetByCompanyID(companyID, limit, offset)
}

func (s *orderService) AcceptOrder(orderID, companyID uint) error {
	order, err := s.orderRepo.GetByID(orderID)
	if err != nil {
		return err
	}

	if order.CompanyID != companyID {
		return errors.New("unauthorized: order does not belong to this company")
	}

	if order.Status != "created" {
		return errors.New("order cannot be accepted in current status")
	}

	return s.orderRepo.UpdateStatus(orderID, "accepted")
}

func (s *orderService) PayForOrder(orderID, clientID uint) error {
	order, err := s.orderRepo.GetByID(orderID)
	if err != nil {
		return err
	}

	if order.ClientID != clientID {
		return errors.New("unauthorized: order does not belong to this client")
	}

	if order.Status != "created" && order.Status != "pending" && order.Status != "accepted" {
		return errors.New("order cannot be paid in current status")
	}

	balance, err := s.balanceRepo.GetClientBalance(clientID)
	if err != nil {
		return err
	}

	if balance < order.Amount {
		return errors.New("insufficient balance")
	}

	tx := s.orderRepo.BeginTransaction()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			panic(r)
		}
	}()

	// Списываем деньги
	if err := s.balanceRepo.UpdateClientBalanceInTx(tx, clientID, -order.Amount); err != nil {
		tx.Rollback()
		return err
	}

	// Эскроу транзакция
	escrowTx := &database.EscrowTransaction{
		OrderID:  order.ID,
		Amount:   order.Amount,
		Type:     "hold",
		Status:   "completed",
		FromUser: "client",
		ToUser:   "escrow",
	}
	if err := s.escrowRepo.CreateTransactionInTx(tx, escrowTx); err != nil {
		tx.Rollback()
		return err
	}

	// Баланс транзакция
	balanceTx := &database.BalanceTransaction{
		UserID:      clientID,
		UserType:    "client",
		Amount:      -order.Amount,
		Type:        "payment",
		Status:      "completed",
		OrderID:     &order.ID,
		Description: fmt.Sprintf("Оплата заказа #%d", order.ID),
	}
	if err := s.balanceRepo.CreateTransactionInTx(tx, balanceTx); err != nil {
		tx.Rollback()
		return err
	}

	// Обновляем статус и payment_status в одной операции
	if err := tx.Model(&database.Order{}).Where("id = ?", orderID).
		Updates(map[string]interface{}{"status": "paid", "payment_status": "paid"}).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Генерация workerURL прямо в транзакции
	workerLink, err := s.workerLinkRepo.GenerateWorkerLink(orderID)
	if err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Model(&database.Order{}).Where("id = ?", orderID).
		Update("worker_complete_url", fmt.Sprintf("https://auth.tomsk-center.ru/worker/complete/%s", workerLink.Token)).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Фиксируем транзакцию
	if err := tx.Commit().Error; err != nil {
		return err
	}

	return nil
}

func (s *orderService) StartOrder(orderID, companyID uint) error {
	order, err := s.orderRepo.GetByID(orderID)
	if err != nil {
		return err
	}

	if order.CompanyID != companyID {
		return errors.New("unauthorized: order does not belong to this company")
	}

	if order.Status != "paid" {
		return errors.New("order cannot be started in current status")
	}

	return s.orderRepo.UpdateStatus(orderID, "in_progress")
}

func (s *orderService) CompleteOrderByWorker(token string) error {
	order, err := s.orderRepo.GetByWorkerToken(token)
	if err != nil {
		return err
	}

	if order.Status != "in_progress" {
		return errors.New("order cannot be completed in current status")
	}

	// Помечаем ссылку как использованную
	err = s.workerLinkRepo.MarkAsUsed(token)
	if err != nil {
		return err
	}

	// Обновляем статус заказа
	now := time.Now()
	order.Status = "completed"
	order.CompletedAt = &now
	return s.orderRepo.Update(order)
}

func (s *orderService) FinishOrder(orderID, clientID uint) error {
	order, err := s.orderRepo.GetByID(orderID)
	if err != nil {
		return err
	}

	if order.ClientID != clientID {
		return errors.New("unauthorized: order does not belong to this client")
	}

	// Проверяем статусы заказа
	if order.Status != "completed" {
		return errors.New("order cannot be finished in current status")
	}

	if order.PaymentStatus != "paid" {
		return errors.New("order payment is not in paid status")
	}

	// Начинаем транзакцию БД
	tx := s.orderRepo.BeginTransaction()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			panic(r)
		}
	}()

	// Создаем эскроу транзакцию ПЕРЕД переводом денег
	escrowTx := &database.EscrowTransaction{
		OrderID:  order.ID,
		Amount:   order.Amount,
		Type:     "release",
		Status:   "completed",
		FromUser: "escrow",
		ToUser:   "company",
	}
	err = s.escrowRepo.CreateTransactionInTx(tx, escrowTx)
	if err != nil {
		tx.Rollback()
		return err
	}

	// Переводим деньги из эскроу компании
	err = s.balanceRepo.UpdateCompanyBalanceInTx(tx, order.CompanyID, order.Amount)
	if err != nil {
		tx.Rollback()
		return err
	}

	// Создаем транзакцию баланса для компании
	balanceTx := &database.BalanceTransaction{
		UserID:      order.CompanyID,
		UserType:    "company",
		Amount:      order.Amount,
		Type:        "payment",
		Status:      "completed",
		OrderID:     &order.ID,
		Description: fmt.Sprintf("Оплата за заказ #%d", order.ID),
	}
	err = s.balanceRepo.CreateTransactionInTx(tx, balanceTx)
	if err != nil {
		tx.Rollback()
		return err
	}

	// Обновляем статус заказа
	err = s.orderRepo.UpdateStatusInTx(tx, orderID, "finished")
	if err != nil {
		tx.Rollback()
		return err
	}

	// Фиксируем транзакцию
	return tx.Commit().Error
}

func (s *orderService) CancelOrder(orderID uint, userID uint, userType string) error {
	order, err := s.orderRepo.GetByID(orderID)
	if err != nil {
		return err
	}

	// Проверяем права на отмену
	if userType == "client" && order.ClientID != userID {
		return errors.New("unauthorized")
	}
	if userType == "company" && order.CompanyID != userID {
		return errors.New("unauthorized")
	}

	// Можно отменить только созданные или оплаченные заказы
	if order.Status != "created" && order.Status != "paid" && order.Status != "in_progress" {
		return errors.New("order cannot be cancelled in current status")
	}

	// Начинаем транзакцию БД
	tx := s.orderRepo.BeginTransaction()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			panic(r)
		}
	}()

	// Если заказ был оплачен, возвращаем деньги клиенту
	if order.Status == "paid" && order.PaymentStatus == "paid" {
		// Создаем эскроу транзакцию возврата ПЕРЕД возвратом денег
		escrowTx := &database.EscrowTransaction{
			OrderID:  order.ID,
			Amount:   order.Amount,
			Type:     "refund",
			Status:   "completed",
			FromUser: "escrow",
			ToUser:   "client",
		}
		err = s.escrowRepo.CreateTransactionInTx(tx, escrowTx)
		if err != nil {
			tx.Rollback()
			return err
		}

		// Возвращаем деньги клиенту
		err = s.balanceRepo.UpdateClientBalanceInTx(tx, order.ClientID, order.Amount)
		if err != nil {
			tx.Rollback()
			return err
		}

		// Создаем транзакцию баланса
		balanceTx := &database.BalanceTransaction{
			UserID:      order.ClientID,
			UserType:    "client",
			Amount:      order.Amount,
			Type:        "refund",
			Status:      "completed",
			OrderID:     &order.ID,
			Description: fmt.Sprintf("Возврат за отмененный заказ #%d", order.ID),
		}
		err = s.balanceRepo.CreateTransactionInTx(tx, balanceTx)
		if err != nil {
			tx.Rollback()
			return err
		}

		// Обновляем payment_status на refunded
		err = s.orderRepo.UpdatePaymentStatusInTx(tx, orderID, "refunded")
		if err != nil {
			tx.Rollback()
			return err
		}
	}

	// Обновляем статус заказа на cancelled
	err = s.orderRepo.UpdateStatusInTx(tx, orderID, "cancelled")
	if err != nil {
		tx.Rollback()
		return err
	}

	// Фиксируем транзакцию
	return tx.Commit().Error
}

func (s *orderService) GetAllOrders(page, limit int) ([]database.Order, error) {
	offset := (page - 1) * limit
	return s.orderRepo.GetAllActive(limit, offset)
}

func (s *orderService) GetOrdersWithFilter(userID uint, userType, status string, limit, offset int) ([]api.OrderInfo, int, error) {
	var orders []database.Order
	var total int
	var err error

	// Получаем заказы в зависимости от типа пользователя и фильтра
	if userType == "client" {
		orders, err = s.orderRepo.GetOrdersByClientWithStatus(userID, status, limit, offset)
		if err != nil {
			return nil, 0, err
		}
		total, err = s.orderRepo.CountOrdersByClientWithStatus(userID, status)
	} else if userType == "company" {
		orders, err = s.orderRepo.GetOrdersByCompanyWithStatus(userID, status, limit, offset)
		if err != nil {
			return nil, 0, err
		}
		total, err = s.orderRepo.CountOrdersByCompanyWithStatus(userID, status)
	} else {
		return nil, 0, errors.New("invalid user type")
	}

	if err != nil {
		return nil, 0, err
	}

	// Преобразуем в API формат
	var orderInfos []api.OrderInfo
	for _, order := range orders {
		orderInfo := s.convertOrderToOrderInfo(order, userType)
		orderInfos = append(orderInfos, orderInfo)
	}

	return orderInfos, total, nil
}

func (s *orderService) GetOrderInfo(orderID, userID uint, userType string) (*api.OrderInfo, error) {
	order, err := s.orderRepo.GetByIDWithRelations(orderID)
	if err != nil {
		return nil, err
	}

	// Проверяем права доступа
	if userType == "client" && order.ClientID != userID {
		return nil, errors.New("access denied")
	}
	if userType == "company" && order.CompanyID != userID {
		return nil, errors.New("access denied")
	}

	orderInfo := s.convertOrderToOrderInfo(*order, userType)
	return &orderInfo, nil
}

func (s *orderService) convertOrderToOrderInfo(order database.Order, userType string) api.OrderInfo {
	orderInfo := api.OrderInfo{
		ID:            order.ID,
		ClientName:    order.Client.FullName,
		CompanyName:   order.Company.CompanyName,
		ServiceName:   order.Card.Title,
		Description:   order.Description,
		Amount:        order.Amount,
		Status:        order.Status,
		PaymentStatus: order.PaymentStatus,
		CreatedAt:     order.CreatedAt.Format(time.RFC3339),
		WorkerURL:     order.WorkerCompleteURL,
	}

	if order.CompletedAt != nil {
		completedAt := order.CompletedAt.Format(time.RFC3339)
		orderInfo.CompletedAt = &completedAt
	}

	// Определяем доступные действия
	orderInfo.CanCancel = order.Status == "created" || order.Status == "paid"
	orderInfo.CanPay = userType == "client" && order.Status == "created" && order.PaymentStatus == "pending"
	orderInfo.CanRate = userType == "client" && order.Status == "completed"

	return orderInfo
}

func NewOrderService(
	orderRepo repository.OrderRepository,
	cardRepo repository.CardRepository,
	balanceRepo repository.BalanceRepository,
	escrowRepo repository.EscrowRepository,
	workerLinkRepo repository.WorkerLinkRepository,
) OrderService {
	return &orderService{
		orderRepo:      orderRepo,
		cardRepo:       cardRepo,
		balanceRepo:    balanceRepo,
		escrowRepo:     escrowRepo,
		workerLinkRepo: workerLinkRepo,
	}
}
