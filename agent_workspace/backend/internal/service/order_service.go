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
	
	// Проверяем баланс клиента
	balance, err := s.balanceRepo.GetClientBalance(clientID)
	if err != nil {
		return err
	}

	if balance < order.Amount {
		return errors.New("insufficient balance")
	}

	// Списываем деньги с клиента в эскроу
	err = s.balanceRepo.UpdateClientBalance(clientID, -order.Amount)
	if err != nil {
		return err
	}

	// Создаем эскроу транзакцию
	escrowTx := &database.EscrowTransaction{
		OrderID:  order.ID,
		Amount:   order.Amount,
		Type:     "hold",
		Status:   "completed",
		FromUser: "client",
		ToUser:   "escrow",
	}
	err = s.escrowRepo.CreateTransaction(escrowTx)
	if err != nil {
		// Откатываем списание
		s.balanceRepo.UpdateClientBalance(clientID, order.Amount)
		return err
	}

	// Создаем транзакцию баланса
	balanceTx := &database.BalanceTransaction{
		UserID:      clientID,
		UserType:    "client",
		Amount:      -order.Amount,
		Type:        "payment",
		Status:      "completed",
		OrderID:     &order.ID,
		Description: fmt.Sprintf("Оплата заказа #%d", order.ID),
	}
	s.balanceRepo.CreateTransaction(balanceTx)

	// Обновляем статус заказа
	err = s.orderRepo.UpdateStatus(orderID, "paid")
	if err != nil {
		return err
	}

	// Генерируем ссылку для работника
	workerLink, err := s.workerLinkRepo.GenerateWorkerLink(orderID)
	if err != nil {
		return err
	}

	// Обновляем URL для работника в заказе
	order.WorkerCompleteURL = fmt.Sprintf("https://auth.tomsk-center.ru/worker/complete/%s", workerLink.Token)
	return s.orderRepo.Update(order)
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

	if order.Status != "completed" {
		return errors.New("order cannot be finished in current status")
	}

	// Переводим деньги из эскроу компании
	err = s.balanceRepo.UpdateCompanyBalance(order.CompanyID, order.Amount)
	if err != nil {
		return err
	}

	// Создаем эскроу транзакцию
	escrowTx := &database.EscrowTransaction{
		OrderID:  order.ID,
		Amount:   order.Amount,
		Type:     "release",
		Status:   "completed",
		FromUser: "escrow",
		ToUser:   "company",
	}
	err = s.escrowRepo.CreateTransaction(escrowTx)
	if err != nil {
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
	s.balanceRepo.CreateTransaction(balanceTx)

	// Обновляем статус заказа
	return s.orderRepo.UpdateStatus(orderID, "finished")
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
	if order.Status != "created" && order.Status != "paid" {
		return errors.New("order cannot be cancelled in current status")
	}

	// Если заказ был оплачен, возвращаем деньги клиенту
	if order.Status == "paid" {
		err = s.balanceRepo.UpdateClientBalance(order.ClientID, order.Amount)
		if err != nil {
			return err
		}

		// Создаем эскроу транзакцию возврата
		escrowTx := &database.EscrowTransaction{
			OrderID:  order.ID,
			Amount:   order.Amount,
			Type:     "refund",
			Status:   "completed",
			FromUser: "escrow",
			ToUser:   "client",
		}
		s.escrowRepo.CreateTransaction(escrowTx)

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
		s.balanceRepo.CreateTransaction(balanceTx)
	}

	return s.orderRepo.UpdateStatus(orderID, "cancelled")
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
