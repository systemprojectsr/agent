package service

import (
	"core/internal"
	"core/internal/api"
	"core/internal/database"
	"core/internal/database/repository"
	"core/internal/security"
	"errors"
	"strconv"
)

type CompanyService interface {
	Signup(request *api.UserCompanyRegister) (database.CompanyDB, error)
	SignupSimple(request *api.CompanyRegisterRequest) (database.CompanyDB, error)
	GetCompany(id uint) (database.CompanyDB, error)
	Login(request *api.GeneralAuth) (dbUser database.CompanyDB, jwtToken string, err error)
	LoginSimple(request *api.LoginRequest) (database.CompanyDB, error)
	AccessByToken(request *api.TokenAccess) (*api.ResponseSuccessAccess, database.CompanyDB, error)
	CreateCard(request *api.TokenCreateCard) (error, database.Card)
	ListCard(request *api.TokenListCard, limit string, page string) (error, []database.Card)
	DeleteCard(request *api.TokenDeleteCard) (error, bool)
	UpdateProfile(companyID uint, profile api.ClientProfileInfo) error
	GetCompanyStats(companyID uint) (*api.CompanyStats, error)
	UpdateCard(companyID uint, cardID uint, cardData api.CardInfo) error
}

type companyService struct {
	repository repository.CompanyRepository
}

func (service *companyService) Signup(request *api.UserCompanyRegister) (database.CompanyDB, error) {
	exists, existsCompany, _ := service.repository.ExistsByEmail(request.CompanyRegister.CompanyInfoPost.Email)
	if exists || existsCompany {
		return database.CompanyDB{}, errors.New("email already exists")
	}

	company := &database.CompanyDB{
		CompanyName:   request.CompanyRegister.CompanyInfoPost.CompanyName,
		FullName:      request.CompanyRegister.CompanyInfoPost.FullName,
		PositionAgent: request.CompanyRegister.CompanyInfoPost.PositionAgent,
		IDCompany:     request.CompanyRegister.CompanyInfoPost.IDCompany,
		Email:         request.CompanyRegister.CompanyInfoPost.Email,
		Phone:         request.CompanyRegister.CompanyInfoPost.Phone,
		Address:       request.CompanyRegister.CompanyInfoPost.Address,
		TypeService:   request.CompanyRegister.CompanyInfoPost.TypeService,
		PasswordHash:  request.CompanyRegister.CompanyInfoPost.PasswordHash,
		Photo:         request.CompanyRegister.CompanyInfoPost.Photo,
		Documents:     request.CompanyRegister.CompanyInfoPost.Documents,
		Stars:         5,
		Type:          "company",
	}
	service.repository.Save(company)
	return *company, nil
}

func (service *companyService) SignupSimple(request *api.CompanyRegisterRequest) (database.CompanyDB, error) {
	exists, existsCompany, _ := service.repository.ExistsByEmail(request.Email)
	if exists || existsCompany {
		return database.CompanyDB{}, errors.New("email already exists")
	}

	// Хешируем пароль
	hashedPassword, err := security.HashPassword(request.Password)
	if err != nil {
		return database.CompanyDB{}, errors.New("failed to hash password")
	}

	company := &database.CompanyDB{
		CompanyName:  request.CompanyName,
		FullName:     request.CompanyName, // Используем company_name как full_name по умолчанию
		Email:        request.Email,
		Phone:        request.Phone,
		PasswordHash: hashedPassword,
		Photo:        request.Photo,
		Website:      request.Website,
		Description:  request.Description,
		Stars:        5,
		ReviewCount:  0,
		Type:         "company",
		Balance:      0,
	}
	service.repository.Save(company)
	return *company, nil
}

func (service *companyService) LoginSimple(request *api.LoginRequest) (database.CompanyDB, error) {
	dbUser, err := service.repository.CheckPassword(request.Email, request.Password)
	if err != nil {
		return database.CompanyDB{}, err
	}
	return dbUser, nil
}

func (service *companyService) GetCompany(id uint) (database.CompanyDB, error) {
	company, err := service.repository.GetByID(id)
	if err != nil {
		return database.CompanyDB{}, err
	}
	return *company, nil
}

