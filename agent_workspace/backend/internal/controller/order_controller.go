package controller

import (
	"core/internal"
	"core/internal/api"
	"core/internal/service"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

type OrderController interface {
	CreateOrder(c *gin.Context, request *api.TokenCreateOrder)
	GetOrderByID(c *gin.Context)
	GetClientOrders(c *gin.Context, request *api.TokenAccess)
	GetCompanyOrders(c *gin.Context, request *api.TokenAccess)
	PayOrder(c *gin.Context, request *api.TokenOrderAction)
	StartOrder(c *gin.Context, request *api.TokenOrderAction)
	CompleteOrderByWorker(c *gin.Context)
	FinishOrder(c *gin.Context, request *api.TokenOrderAction)
	CancelOrder(c *gin.Context, request *api.TokenOrderAction)
	GetAllOrders(c *gin.Context)
	ListOrders(c *gin.Context, request *api.TokenOrdersList)
	UpdateOrderStatus(c *gin.Context, request *api.TokenOrderAction)
}

type orderController struct {
	orderService service.OrderService
}

func (ctrl *orderController) CreateOrder(c *gin.Context, request *api.TokenCreateOrder) {
	userInfo, err := ExtractUserFromToken(request.TokenAccess.User.Login.Token)
	if err != nil {
		api.GetErrorJSON(c, http.StatusUnauthorized, err.Error())
		return
	}

	if userInfo.IsCompany {
		api.GetErrorJSON(c, http.StatusForbidden, "Only clients can create orders")
		return
	}

	order, err := ctrl.orderService.CreateOrder(
		userInfo.UserID,
		request.Order.CompanyID,
		request.Order.CardID,
		request.Order.Description,
	)
	if err != nil {
		api.GetErrorJSON(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusCreated, gin.H{"order": order})
}

func (ctrl *orderController) GetOrderByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		api.GetErrorJSON(c, http.StatusBadRequest, "Invalid order ID")
		return
	}

	order, err := ctrl.orderService.GetOrderByID(uint(id))
	if err != nil {
		api.GetErrorJSON(c, http.StatusNotFound, "Order not found")
		return
	}

	c.JSON(http.StatusOK, gin.H{"order": order})
}

func (ctrl *orderController) GetClientOrders(c *gin.Context, request *api.TokenAccess) {
	userInfo, err := ExtractUserFromToken(request.User.Login.Token)
	if err != nil {
		api.GetErrorJSON(c, http.StatusUnauthorized, err.Error())
		return
	}

	if userInfo.IsCompany {
		api.GetErrorJSON(c, http.StatusForbidden, "Only clients can access client orders")
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	orders, err := ctrl.orderService.GetOrdersByClient(userInfo.UserID, page, limit)
	if err != nil {
		api.GetErrorJSON(c, http.StatusInternalServerError, "Failed to get orders")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"orders": orders,
		"page":   page,
		"limit":  limit,
	})
}

func (ctrl *orderController) GetCompanyOrders(c *gin.Context, request *api.TokenAccess) {
	userInfo, err := ExtractUserFromToken(request.User.Login.Token)
	if err != nil {
		api.GetErrorJSON(c, http.StatusUnauthorized, err.Error())
		return
	}

	if !userInfo.IsCompany {
		api.GetErrorJSON(c, http.StatusForbidden, "Only companies can access company orders")
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	orders, err := ctrl.orderService.GetOrdersByCompany(userInfo.UserID, page, limit)
	if err != nil {
		api.GetErrorJSON(c, http.StatusInternalServerError, "Failed to get orders")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"orders": orders,
		"page":   page,
		"limit":  limit,
	})
}

