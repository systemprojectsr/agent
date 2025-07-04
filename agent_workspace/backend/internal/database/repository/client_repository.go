package repository

import (
	"core/internal/database"
	"core/internal/security"
	"errors"
	"fmt"
	"gorm.io/gorm"
)

type ClientRepository interface {
	Save(client *database.ClientDB)
	ExistsByEmail(email string) (exists bool, existsCompany bool, clientDB database.ClientDB)
	GetByID(id uint) (*database.ClientDB, error)
	CheckPassword(email string, passwordHash string) (database.ClientDB, error)
	Update(client *database.ClientDB) error
}

type clientRepository struct {
	db *gorm.DB
}

func (repository *clientRepository) Save(client *database.ClientDB) {
	repository.db.Save(client)
}

func (repository *clientRepository) ExistsByEmail(email string) (exists bool, existsCompany bool, clientDB database.ClientDB) {
	var company database.CompanyDB
	var client database.ClientDB
	result := repository.db.Model(&database.ClientDB{}).Where("email = ?", email).First(&client)
	exists = !errors.Is(result.Error, gorm.ErrRecordNotFound)
	if exists == false {
		result = repository.db.Model(&database.CompanyDB{}).Where("email = ?", email).First(&company)
		existsCompany = !errors.Is(result.Error, gorm.ErrRecordNotFound)
	}
	return exists, existsCompany, client
}

func (repository *clientRepository) GetByID(id uint) (*database.ClientDB, error) {
	var client database.ClientDB

	result := repository.db.Model(&database.ClientDB{}).Where("id = ?", id).First(&client)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("client with ID %d not found", id)
		}
		return nil, result.Error
	}
	return &client, nil
}

func (repository *clientRepository) CheckPassword(email string, password string) (database.ClientDB, error) {
	ok, _, dbUser := repository.ExistsByEmail(email)
	if ok {
		// Используем security.CheckPassword для проверки bcrypt хеша
		if err := security.CheckPassword(password, dbUser.PasswordHash); err == nil {
			return dbUser, nil
		}
		return database.ClientDB{}, errors.New("bad password")
	}
	return database.ClientDB{}, errors.New("user not found")
}

func (repository *clientRepository) Update(client *database.ClientDB) error {
	result := repository.db.Save(client)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func NewClientRepository(db *gorm.DB) ClientRepository {
	var repository ClientRepository

	repository = &clientRepository{
		db: db,
	}

	return repository
}
