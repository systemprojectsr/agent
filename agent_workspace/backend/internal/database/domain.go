package database

import (
	"github.com/lib/pq"
	"gorm.io/gorm"
	"time"
)

type ClientDB struct {
	gorm.Model
	ID           uint `gorm:"primaryKey;autoIncrement"`
	FullName     string
	Email        string `gorm:"unique"`
	Phone        string
	PasswordHash string
	Photo        string
	Type         string
	Permissions  pq.StringArray `gorm:"type:text[]"`
	Balance      float64        `gorm:"default:0"`
	Orders       []Order        `gorm:"foreignKey:ClientID"`
	Reviews      []Review       `gorm:"foreignKey:ClientID"`
}

type CompanyDB struct {
	gorm.Model
	ID            uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyName   string         `json:"company_name"`
	FullName      string         `json:"full_name"`
	PositionAgent string         `json:"position_agent"`
	IDCompany     string         `json:"id_company"`
	Email         string         `gorm:"unique" json:"email"`
	Phone         string         `json:"phone"`
	Address       string         `json:"address"`
	TypeService   string         `json:"type_service"`
	PasswordHash  string         `json:"password_hash"`
	Photo         string         `json:"photo"`
	Website       string         `json:"website"`
	Description   string         `json:"description"`
	Documents     pq.StringArray `gorm:"type:text[]" json:"documents"`
	Stars         float64        `gorm:"default:0" json:"stars"`
	ReviewCount   int            `gorm:"default:0" json:"review_count"`
	Type          string
	Permissions   pq.StringArray `gorm:"type:text[]" json:"permissions"`
	Balance       float64        `gorm:"default:0" json:"balance"`
	Cards         []Card         `gorm:"foreignKey:CompanyID" json:"cards"`
	Orders        []Order        `gorm:"foreignKey:CompanyID" json:"orders"`
	Reviews       []Review       `gorm:"foreignKey:CompanyID" json:"reviews"`
}

type Card struct {
	gorm.Model
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Price       float64   `json:"price"`
	Location    string    `json:"location"`
	Category    string    `json:"category"`
	IsActive    bool      `gorm:"default:true"`
	CompanyID   uint      `json:"company_id"`
	Company     CompanyDB `gorm:"foreignKey:CompanyID" json:"company"`
	Orders      []Order   `gorm:"foreignKey:CardID" json:"orders"`
}

type Order struct {
	gorm.Model
	ID                 uint                `gorm:"primaryKey;autoIncrement" json:"id"`
	ClientID           uint                `json:"client_id"`
	Client             ClientDB            `gorm:"foreignKey:ClientID" json:"client"`
	CompanyID          uint                `json:"company_id"`
	Company            CompanyDB           `gorm:"foreignKey:CompanyID" json:"company"`
	CardID             uint                `json:"card_id"`
	Card               Card                `gorm:"foreignKey:CardID" json:"card"`
	Amount             float64             `json:"amount"`
	Status             string              `gorm:"default:'created'" json:"status"`         // created, paid, in_progress, completed, finished, cancelled
	PaymentStatus      string              `gorm:"default:'pending'" json:"payment_status"` // pending, paid, refunded
	Description        string              `json:"description"`
	WorkerCompleteURL  string              `json:"worker_complete_url"` // Одноразовая ссылка для работника
	EscrowTransactions []EscrowTransaction `gorm:"foreignKey:OrderID" json:"escrow_transactions"`
	Notifications      []Notification      `gorm:"foreignKey:OrderID" json:"notifications"`
	CompletedAt        *time.Time          `json:"completed_at"`
}

type EscrowTransaction struct {
	gorm.Model
	ID       uint    `gorm:"primaryKey;autoIncrement" json:"id"`
	OrderID  uint    `json:"order_id"`
	Order    Order   `gorm:"foreignKey:OrderID" json:"order"`
	Amount   float64 `json:"amount"`
	Type     string  `json:"type"`      // hold, release, refund
	Status   string  `json:"status"`    // pending, completed, failed
	FromUser string  `json:"from_user"` // client, company, system
	ToUser   string  `json:"to_user"`   // client, company, escrow
}

type Review struct {
	gorm.Model
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	ClientID  uint      `json:"client_id"`
	Client    ClientDB  `gorm:"foreignKey:ClientID" json:"client"`
	CompanyID uint      `json:"company_id"`
	Company   CompanyDB `gorm:"foreignKey:CompanyID" json:"company"`
	OrderID   uint      `json:"order_id"`
	Order     Order     `gorm:"foreignKey:OrderID" json:"order"`
	Rating    int       `gorm:"check:rating >= 1 AND rating <= 5" json:"rating"`
	Comment   string    `json:"comment"`
}

type Notification struct {
	gorm.Model
	ID        uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID    uint   `json:"user_id"`   // ID клиента или компании
	UserType  string `json:"user_type"` // client, company
	OrderID   *uint  `json:"order_id"`
	Order     *Order `gorm:"foreignKey:OrderID" json:"order"`
	Title     string `json:"title"`
	Message   string `json:"message"`
	IsRead    bool   `gorm:"default:false" json:"is_read"`
	Type      string `json:"type"`       // order_update, payment, review, system
	RelatedID *uint  `json:"related_id"` // Общее поле для связи с различными сущностями
}

type BalanceTransaction struct {
	gorm.Model
	ID          uint    `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID      uint    `json:"user_id"`   // ID клиента или компании
	UserType    string  `json:"user_type"` // client, company
	Amount      float64 `json:"amount"`
	Type        string  `json:"type"`     // deposit, withdrawal, payment, refund
	Status      string  `json:"status"`   // pending, completed, failed
	OrderID     *uint   `json:"order_id"` // Связь с заказом, если транзакция связана с заказом
	Description string  `json:"description"`
}

type WorkerLink struct {
	gorm.Model
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	OrderID   uint      `json:"order_id"`
	Order     Order     `gorm:"foreignKey:OrderID" json:"order"`
	Token     string    `gorm:"unique" json:"token"`
	IsUsed    bool      `gorm:"default:false" json:"is_used"`
	ExpiresAt time.Time `json:"expires_at"`
}
