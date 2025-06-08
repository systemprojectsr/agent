package service

import (
	"core/internal/api"
	"core/internal/database"
	"core/internal/database/repository"
	"errors"
	"fmt"
	"time"
)

type BalanceService interface {
	GetClientBalance(clientID uint) (float64, error)
	GetCompanyBalance(companyID uint) (float64, error)
	DepositClientBalance(clientID uint, amount float64) error
	DepositCompanyBalance(companyID uint, amount float64) error
	WithdrawCompanyBalance(companyID uint, amount float64) error
	GetClientTransactions(clientID uint, page, limit int) ([]database.BalanceTransaction, error)
	GetCompanyTransactions(companyID uint, page, limit int) ([]database.BalanceTransaction, error)
	GetTransactionHistory(userID uint, userType string, limit, offset int) ([]api.BalanceHistoryItem, int, error)
}

type balanceService struct {
	balanceRepo repository.BalanceRepository
}

func (s *balanceService) GetClientBalance(clientID uint) (float64, error) {
	return s.balanceRepo.GetClientBalance(clientID)
}

func (s *balanceService) GetCompanyBalance(companyID uint) (float64, error) {
	return s.balanceRepo.GetCompanyBalance(companyID)
}

func (s *balanceService) DepositClientBalance(clientID uint, amount float64) error {
	if amount <= 0 {
		return errors.New("amount must be greater than 0")
	}

	// В реальной системе здесь была бы интеграция с платежным шлюзом
	// Пока просто добавляем деньги на счет
	err := s.balanceRepo.UpdateClientBalance(clientID, amount)
	if err != nil {
		return err
	}

	// Создаем транзакцию
	transaction := &database.BalanceTransaction{
		UserID:      clientID,
		UserType:    "client",
		Amount:      amount,
		Type:        "deposit",
		Status:      "completed",
		Description: fmt.Sprintf("Пополнение баланса на %.2f руб.", amount),
	}

	return s.balanceRepo.CreateTransaction(transaction)
}

func (s *balanceService) WithdrawCompanyBalance(companyID uint, amount float64) error {
	if amount <= 0 {
		return errors.New("amount must be greater than 0")
	}

	// Проверяем баланс
	balance, err := s.balanceRepo.GetCompanyBalance(companyID)
	if err != nil {
		return err
	}

	if balance < amount {
		return errors.New("insufficient balance")
	}

	// Списываем деньги
	err = s.balanceRepo.UpdateCompanyBalance(companyID, -amount)
	if err != nil {
		return err
	}

	// Создаем транзакцию
	transaction := &database.BalanceTransaction{
		UserID:      companyID,
		UserType:    "company",
		Amount:      -amount,
		Type:        "withdrawal",
		Status:      "completed",
		Description: fmt.Sprintf("Вывод средств %.2f руб.", amount),
	}

	return s.balanceRepo.CreateTransaction(transaction)
}

func (s *balanceService) GetClientTransactions(clientID uint, page, limit int) ([]database.BalanceTransaction, error) {
	offset := (page - 1) * limit
	return s.balanceRepo.GetTransactionsByUser(clientID, "client", limit, offset)
}

func (s *balanceService) GetCompanyTransactions(companyID uint, page, limit int) ([]database.BalanceTransaction, error) {
	offset := (page - 1) * limit
	return s.balanceRepo.GetTransactionsByUser(companyID, "company", limit, offset)
}

func (s *balanceService) DepositCompanyBalance(companyID uint, amount float64) error {
	if amount <= 0 {
		return errors.New("amount must be greater than 0")
	}

	// Добавляем деньги на счет компании
	err := s.balanceRepo.UpdateCompanyBalance(companyID, amount)
	if err != nil {
		return err
	}

	// Создаем транзакцию
	transaction := &database.BalanceTransaction{
		UserID:      companyID,
		UserType:    "company",
		Amount:      amount,
		Type:        "deposit",
		Status:      "completed",
		Description: fmt.Sprintf("Пополнение баланса на %.2f руб.", amount),
	}

	return s.balanceRepo.CreateTransaction(transaction)
}

func (s *balanceService) GetTransactionHistory(userID uint, userType string, limit, offset int) ([]api.BalanceHistoryItem, int, error) {
	transactions, err := s.balanceRepo.GetTransactionsByUser(userID, userType, limit, offset)
	if err != nil {
		return nil, 0, err
	}

	total, err := s.balanceRepo.GetTransactionCountByUser(userID, userType)
	if err != nil {
		return nil, 0, err
	}

	var historyItems []api.BalanceHistoryItem
	for _, transaction := range transactions {
		historyItems = append(historyItems, api.BalanceHistoryItem{
			ID:          transaction.ID,
			Amount:      transaction.Amount,
			Type:        transaction.Type,
			Status:      transaction.Status,
			Description: transaction.Description,
			CreatedAt:   transaction.CreatedAt.Format(time.RFC3339),
		})
	}

	return historyItems, total, nil
}

func NewBalanceService(balanceRepo repository.BalanceRepository) BalanceService {
	return &balanceService{balanceRepo: balanceRepo}
}
