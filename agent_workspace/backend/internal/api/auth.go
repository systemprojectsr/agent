package api

import "core/internal"

// Простые структуры для регистрации
type ClientRegisterRequest struct {
	FullName string `json:"full_name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Phone    string `json:"phone" binding:"required"`
	Password string `json:"password" binding:"required,min=6"`
	Photo    string `json:"photo"`
}

type CompanyRegisterRequest struct {
	CompanyName string `json:"company_name" binding:"required"`
	Email       string `json:"email" binding:"required,email"`
	Phone       string `json:"phone" binding:"required"`
	Password    string `json:"password" binding:"required,min=6"`
	Website     string `json:"website"`
	Description string `json:"description"`
	Photo       string `json:"photo"`
}

// Простые структуры для авторизации
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Старые структуры для обратной совместимости (можно удалить после переноса)
type RegisterInfoPost struct {
	FullName     string `json:"full_name"`
	Email        string `json:"email"`
	Phone        string `json:"phone"`
	PasswordHash string `json:"password"`
	Photo        string `json:"photo"`
	Type         string `json:"type"`
}

type Client struct {
	RegisterInfoPost RegisterInfoPost `json:"register"`
}

type ClientRegister struct {
	Client Client `json:"user"`
}

type GeneralAuth struct {
	GeneralLogin GeneralLogin `json:"user"`
}

type GeneralLogin struct {
	GeneralLoginAttributes GeneralLoginAttributes `json:"login"`
}

type GeneralLoginAttributes struct {
	Email        string `json:"email"`
	PasswordHash string `json:"password_hash"`
}

type ClientToken struct {
	Token string `json:"token"`
}

type TokenAccess struct {
	User struct {
		Login struct {
			Token string `json:"token"`
		} `json:"login"`
	} `json:"user"`
}

type TokenAccessDouble struct {
	TokenAccess struct {
		User struct {
			Login struct {
				Token string `json:"token"`
			} `json:"login"`
		} `json:"user"`
	} `json:"token_access"`
}

type TokenCreateCard struct {
	TokenAccess TokenAccess `json:"token_access"`
	Card        struct {
		Title       string  `json:"title"`
		Description string  `json:"description"`
		Category    string  `json:"category"`
		Location    string  `json:"location"`
		Price       float64 `json:"price"`
	} `json:"card"`
}

type TokenDeleteCard struct {
	TokenAccess TokenAccess `json:"token_access"`
	CardID      uint        `json:"card_id"`
}

type TokenListCard struct {
	TokenAccess TokenAccess `json:"token_access"`
}

type CardResponse struct {
	ID          uint   `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	CompanyID   uint   `json:"company_id"`
}

type CardsWrapper struct {
	Cards []CardResponse `json:"cards"`
}

type UserCompanyRegister struct {
	CompanyRegister CompanyRegister `json:"user"`
}

type CompanyRegister struct {
	CompanyInfoPost CompanyInfoPost `json:"register"`
}

type CompanyInfoPost struct {
	CompanyName   string   `json:"company_name"`
	Email         string   `json:"email"`
	Phone         string   `json:"phone"`
	FullName      string   `json:"full_name"`
	PositionAgent string   `json:"position_agent"`
	IDCompany     string   `json:"id_company"`
	Address       string   `json:"address"`
	TypeService   string   `json:"type_service"`
	PasswordHash  string   `json:"password_hash"`
	Photo         string   `json:"photo"`
	Documents     []string `json:"documents"`
	Type          string   `json:"type"`
}

type AccountInfo struct {
	ID       uint    `json:"id"`
	FullName string  `json:"full_name"`
	Email    string  `json:"email"`
	Phone    string  `json:"phone"`
	Photo    string  `json:"photo"`
	Token    string  `json:"token"`
	Type     string  `json:"type"`
	Balance  float64 `json:"balance"`
}

type CompanyInfo struct {
	ID            uint     `json:"id"`
	CompanyName   string   `json:"company_name"`
	Email         string   `json:"email"`
	Phone         string   `json:"phone"`
	FullName      string   `json:"full_name"`
	PositionAgent string   `json:"position_agent"`
	IDCompany     string   `json:"id_company"`
	Address       string   `json:"address"`
	TypeService   string   `json:"type_service"`
	PasswordHash  string   `json:"password_hash"`
	Photo         string   `json:"photo"`
	Documents     []string `json:"documents"`
	Type          string   `json:"type"`
}

type ResponseSuccessAccess struct {
	StatusResponse internal.StatusResponse `json:"status_response"`
	ResponseUser   ResponseUser            `json:"user"`
}

type ResponseUser struct {
	ID    uint   `json:"id"`
	Token string `json:"token"`
	Type  string `json:"type"`
}

type ResponseAccount struct {
	StatusResponse internal.StatusResponse `json:"status_response"`
	User           struct {
		Account AccountInfo `json:"account"`
	} `json:"user"`
}

type ResponseAccountCompany struct {
	StatusResponse internal.StatusResponse `json:"status_response"`
	User           struct {
		Account CompanyInfo `json:"account"`
	} `json:"user"`
}

// ================================
// PROFILE UPDATE STRUCTURES
// ================================

type TokenUpdateProfile struct {
	TokenAccess TokenAccess `json:"token_access"`
	Profile     ProfileInfo `json:"profile"`
}

type TokenUpdateClientProfile struct {
	TokenAccess TokenAccess       `json:"token_access"`
	Profile     ClientProfileInfo `json:"profile"`
}

// ================================
// BALANCE STRUCTURES
// ================================

type TokenTopUpBalance struct {
	TokenAccess TokenAccess `json:"token_access"`
	Amount      float64     `json:"amount"`
}

