import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Wallet, Plus, Minus, CreditCard } from 'lucide-react';

interface BalanceCardProps {
  balance: number;
  userType: 'client' | 'company';
  onDeposit?: (amount: number) => void;
  onWithdraw?: (amount: number) => void;
  isLoading?: boolean;
}

const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  userType,
  onDeposit,
  onWithdraw,
  isLoading = false
}) => {
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (amount > 0 && onDeposit) {
      onDeposit(amount);
      setDepositAmount('');
      setDepositOpen(false);
    }
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (amount > 0 && amount <= balance && onWithdraw) {
      onWithdraw(amount);
      setWithdrawAmount('');
      setWithdrawOpen(false);
    }
  };

  const quickAmounts = [100, 500, 1000, 5000];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Баланс
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {balance.toLocaleString('ru-RU')} ₽
          </div>
          <p className="text-gray-600">
            {userType === 'client' ? 'Доступно для оплаты услуг' : 'Доступно для вывода'}
          </p>
        </div>

        <div className="flex gap-2">
          {/* Кнопка пополнения (только для клиентов) */}
          {userType === 'client' && (
            <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1 bg-green-600 hover:bg-green-700" disabled={isLoading}>
                  <Plus className="w-4 h-4 mr-2" />
                  Пополнить
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Пополнение баланса</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="depositAmount">Сумма пополнения (₽)</Label>
                    <Input
                      id="depositAmount"
                      type="number"
                      placeholder="Введите сумму"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      min="1"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <Label>Быстрый выбор:</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {quickAmounts.map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          onClick={() => setDepositAmount(amount.toString())}
                          className="text-sm"
                        >
                          {amount} ₽
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Способ оплаты</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      В демо-версии деньги зачисляются мгновенно. 
                      В реальной системе здесь будет интеграция с платежными системами.
                    </p>
                  </div>

                  <Button 
                    onClick={handleDeposit}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={!depositAmount || parseFloat(depositAmount) <= 0 || isLoading}
                  >
                    {isLoading ? 'Обработка...' : `Пополнить на ${depositAmount || '0'} ₽`}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Кнопка вывода (только для компаний) */}
          {userType === 'company' && balance > 0 && (
            <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1" disabled={isLoading}>
                  <Minus className="w-4 h-4 mr-2" />
                  Вывести
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Вывод средств</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="withdrawAmount">Сумма вывода (₽)</Label>
                    <Input
                      id="withdrawAmount"
                      type="number"
                      placeholder="Введите сумму"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      min="1"
                      max={balance}
                      step="0.01"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Доступно: {balance.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>

                  <div>
                    <Label>Быстрый выбор:</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <Button
                        variant="outline"
                        onClick={() => setWithdrawAmount((balance * 0.25).toFixed(2))}
                        className="text-sm"
                      >
                        25%
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setWithdrawAmount((balance * 0.5).toFixed(2))}
                        className="text-sm"
                      >
                        50%
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setWithdrawAmount(balance.toString())}
                        className="text-sm"
                      >
                        Все
                      </Button>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Вывод средств в демо-версии происходит мгновенно. 
                      В реальной системе обработка может занять от 1 до 3 рабочих дней.
                    </p>
                  </div>

                  <Button 
                    onClick={handleWithdraw}
                    variant="outline"
                    className="w-full"
                    disabled={
                      !withdrawAmount || 
                      parseFloat(withdrawAmount) <= 0 || 
                      parseFloat(withdrawAmount) > balance || 
                      isLoading
                    }
                  >
                    {isLoading ? 'Обработка...' : `Вывести ${withdrawAmount || '0'} ₽`}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceCard;