func (ctrl *orderController) PayOrder(c *gin.Context, request *api.TokenOrderAction) {
	userInfo, err := ExtractUserFromToken(request.TokenAccess.User.Login.Token)
	if err != nil {
		api.GetErrorJSON(c, http.StatusUnauthorized, err.Error())
		return
	}

	if userInfo.IsCompany {
		api.GetErrorJSON(c, http.StatusForbidden, "Only clients can pay for orders")
		return
	}

	err = ctrl.orderService.PayForOrder(request.OrderID, userInfo.UserID)
	if err != nil {
		api.GetErrorJSON(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order paid successfully"})
}

func (ctrl *orderController) StartOrder(c *gin.Context, request *api.TokenOrderAction) {
	userInfo, err := ExtractUserFromToken(request.TokenAccess.User.Login.Token)
	if err != nil {
		api.GetErrorJSON(c, http.StatusUnauthorized, err.Error())
		return
	}

	if !userInfo.IsCompany {
		api.GetErrorJSON(c, http.StatusForbidden, "Only companies can start orders")
		return
	}

	err = ctrl.orderService.StartOrder(request.OrderID, userInfo.UserID)
	if err != nil {
		api.GetErrorJSON(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order started successfully"})
}

func (ctrl *orderController) CompleteOrderByWorker(c *gin.Context) {
	token := c.Param("token")
	if token == "" {
		api.GetErrorJSON(c, http.StatusBadRequest, "Token is required")
		return
	}

	err := ctrl.orderService.CompleteOrderByWorker(token)
	if err != nil {
		api.GetErrorJSON(c, http.StatusBadRequest, err.Error())
		return
	}

	c.HTML(http.StatusOK, "worker_success.html", gin.H{
		"message": "Заказ успешно отмечен как выполненный!",
	})
}

func (ctrl *orderController) FinishOrder(c *gin.Context, request *api.TokenOrderAction) {
	userInfo, err := ExtractUserFromToken(request.TokenAccess.User.Login.Token)
	if err != nil {
		api.GetErrorJSON(c, http.StatusUnauthorized, err.Error())
		return
	}

	if userInfo.IsCompany {
		api.GetErrorJSON(c, http.StatusForbidden, "Only clients can finish orders")
		return
	}

	err = ctrl.orderService.FinishOrder(request.OrderID, userInfo.UserID)
	if err != nil {
		api.GetErrorJSON(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order finished successfully"})
}

func (ctrl *orderController) CancelOrder(c *gin.Context, request *api.TokenOrderAction) {
	userInfo, err := ExtractUserFromToken(request.TokenAccess.User.Login.Token)
	if err != nil {
		api.GetErrorJSON(c, http.StatusUnauthorized, err.Error())
		return
	}

	err = ctrl.orderService.CancelOrder(request.OrderID, userInfo.UserID, userInfo.UserType)
	if err != nil {
		api.GetErrorJSON(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order cancelled successfully"})
}

func (ctrl *orderController) GetAllOrders(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	orders, err := ctrl.orderService.GetAllOrders(page, limit)
	if err != nil {
		api.GetErrorJSON(c, http.StatusInternalServerError, "Failed to get orders")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"orders": orders,
		"page":   page,
		"limit":  limit,
	})
}

func (ctrl *orderController) ListOrders(c *gin.Context, request *api.TokenOrdersList) {
	userInfo, err := ExtractUserFromToken(request.TokenAccess.User.Login.Token)
	if err != nil {
		api.GetErrorJSON(c, http.StatusUnauthorized, err.Error())
		return
	}

	// Устанавливаем значения по умолчанию
	limit := request.Limit
	offset := request.Offset
	if limit <= 0 || limit > 100 {
		limit = 10
	}
	if offset < 0 {
		offset = 0
	}

	orders, total, err := ctrl.orderService.GetOrdersWithFilter(
		userInfo.UserID,
		userInfo.UserType,
		request.Status,
		limit,
		offset,
	)
	if err != nil {
		api.GetErrorJSON(c, http.StatusInternalServerError, "Failed to get orders")
		return
	}

	c.JSON(http.StatusOK, api.ResponseOrdersList{
		StatusResponse: internal.StatusResponse{Status: "success"},
		Orders:         orders,
		Total:          total,
	})
}

func (ctrl *orderController) UpdateOrderStatus(c *gin.Context, request *api.TokenOrderAction) {
	userInfo, err := ExtractUserFromToken(request.TokenAccess.User.Login.Token)
	if err != nil {
		api.GetErrorJSON(c, http.StatusUnauthorized, err.Error())
		return
	}

	var message string
	var updatedOrder *api.OrderInfo

	switch request.Action {
	case "pay":
		if userInfo.IsCompany {
			api.GetErrorJSON(c, http.StatusForbidden, "Only clients can pay for orders")
			return
		}
		err = ctrl.orderService.PayForOrder(request.OrderID, userInfo.UserID)
		message = "Order paid successfully"
	case "start_work":
		if !userInfo.IsCompany {
			api.GetErrorJSON(c, http.StatusForbidden, "Only companies can start work")
			return
		}
		err = ctrl.orderService.StartOrder(request.OrderID, userInfo.UserID)
		message = "Work started successfully"
	case "complete":
		if userInfo.IsCompany {
			api.GetErrorJSON(c, http.StatusForbidden, "Only clients can complete orders")
			return
		}
		err = ctrl.orderService.FinishOrder(request.OrderID, userInfo.UserID)
		message = "Order completed successfully"
	case "cancel":
		err = ctrl.orderService.CancelOrder(request.OrderID, userInfo.UserID, userInfo.UserType)
		message = "Order cancelled successfully"
	default:
		api.GetErrorJSON(c, http.StatusBadRequest, "Invalid action")
		return
	}

	if err != nil {
		api.GetErrorJSON(c, http.StatusBadRequest, err.Error())
		return
	}

	// Получаем обновленную информацию о заказе
	updatedOrder, err = ctrl.orderService.GetOrderInfo(request.OrderID, userInfo.UserID, userInfo.UserType)
	if err != nil {
		// Если не удалось получить обновленную информацию, возвращаем простой ответ
		c.JSON(http.StatusOK, gin.H{"status": "success", "message": message})
		return
	}

	c.JSON(http.StatusOK, api.ResponseOrderAction{
		StatusResponse: internal.StatusResponse{Status: "success"},
		Order:          *updatedOrder,
		Message:        message,
	})
}

func NewOrderController(orderService service.OrderService) OrderController {
	return &orderController{orderService: orderService}
}