type TokenBalanceHistory struct {
	TokenAccess TokenAccess `json:"token_access"`
	Limit       int         `json:"limit"`
	Offset      int         `json:"offset"`
}

type BalanceHistoryItem struct {
	ID          uint    `json:"id"`
	Amount      float64 `json:"amount"`
	Type        string  `json:"type"`
	Status      string  `json:"status"`
	Description string  `json:"description"`
	CreatedAt   string  `json:"created_at"`
}

type ResponseBalanceHistory struct {
	StatusResponse internal.StatusResponse `json:"status_response"`
	Transactions   []BalanceHistoryItem    `json:"transactions"`
	Total          int                     `json:"total"`
}

// ================================
// ORDER STRUCTURES
// ================================

type TokenOrdersList struct {
	TokenAccess TokenAccess `json:"token_access"`
	Status      string      `json:"status"` // all, pending, in_progress, completed, cancelled
	Limit       int         `json:"limit"`
	Offset      int         `json:"offset"`
}

type OrderInfo struct {
	ID            uint    `json:"id"`
	ClientName    string  `json:"client_name"`
	CompanyName   string  `json:"company_name"`
	ServiceName   string  `json:"service_name"`
	Description   string  `json:"description"`
	Amount        float64 `json:"amount"`
	Status        string  `json:"status"`
	PaymentStatus string  `json:"payment_status"`
	CreatedAt     string  `json:"created_at"`
	CompletedAt   *string `json:"completed_at"`
	WorkerURL     string  `json:"worker_url"`
	CanCancel     bool    `json:"can_cancel"`
	CanPay        bool    `json:"can_pay"`
	CanRate       bool    `json:"can_rate"`
}

type ResponseOrdersList struct {
	StatusResponse internal.StatusResponse `json:"status_response"`
	Orders         []OrderInfo             `json:"orders"`
	Total          int                     `json:"total"`
}

type ResponseOrderAction struct {
	StatusResponse internal.StatusResponse `json:"status_response"`
	Order          OrderInfo               `json:"order"`
	Message        string                  `json:"message"`
}

// ================================
// WORKER COMPLETION
// ================================

type WorkerCompleteOrder struct {
	Token   string `json:"token"`
	Message string `json:"message"`
}

type ResponseWorkerComplete struct {
	StatusResponse internal.StatusResponse `json:"status_response"`
	Order          OrderInfo               `json:"order"`
	Message        string                  `json:"message"`
}

// ================================
// REVIEW STRUCTURES
// ================================

type ReviewInfo struct {
	ID          uint   `json:"id"`
	ClientName  string `json:"client_name"`
	ServiceName string `json:"service_name"`
	Rating      int    `json:"rating"`
	Comment     string `json:"comment"`
	CreatedAt   string `json:"created_at"`
}

type ResponseReviewsList struct {
	StatusResponse internal.StatusResponse `json:"status_response"`
	Reviews        []ReviewInfo            `json:"reviews"`
	Total          int                     `json:"total"`
}

// ================================
// COMPANY STATS
// ================================

type TokenCompanyStats struct {
	TokenAccess TokenAccess `json:"token_access"`
}

type CompanyStats struct {
	TotalServices    int     `json:"total_services"`
	TotalOrders      int     `json:"total_orders"`
	ActiveOrders     int     `json:"active_orders"`
	CompletedOrders  int     `json:"completed_orders"`
	TotalEarnings    float64 `json:"total_earnings"`
	TotalRevenue     float64 `json:"total_revenue"`
	AverageRating    float64 `json:"average_rating"`
	TotalReviews     int     `json:"total_reviews"`
	ReviewCount      int     `json:"review_count"`
	BalanceAvailable float64 `json:"balance_available"`
}

type ResponseCompanyStats struct {
	StatusResponse internal.StatusResponse `json:"status_response"`
	Stats          CompanyStats            `json:"stats"`
}

// ================================
// NOTIFICATION STRUCTURES
// ================================

type TokenNotificationsList struct {
	TokenAccess TokenAccess `json:"token_access"`
	IsRead      *bool       `json:"is_read"` // nil = all, true = read, false = unread
	Limit       int         `json:"limit"`
	Offset      int         `json:"offset"`
}

type NotificationInfo struct {
	ID        uint   `json:"id"`
	Title     string `json:"title"`
	Message   string `json:"message"`
	Type      string `json:"type"`
	IsRead    bool   `json:"is_read"`
	OrderID   *uint  `json:"order_id"`
	RelatedID *uint  `json:"related_id"`
	CreatedAt string `json:"created_at"`
}

type ResponseNotificationsList struct {
	StatusResponse internal.StatusResponse `json:"status_response"`
	Notifications  []NotificationInfo      `json:"notifications"`
	Total          int                     `json:"total"`
	UnreadCount    int                     `json:"unread_count"`
}

type TokenMarkNotificationRead struct {
	TokenAccess    TokenAccess `json:"token_access"`
	NotificationID uint        `json:"notification_id"`
}

// ================================
// CARD UPDATE STRUCTURE
// ================================

// ProfileInfo структура для обновления профиля компании
type ProfileInfo struct {
	CompanyName   string   `json:"company_name"`
	FullName      string   `json:"full_name"`
	Email         string   `json:"email"`
	Phone         string   `json:"phone"`
	Address       string   `json:"address"`
	TypeService   string   `json:"type_service"`
	PositionAgent string   `json:"position_agent"`
	Photo         string   `json:"photo"`
	Documents     []string `json:"documents"`
}

// ClientProfileInfo структура для обновления профиля клиента
type ClientProfileInfo struct {
	FullName string `json:"full_name"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
	Photo    string `json:"photo"`
}

// CardInfo структура для обновления карточки услуги
type CardInfo struct {
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Category    string  `json:"category"`
	Location    string  `json:"location"`
	Price       float64 `json:"price"`
}