func (service *companyService) Login(request *api.GeneralAuth) (dbUser database.CompanyDB, jwtToken string, err error) {
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

func (service *companyService) AccessByToken(request *api.TokenAccess) (*api.ResponseSuccessAccess, database.CompanyDB, error) {
	result, tokenStructure := security.CheckToken(request.User.Login.Token)
	company, err := service.GetCompany(uint(tokenStructure["accessID"].(float64)))
	if err != nil {
		return nil, company, err
	}

	if result {
		response := api.ResponseSuccessAccess{
			StatusResponse: internal.StatusResponse{Status: "success"},
			ResponseUser: api.ResponseUser{
				ID:    company.ID,
				Token: request.User.Login.Token,
				Type:  company.Type,
			},
		}
		return &response, company, nil
	} else {
		response := api.ResponseSuccessAccess{
			StatusResponse: internal.StatusResponse{Status: "success"},
			ResponseUser: api.ResponseUser{
				ID:    company.ID,
				Token: "expired",
				Type:  company.Type,
			},
		}
		return &response, company, nil
	}
}

func (service *companyService) CreateCard(request *api.TokenCreateCard) (error, database.Card) {
	result, tokenStructure := security.CheckToken(request.TokenAccess.User.Login.Token)
	company, err := service.GetCompany(uint(tokenStructure["accessID"].(float64)))
	if err != nil {
		return err, database.Card{}
	}
	if result {
		card := database.Card{
			Title:       request.Card.Title,
			Description: request.Card.Description,
			Category:    request.Card.Category,
			Location:    request.Card.Location,
			Price:       request.Card.Price,
			IsActive:    true,
			CompanyID:   company.ID,
		}
		resp := service.repository.SaveCard(&card)
		if resp {
			return nil, card
		} else {
			return errors.New("resp in CreateCard()"), database.Card{}
		}
	} else {
		return err, database.Card{}
	}
}

func (service *companyService) DeleteCard(request *api.TokenDeleteCard) (error, bool) {
	result, tokenStructure := security.CheckToken(request.TokenAccess.User.Login.Token)
	_, err := service.GetCompany(uint(tokenStructure["accessID"].(float64)))
	if err != nil {
		return err, false
	}
	if result {
		resp := service.repository.DeleteCard(int(request.CardID))
		if resp {
			return nil, resp
		} else {
			return err, false
		}
	} else {
		return err, false
	}
}

func (service *companyService) ListCard(request *api.TokenListCard, limit string, page string) (error, []database.Card) {
	result, tokenStructure := security.CheckToken(request.TokenAccess.User.Login.Token)
	company, err := service.GetCompany(uint(tokenStructure["accessID"].(float64)))
	if err != nil {
		return err, []database.Card{}
	}
	if result {
		limitI, err := strconv.Atoi(limit)
		if err != nil && limit != "" {
			return err, []database.Card{}
		}
		pageI, err := strconv.Atoi(page)
		if err != nil && page != "" {
			return err, []database.Card{}
		}
		service.repository.PreloadDB("Cards", &company, limitI, pageI)
		return nil, company.Cards
	} else {
		return nil, []database.Card{}
	}
}

func (service *companyService) UpdateProfile(companyID uint, profile api.ClientProfileInfo) error {
	company, err := service.GetCompany(companyID)
	if err != nil {
		return err
	}

	// Обновляем поля профиля
	if profile.FullName != "" {
		company.FullName = profile.FullName
	}
	if profile.Email != "" {
		company.Email = profile.Email
	}
	if profile.Phone != "" {
		company.Phone = profile.Phone
	}
	if profile.Photo != "" {
		company.Photo = profile.Photo
	}

	return service.repository.Update(&company)
}

func (service *companyService) GetCompanyStats(companyID uint) (*api.CompanyStats, error) {
	stats, err := service.repository.GetCompanyStats(companyID)
	if err != nil {
		return nil, err
	}
	return stats, nil
}

func (service *companyService) UpdateCard(companyID uint, cardID uint, cardData api.CardInfo) error {
	// Проверяем, что карточка принадлежит компании
	// Здесь потребуется метод в card repository для обновления
	// Пока возвращаем заглушку
	return errors.New("method not implemented yet - need card repository update methods")
}

func NewCompanyService(repository repository.CompanyRepository) CompanyService {
	return &companyService{
		repository: repository,
	}
}
