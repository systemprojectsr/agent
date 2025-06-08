package repository

import (
	"core/internal/database"
	"gorm.io/gorm"
)

type NotificationRepository interface {
	Create(notification *database.Notification) error
	GetByID(id uint) (*database.Notification, error)
	GetByUser(userID uint, userType string, limit, offset int) ([]database.Notification, error)
	CountByUser(userID uint, userType string) (int, error)
	CountUnreadByUser(userID uint, userType string) (int, error)
	MarkAsRead(id uint) error
	MarkAllAsRead(userID uint, userType string) error
	DeleteOld(days int) error
}

type notificationRepository struct {
	db *gorm.DB
}

func (r *notificationRepository) Create(notification *database.Notification) error {
	return r.db.Create(notification).Error
}

func (r *notificationRepository) GetByID(id uint) (*database.Notification, error) {
	var notification database.Notification
	err := r.db.First(&notification, id).Error
	if err != nil {
		return nil, err
	}
	return &notification, nil
}

func (r *notificationRepository) GetByUser(userID uint, userType string, limit, offset int) ([]database.Notification, error) {
	var notifications []database.Notification
	err := r.db.Where("user_id = ? AND user_type = ?", userID, userType).
		Limit(limit).Offset(offset).Order("created_at DESC").Find(&notifications).Error
	return notifications, err
}

func (r *notificationRepository) CountByUser(userID uint, userType string) (int, error) {
	var count int64
	err := r.db.Model(&database.Notification{}).
		Where("user_id = ? AND user_type = ?", userID, userType).Count(&count).Error
	return int(count), err
}

func (r *notificationRepository) CountUnreadByUser(userID uint, userType string) (int, error) {
	var count int64
	err := r.db.Model(&database.Notification{}).
		Where("user_id = ? AND user_type = ? AND is_read = ?", userID, userType, false).Count(&count).Error
	return int(count), err
}

func (r *notificationRepository) MarkAsRead(id uint) error {
	return r.db.Model(&database.Notification{}).Where("id = ?", id).Update("is_read", true).Error
}

func (r *notificationRepository) MarkAllAsRead(userID uint, userType string) error {
	return r.db.Model(&database.Notification{}).
		Where("user_id = ? AND user_type = ?", userID, userType).
		Update("is_read", true).Error
}

func (r *notificationRepository) DeleteOld(days int) error {
	return r.db.Where("created_at < NOW() - INTERVAL ? DAY", days).Delete(&database.Notification{}).Error
}

func NewNotificationRepository(db *gorm.DB) NotificationRepository {
	return &notificationRepository{db: db}
}
