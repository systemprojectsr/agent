package repository

import (
	"core/internal/api"
	"core/internal/database"
	"core/internal/security"
	"errors"
	"fmt"
	"gorm.io/gorm"
)

type CompanyRepository interface {
	Save(company *database.CompanyDB)
	ExistsByEmail(email string) (exists bool, existsClient bool, companyDB database.CompanyDB)
	GetByID(id uint) (*database.CompanyDB, error)
	CheckPassword(email string, passwordHash string) (database.CompanyDB, error)
	SaveCard(card *database.Card) bool
	PreloadDB(name string, company *database.CompanyDB, limit int, page int)
	DeleteCard(id int) bool
	Update(company *database.CompanyDB) error
	GetCompanyStats(companyID uint) (*api.CompanyStats, error)
}

type companyRepository struct {
	db *gorm.DB
}

func (r *companyRepository) GetCompanyStats(companyID uint) (*api.CompanyStats, error) {
	var (
		totalOrders      int64
		activeOrders     int64
		completedOrders  int64
		totalRevenue     float64
		averageRating    float64
		reviewCount      int64
		totalServices    int64
		balanceAvailable float64
	)

	// Подсчет общего количества заказов
	if err := r.db.Model(&database.Order{}).
		Where("company_id = ?", companyID).
		Count(&totalOrders).Error; err != nil {
		return nil, err
	}

	// Подсчет активных заказов
	if err := r.db.Model(&database.Order{}).
		Where("company_id = ? AND status IN ?", companyID, []string{"created", "paid", "in_progress"}).
		Count(&activeOrders).Error; err != nil {
		return nil, err
	}

	// Подсчет завершенных заказов
	if err := r.db.Model(&database.Order{}).
		Where("company_id = ? AND status = ?", companyID, "finished").
		Count(&completedOrders).Error; err != nil {
		return nil, err
	}

	// Подсчет общей выручки по завершенным заказам
	if err := r.db.Model(&database.Order{}).
		Where("company_id = ? AND status = ?", companyID, "finished").
		Select("COALESCE(SUM(amount), 0)").Scan(&totalRevenue).Error; err != nil {
		return nil, err
	}

	// Средний рейтинг
	if err := r.db.Model(&database.Review{}).
		Where("company_id = ?", companyID).
		Select("COALESCE(AVG(rating), 0)").Scan(&averageRating).Error; err != nil {
		return nil, err
	}

	// Количество отзывов
	if err := r.db.Model(&database.Review{}).
		Where("company_id = ?", companyID).
		Count(&reviewCount).Error; err != nil {
		return nil, err
	}

	// Количество услуг (cards)
	if err := r.db.Model(&database.Card{}).
		Where("company_id = ?", companyID).
		Count(&totalServices).Error; err != nil {
		return nil, err
	}

	// Баланс компании
	if err := r.db.Model(&database.CompanyDB{}).
		Where("id = ?", companyID).
		Select("COALESCE(balance, 0)").Scan(&balanceAvailable).Error; err != nil {
		return nil, err
	}

	return &api.CompanyStats{
		TotalServices:    int(totalServices),
		TotalOrders:      int(totalOrders),
		ActiveOrders:     int(activeOrders),
		CompletedOrders:  int(completedOrders),
		TotalRevenue:     totalRevenue,
		TotalEarnings:    totalRevenue, // Если нужно считать TotalEarnings = TotalRevenue
		AverageRating:    averageRating,
		TotalReviews:     int(reviewCount),
		ReviewCount:      int(reviewCount),
		BalanceAvailable: balanceAvailable,
	}, nil
}

func (repository *companyRepository) PreloadDB(name string, company *database.CompanyDB, limit int, page int) {
	query := repository.db

	if limit > 0 {
		offset := page * limit
		query = query.Preload(name, func(db *gorm.DB) *gorm.DB {
			return db.Limit(limit).Offset(offset)
		})
	} else {
		query = query.Preload(name)
	}

	query.First(&company, company.ID)
}

func (repository *companyRepository) Save(company *database.CompanyDB) {
	repository.db.Save(company)
}

func (repository *companyRepository) SaveCard(card *database.Card) bool {
	resp := repository.db.Save(card)
	if resp != nil {
		return true
	} else {
		return false
	}
}

func (repository *companyRepository) DeleteCard(id int) bool {
	resp := repository.db.Delete(&database.Card{}, id)
	if resp != nil {
		return true
	} else {
		return false
	}
}

func (repository *companyRepository) ExistsByEmail(email string) (exists bool, existsClient bool, companyDB database.CompanyDB) {
	var company database.CompanyDB
	var client database.ClientDB
	result := repository.db.Model(&database.CompanyDB{}).Where("email = ?", email).First(&company)
	exists = !errors.Is(result.Error, gorm.ErrRecordNotFound)
	if exists == false {
		result = repository.db.Model(&database.ClientDB{}).Where("email = ?", email).First(&client)
		existsClient = !errors.Is(result.Error, gorm.ErrRecordNotFound)
	}
	return exists, existsClient, company
}

func (repository *companyRepository) GetByID(id uint) (*database.CompanyDB, error) {
	var company database.CompanyDB

	result := repository.db.Model(&database.CompanyDB{}).Where("id = ?", id).First(&company)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("company with ID %d not found", id)
		}
		return nil, result.Error
	}
	return &company, nil
}

func (repository *companyRepository) CheckPassword(email string, password string) (database.CompanyDB, error) {
	ok, _, dbUser := repository.ExistsByEmail(email)
	if ok {
		// Используем security.CheckPassword для проверки bcrypt хеша
		if err := security.CheckPassword(password, dbUser.PasswordHash); err == nil {
			return dbUser, nil
		}
		return database.CompanyDB{}, errors.New("bad password")
	}
	return database.CompanyDB{}, errors.New("user not found")
}

func (repository *companyRepository) Update(company *database.CompanyDB) error {
	result := repository.db.Save(company)
	if result.Error != nil {
		return fmt.Errorf("failed to update company: %w", result.Error)
	}
	return nil
}

func NewCompanyRepository(db *gorm.DB) CompanyRepository {
	var repository CompanyRepository

	repository = &companyRepository{
		db: db,
	}

	return repository
}
