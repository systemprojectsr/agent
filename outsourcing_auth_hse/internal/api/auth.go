package api

import "core/internal"

type RegisterInfoPost struct {
	FullName     string `json:"full_name"`
	Email        string `json:"email"`
	Phone        string `json:"phone"`
	PasswordHash string `json:"password"`
	Photo        string `json:"photo"`
	Type         string `json:"type"`
}

type Client struct {
	*RegisterInfoPost `json:"register"`
}

type ClientRegister struct {
	*Client `json:"user"`
}

type GeneralAuth struct {
	*GeneralLogin `json:"user"`
}

type GeneralLogin struct {
	*GeneralLoginAttributes `json:"login"`
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

type TokenCreateCard struct {
	*TokenAccess
	Card struct {
		Title       string  `json:"title"`
		Description string  `json:"description"`
		Category    string  `json:"category"`
		Location    string  `json:"location"`
		Price       float64 `json:"price"`
	} `json:"card"`
}

type TokenDeleteCard struct {
	*TokenAccess
	CardID uint `json:"card_id"`
}

type TokenListCard struct {
	*TokenAccess
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
	*CompanyRegister `json:"user"`
}

type CompanyRegister struct {
	*CompanyInfoPost `json:"register"`
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
	ID       uint   `json:"id"`
	FullName string `json:"full_name"`
	Phone    string `json:"phone"`
	Photo    string `json:"photo"`
	Token    string `json:"token"`
	Type     string `json:"type"`
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
	*internal.StatusResponse
	*ResponseUser `json:"user"`
}

type ResponseUser struct {
	ID    uint   `json:"id"`
	Token string `json:"token"`
	Type  string `json:"type"`
}

type ResponseAccount struct {
	*internal.StatusResponse
	User struct {
		Account AccountInfo `json:"account"`
	} `json:"user"`
}

type ResponseAccountCompany struct {
	*internal.StatusResponse
	User struct {
		Account CompanyInfo `json:"account"`
	} `json:"user"`
}

// ================================
// PROFILE UPDATE STRUCTURES
// ================================

type TokenUpdateProfile struct {
	*TokenAccess
	Profile struct {
		FullName string `json:"full_name"`
		Email    string `json:"email"`
		Phone    string `json:"phone"`
		Photo    string `json:"photo"`
	} `json:"profile"`
}

// ================================
// BALANCE STRUCTURES
// ================================

type TokenTopUpBalance struct {
	*TokenAccess
	Amount float64 `json:"amount"`
}

type TokenBalanceHistory struct {
	*TokenAccess
	Limit  int `json:"limit"`
	Offset int `json:"offset"`
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
	*internal.StatusResponse
	Transactions []BalanceHistoryItem `json:"transactions"`
	Total        int                  `json:"total"`
}

// ================================
// ORDER STRUCTURES
// ================================

type TokenOrdersList struct {
	*TokenAccess
	Status string `json:"status"` // all, pending, in_progress, completed, cancelled
	Limit  int    `json:"limit"`
	Offset int    `json:"offset"`
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
	*internal.StatusResponse
	Orders []OrderInfo `json:"orders"`
	Total  int         `json:"total"`
}

type ResponseOrderAction struct {
	*internal.StatusResponse
	Order   OrderInfo `json:"order"`
	Message string    `json:"message"`
}

// ================================
// WORKER COMPLETION
// ================================

type WorkerCompleteOrder struct {
	Token   string `json:"token"`
	Message string `json:"message"`
}

type ResponseWorkerComplete struct {
	*internal.StatusResponse
	Order   OrderInfo `json:"order"`
	Message string    `json:"message"`
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
	*internal.StatusResponse
	Reviews []ReviewInfo `json:"reviews"`
	Total   int          `json:"total"`
}

// ================================
// COMPANY STATS
// ================================

type TokenCompanyStats struct {
	*TokenAccess
}

type CompanyStats struct {
	TotalServices    int     `json:"total_services"`
	ActiveOrders     int     `json:"active_orders"`
	CompletedOrders  int     `json:"completed_orders"`
	TotalEarnings    float64 `json:"total_earnings"`
	AverageRating    float64 `json:"average_rating"`
	TotalReviews     int     `json:"total_reviews"`
	BalanceAvailable float64 `json:"balance_available"`
}

type ResponseCompanyStats struct {
	*internal.StatusResponse
	Stats CompanyStats `json:"stats"`
}

// ================================
// NOTIFICATION STRUCTURES
// ================================

type TokenNotificationsList struct {
	*TokenAccess
	IsRead *bool `json:"is_read"` // nil = all, true = read, false = unread
	Limit  int   `json:"limit"`
	Offset int   `json:"offset"`
}

type NotificationInfo struct {
	ID        uint   `json:"id"`
	Title     string `json:"title"`
	Message   string `json:"message"`
	Type      string `json:"type"`
	IsRead    bool   `json:"is_read"`
	OrderID   *uint  `json:"order_id"`
	CreatedAt string `json:"created_at"`
}

type ResponseNotificationsList struct {
	*internal.StatusResponse
	Notifications []NotificationInfo `json:"notifications"`
	Total         int                `json:"total"`
	UnreadCount   int                `json:"unread_count"`
}

type TokenMarkNotificationRead struct {
	*TokenAccess
	NotificationID uint `json:"notification_id"`
}

// ================================
// CARD UPDATE STRUCTURE
// ================================
