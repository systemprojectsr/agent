package controller

import (
	"core/internal"
	"core/internal/api"
	"core/internal/security"
	"core/internal/service"
	"github.com/gin-gonic/gin"
	"net/http"
)

type ClientController interface {
	Signup(c *gin.Context)
	Login(c *gin.Context)
	LoginOld(c *gin.Context, request *api.GeneralAuth)
	GetAccount(c *gin.Context, request *api.TokenAccess)
	UpdateProfile(c *gin.Context, request *api.TokenUpdateClientProfile)
}

type clientController struct {
	service service.ClientService
}

func (controller clientController) Signup(c *gin.Context) {
	request := &api.ClientRegisterRequest{}
	if err := c.ShouldBind(request); err != nil {
		api.GetErrorJSON(c, http.StatusBadRequest, "JSON is invalid: "+err.Error())
		return
	}
	
	// Валидация обязательных полей
	if request.Email == "" || request.Password == "" || request.FullName == "" || request.Phone == "" {
		api.GetErrorJSON(c, http.StatusBadRequest, "Missing required fields: email, password, full_name, phone")
		return
	}
	
	client, err := controller.service.SignupSimple(request)
	if err != nil {
		api.GetErrorJSON(c, http.StatusPreconditionFailed, err.Error())
		return
	}
	tokenGenerated := security.CreateToken(false, client.ID, internal.LifeTimeJWT)
	c.JSON(http.StatusOK, api.ResponseSuccessAccess{
		StatusResponse: internal.StatusResponse{Status: "success"},
		ResponseUser: api.ResponseUser{
			ID:    client.ID,
			Token: tokenGenerated,
			Type:  client.Type,
		},
	})
}

func (controller clientController) Login(c *gin.Context) {
	request := &api.LoginRequest{}
	if err := c.ShouldBind(request); err != nil {
		api.GetErrorJSON(c, http.StatusBadRequest, "JSON is invalid: "+err.Error())
		return
	}
	
	// Валидация обязательных полей
	if request.Email == "" || request.Password == "" {
		api.GetErrorJSON(c, http.StatusBadRequest, "Missing required fields: email, password")
		return
	}
	
	dbUser, err := controller.service.LoginSimple(request)
	if err != nil {
		api.GetErrorJSON(c, http.StatusPreconditionFailed, err.Error())
		return
	}
	
	jwtToken := security.CreateToken(false, dbUser.ID, internal.LifeTimeJWT)
	if jwtToken == "" {
		api.GetErrorJSON(c, http.StatusBadRequest, "the created jwt was faulty")
		return
	}
	c.JSON(http.StatusOK, api.ResponseSuccessAccess{
		StatusResponse: internal.StatusResponse{Status: "success"},
		ResponseUser: api.ResponseUser{
			ID:    dbUser.ID,
			Token: jwtToken,
			Type:  dbUser.Type,
		},
	})
}

func (controller clientController) LoginOld(c *gin.Context, request *api.GeneralAuth) {
	dbUser, jwtToken, err := controller.service.Login(request)
	if err != nil {
		api.GetErrorJSON(c, http.StatusBadRequest, "the created jwt was faulty")
		return
	}
	c.JSON(http.StatusOK, api.ResponseSuccessAccess{
		StatusResponse: internal.StatusResponse{Status: "success"},
		ResponseUser: api.ResponseUser{
			ID:    dbUser.ID,
			Token: jwtToken,
			Type:  dbUser.Type,
		},
	})
}

func (controller clientController) GetAccount(c *gin.Context, request *api.TokenAccess) {
	response, user, err := controller.service.AccessByToken(request)
	if err != nil {
		api.GetErrorJSON(c, http.StatusBadRequest, "The token is incorrect")
		return
	}
	if response.ResponseUser.Token == "expired" {
		api.GetErrorJSON(c, http.StatusForbidden, "The token has expired")
		return
	}
	c.JSON(http.StatusOK, api.ResponseAccount{
		StatusResponse: internal.StatusResponse{Status: "success"},
		User: struct {
			Account api.AccountInfo `json:"account"`
		}{Account: api.AccountInfo{
			ID:       user.ID,
			FullName: user.FullName,
			Email:    user.Email,
			Phone:    user.Phone,
			Photo:    user.Photo,
			Token:    response.ResponseUser.Token,
			Type:     user.Type,
			Balance:  user.Balance,
		}},
	})
}

func (controller clientController) UpdateProfile(c *gin.Context, request *api.TokenUpdateClientProfile) {
	// Извлекаем информацию о пользователе из токена
	userInfo, err := ExtractUserFromToken(request.TokenAccess.User.Login.Token)
	if err != nil {
		api.GetErrorJSON(c, http.StatusUnauthorized, "Invalid token")
		return
	}

	// Обновляем профиль через сервис
	updatedUser, err := controller.service.UpdateProfile(userInfo.UserID, request.Profile)
	if err != nil {
		api.GetErrorJSON(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, api.ResponseAccount{
		StatusResponse: internal.StatusResponse{Status: "success"},
		User: struct {
			Account api.AccountInfo `json:"account"`
		}{Account: api.AccountInfo{
			ID:       updatedUser.ID,
			FullName: updatedUser.FullName,
			Email:    updatedUser.Email,
			Phone:    updatedUser.Phone,
			Photo:    updatedUser.Photo,
			Token:    request.TokenAccess.User.Login.Token,
			Type:     updatedUser.Type,
			Balance:  updatedUser.Balance,
		}},
	})
}

func NewClientController(service service.ClientService) ClientController {
	return &clientController{
		service: service,
	}
}
