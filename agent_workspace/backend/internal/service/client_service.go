package service

import (
	"core/internal"
	"core/internal/api"
	"core/internal/database"
	"core/internal/database/repository"
	"core/internal/security"
	"errors"
)

type ClientService interface {
	Signup(request *api.ClientRegister) (database.ClientDB, error)
	SignupSimple(request *api.ClientRegisterRequest) (database.ClientDB, error)
	Login(request *api.GeneralAuth) (dbUser database.ClientDB, jwtToken string, err error)
	LoginSimple(request *api.LoginRequest) (database.ClientDB, error)
	GetClient(id uint) (database.ClientDB, error)
	AccessByToken(request *api.TokenAccess) (*api.ResponseSuccessAccess, database.ClientDB, error)
	UpdateProfile(userID uint, profile api.ClientProfileInfo) (database.ClientDB, error)
}

type clientService struct {
	repository repository.ClientRepository
}

func (service *clientService) Signup(request *api.ClientRegister) (database.ClientDB, error) {
	exists, existsCompany, _ := service.repository.ExistsByEmail(request.Client.RegisterInfoPost.Email)
	if exists || existsCompany {
		return database.ClientDB{}, errors.New("email already exists")
	}

	client := &database.ClientDB{
		FullName:     request.Client.RegisterInfoPost.FullName,
		Email:        request.Client.RegisterInfoPost.Email,
		Phone:        request.Client.RegisterInfoPost.Phone,
		PasswordHash: request.Client.RegisterInfoPost.PasswordHash,
		Photo:        request.Client.RegisterInfoPost.Photo,
		Type:         request.Client.RegisterInfoPost.Type,
	}
	service.repository.Save(client)
	return *client, nil
}

func (service *clientService) SignupSimple(request *api.ClientRegisterRequest) (database.ClientDB, error) {
	exists, existsCompany, _ := service.repository.ExistsByEmail(request.Email)
	if exists || existsCompany {
		return database.ClientDB{}, errors.New("email already exists")
	}

	// Хешируем пароль
	hashedPassword, err := security.HashPassword(request.Password)
	if err != nil {
		return database.ClientDB{}, errors.New("failed to hash password")
	}

	client := &database.ClientDB{
		FullName:     request.FullName,
		Email:        request.Email,
		Phone:        request.Phone,
		PasswordHash: hashedPassword,
		Photo:        request.Photo,
		Type:         "client",
		Balance:      0,
	}
	service.repository.Save(client)
	return *client, nil
}

func (service *clientService) LoginSimple(request *api.LoginRequest) (database.ClientDB, error) {
	dbUser, err := service.repository.CheckPassword(request.Email, request.Password)
	if err != nil {
		return database.ClientDB{}, err
	}
	return dbUser, nil
}

func (service *clientService) GetClient(id uint) (database.ClientDB, error) {
	client, err := service.repository.GetByID(id)
	if err != nil {
		return database.ClientDB{}, err
	}
	return *client, nil
}

func (service *clientService) Login(request *api.GeneralAuth) (dbUser database.ClientDB, jwtToken string, err error) {
	dbUser, err = service.repository.CheckPassword(request.GeneralLogin.GeneralLoginAttributes.Email, request.GeneralLogin.GeneralLoginAttributes.PasswordHash)
	if err != nil {
		return dbUser, "", err
	}
	jwtToken = security.CreateToken(dbUser.Type == "company", dbUser.ID, internal.LifeTimeJWT)
	if jwtToken == "" {
		return dbUser, "", errors.New("the created jwt was faulty")
	}
	return dbUser, jwtToken, nil
}

func (service *clientService) AccessByToken(request *api.TokenAccess) (*api.ResponseSuccessAccess, database.ClientDB, error) {
	result, tokenStructure := security.CheckToken(request.User.Login.Token)
	client, err := service.GetClient(uint(tokenStructure["accessID"].(float64)))
	if err != nil {
		return nil, client, err
	}

	if result {
		response := api.ResponseSuccessAccess{
			StatusResponse: internal.StatusResponse{Status: "success"},
			ResponseUser: api.ResponseUser{
				ID:    client.ID,
				Token: request.User.Login.Token,
				Type:  client.Type,
			},
		}
		return &response, client, nil
	} else {
		response := api.ResponseSuccessAccess{
			StatusResponse: internal.StatusResponse{Status: "success"},
			ResponseUser: api.ResponseUser{
				ID:    client.ID,
				Token: "expired",
				Type:  client.Type,
			},
		}
		return &response, client, nil
	}
}

func (service *clientService) UpdateProfile(userID uint, profile api.ClientProfileInfo) (database.ClientDB, error) {
	// Получаем текущего пользователя
	client, err := service.repository.GetByID(userID)
	if err != nil {
		return database.ClientDB{}, errors.New("user not found")
	}

	// Проверяем, не занят ли email другим пользователем
	if profile.Email != client.Email {
		exists, existsCompany, _ := service.repository.ExistsByEmail(profile.Email)
		if exists || existsCompany {
			return database.ClientDB{}, errors.New("email already exists")
		}
	}

	// Обновляем поля
	client.FullName = profile.FullName
	client.Email = profile.Email
	client.Phone = profile.Phone
	client.Photo = profile.Photo

	// Сохраняем изменения
	err = service.repository.Update(client)
	if err != nil {
		return database.ClientDB{}, errors.New("failed to update profile")
	}

	return *client, nil
}

func NewClientService(repository repository.ClientRepository) ClientService {
	return &clientService{
		repository: repository,
	}
}
