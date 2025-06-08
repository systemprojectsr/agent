package controller

import (
	"core/internal"
	"core/internal/api"
	"core/internal/service"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

type NotificationController interface {
	GetNotifications(c *gin.Context, request *api.TokenNotificationsList)
	MarkAsRead(c *gin.Context, request *api.TokenMarkNotificationRead)
	GetUnreadCount(c *gin.Context, request *api.TokenAccess)
}

type notificationController struct {
	notificationService service.NotificationService
}

func (ctrl *notificationController) GetNotifications(c *gin.Context, request *api.TokenNotificationsList) {
	userInfo, err := ExtractUserFromToken(request.User.Login.Token)
	if err != nil {
		api.GetErrorJSON(c, http.StatusUnauthorized, err.Error())
		return
	}

	// Устанавливаем значения по умолчанию
	limit := request.Limit
	offset := request.Offset
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}

	notifications, total, err := ctrl.notificationService.GetUserNotifications(
		userInfo.UserID,
		userInfo.UserType,
		limit,
		offset,
	)
	if err != nil {
		api.GetErrorJSON(c, http.StatusInternalServerError, "Failed to get notifications")
		return
	}

	c.JSON(http.StatusOK, api.ResponseNotificationsList{
		StatusResponse: &internal.StatusResponse{Status: "success"},
		Notifications:  notifications,
		Total:          total,
	})
}

func (ctrl *notificationController) MarkAsRead(c *gin.Context, request *api.TokenMarkNotificationRead) {
	userInfo, err := ExtractUserFromToken(request.User.Login.Token)
	if err != nil {
		api.GetErrorJSON(c, http.StatusUnauthorized, err.Error())
		return
	}

	err = ctrl.notificationService.MarkAsRead(request.NotificationID, userInfo.UserID)
	if err != nil {
		api.GetErrorJSON(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Notification marked as read",
	})
}

func (ctrl *notificationController) GetUnreadCount(c *gin.Context, request *api.TokenAccess) {
	userInfo, err := ExtractUserFromToken(request.User.Login.Token)
	if err != nil {
		api.GetErrorJSON(c, http.StatusUnauthorized, err.Error())
		return
	}

	count, err := ctrl.notificationService.GetUnreadCount(userInfo.UserID, userInfo.UserType)
	if err != nil {
		api.GetErrorJSON(c, http.StatusInternalServerError, "Failed to get unread count")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":       "success",
		"unread_count": count,
	})
}

func NewNotificationController(notificationService service.NotificationService) NotificationController {
	return &notificationController{notificationService: notificationService}
}
