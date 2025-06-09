package service

import (
	"core/internal/api"
	"core/internal/database"
	"core/internal/database/repository"
	"errors"
	"fmt"
	"time"
)

type NotificationService interface {
	CreateNotification(userID uint, userType, title, message, notificationType string, relatedID *uint) error
	GetUserNotifications(userID uint, userType string, limit, offset int) ([]api.NotificationInfo, int, error)
	MarkAsRead(notificationID, userID uint) error
	GetUnreadCount(userID uint, userType string) (int, error)
	// Методы для создания специфических уведомлений
	NotifyOrderStatusChange(orderID uint, status string) error
	NotifyPaymentReceived(companyID uint, amount float64, orderID uint) error
	NotifyNewOrder(companyID uint, orderID uint) error
}

type notificationService struct {
	notificationRepo repository.NotificationRepository
	orderRepo        repository.OrderRepository
}

func (s *notificationService) CreateNotification(userID uint, userType, title, message, notificationType string, relatedID *uint) error {
	notification := &database.Notification{
		UserID:           userID,
		UserType:         userType,
		Title:            title,
		Message:          message,
		Type:             notificationType,
		RelatedID:        relatedID,
		IsRead:           false,
	}

	return s.notificationRepo.Create(notification)
}

func (s *notificationService) GetUserNotifications(userID uint, userType string, limit, offset int) ([]api.NotificationInfo, int, error) {
	notifications, err := s.notificationRepo.GetByUser(userID, userType, limit, offset)
	if err != nil {
		return nil, 0, err
	}

	total, err := s.notificationRepo.CountByUser(userID, userType)
	if err != nil {
		return nil, 0, err
	}

	var notificationInfos []api.NotificationInfo
	for _, notification := range notifications {
		notificationInfos = append(notificationInfos, api.NotificationInfo{
			ID:        notification.ID,
			Title:     notification.Title,
			Message:   notification.Message,
			Type:      notification.Type,
			IsRead:    notification.IsRead,
			RelatedID: notification.RelatedID,
			CreatedAt: notification.CreatedAt.Format(time.RFC3339),
		})
	}

	return notificationInfos, total, nil
}

func (s *notificationService) MarkAsRead(notificationID, userID uint) error {
	// Проверяем, что уведомление принадлежит пользователю
	notification, err := s.notificationRepo.GetByID(notificationID)
	if err != nil {
		return err
	}

	if notification.UserID != userID {
		return errors.New("access denied")
	}

	return s.notificationRepo.MarkAsRead(notificationID)
}

func (s *notificationService) GetUnreadCount(userID uint, userType string) (int, error) {
	return s.notificationRepo.CountUnreadByUser(userID, userType)
}

func (s *notificationService) NotifyOrderStatusChange(orderID uint, status string) error {
	order, err := s.orderRepo.GetByIDWithRelations(orderID)
	if err != nil {
		return err
	}

	var statusMessage string
	switch status {
	case "paid":
		statusMessage = "оплачен"
	case "in_progress":
		statusMessage = "взят в работу"
	case "completed":
		statusMessage = "выполнен"
	case "finished":
		statusMessage = "завершен"
	case "cancelled":
		statusMessage = "отменен"
	default:
		statusMessage = "изменен"
	}

	// Уведомляем клиента
	clientTitle := "Статус заказа изменен"
	clientMessage := fmt.Sprintf("Заказ #%d (%s) %s", orderID, order.Card.Title, statusMessage)
	err = s.CreateNotification(order.ClientID, "client", clientTitle, clientMessage, "order_status", &orderID)
	if err != nil {
		return err
	}

	// Уведомляем компанию (если статус изменился не компанией)
	if status != "in_progress" {
		companyTitle := "Статус заказа изменен"
		companyMessage := fmt.Sprintf("Заказ #%d (%s) %s", orderID, order.Card.Title, statusMessage)
		err = s.CreateNotification(order.CompanyID, "company", companyTitle, companyMessage, "order_status", &orderID)
		if err != nil {
			return err
		}
	}

	return nil
}

func (s *notificationService) NotifyPaymentReceived(companyID uint, amount float64, orderID uint) error {
	title := "Получена оплата"
	message := fmt.Sprintf("Получена оплата %.2f руб. за заказ #%d", amount, orderID)
	return s.CreateNotification(companyID, "company", title, message, "payment", &orderID)
}

func (s *notificationService) NotifyNewOrder(companyID uint, orderID uint) error {
	order, err := s.orderRepo.GetByIDWithRelations(orderID)
	if err != nil {
		return err
	}

	title := "Новый заказ"
	message := fmt.Sprintf("Получен новый заказ #%d (%s) от %s", orderID, order.Card.Title, order.Client.FullName)
	return s.CreateNotification(companyID, "company", title, message, "new_order", &orderID)
}

func NewNotificationService(notificationRepo repository.NotificationRepository, orderRepo repository.OrderRepository) NotificationService {
	return &notificationService{
		notificationRepo: notificationRepo,
		orderRepo:        orderRepo,
	}
}
