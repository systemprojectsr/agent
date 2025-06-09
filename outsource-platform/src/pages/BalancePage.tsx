import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { BalanceService } from '@/services/balanceService'
import { Transaction } from '@/config/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Wallet, 
  Plus, 
  Minus, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  CreditCard
} from 'lucide-react'

export const BalancePage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth()
  const [balance, setBalance] = useState<number>(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [depositDialog, setDepositDialog] = useState(false)
  const [withdrawDialog, setWithdrawDialog] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user?.token) {
      loadBalanceData()
    }
  }, [user])

  const loadBalanceData = async () => {
    if (!user?.token) return

    try {
      setLoading(true)
      
      // Загрузка баланса
      const balanceData = await BalanceService.getBalance(user.token)
      setBalance(balanceData)
      
      // Загрузка транзакций
      const transactionsData = await BalanceService.getTransactions(user.token, { limit: 50 })
      setTransactions(transactionsData.transactions)
    } catch (error) {
      console.error('Failed to load balance data:', error)
      setError('Ошибка загрузки данных баланса')
    } finally {
      setLoading(false)
    }
  }

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.token) return

    const amount = parseFloat(depositAmount)
    if (amount <= 0) {
      setError('Сумма должна быть больше 0')
      return
    }

    setError('')
    setSuccess('')
    setActionLoading(true)

    try {
      const newBalance = await BalanceService.depositBalance(user.token, amount)
      setBalance(newBalance)
      setSuccess(`Баланс успешно пополнен на ${amount.toLocaleString('ru-RU')} ₽`)
      setDepositDialog(false)
      setDepositAmount('')
      await loadBalanceData()
      await refreshProfile()
    } catch (err: any) {
      setError(err.message || 'Ошибка пополнения баланса')
    } finally {
      setActionLoading(false)
    }
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.token) return

    const amount = parseFloat(withdrawAmount)
    if (amount <= 0) {
      setError('Сумма должна быть больше 0')
      return
    }

    if (amount > balance) {
      setError('Недостаточно средств на балансе')
      return
    }

    setError('')
    setSuccess('')
    setActionLoading(true)

    try {
      const newBalance = await BalanceService.withdrawBalance(user.token, amount)
      setBalance(newBalance)
      setSuccess(`Заявка на вывод ${amount.toLocaleString('ru-RU')} ₽ принята`)
      setWithdrawDialog(false)
      setWithdrawAmount('')
      await loadBalanceData()
      await refreshProfile()
    } catch (err: any) {
      setError(err.message || 'Ошибка вывода средств')
    } finally {
      setActionLoading(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowUpCircle className="h-4 w-4 text-green-600" />
      case 'withdraw':
        return <ArrowDownCircle className="h-4 w-4 text-red-600" />
      case 'payment':
        return <ArrowDownCircle className="h-4 w-4 text-blue-600" />
      case 'refund':
        return <ArrowUpCircle className="h-4 w-4 text-orange-600" />
      default:
        return <RefreshCw className="h-4 w-4 text-gray-600" />
    }
  }

  const getTransactionBadge = (type: string) => {
    const variants: any = {
      deposit: 'default',
      withdraw: 'destructive',
      payment: 'secondary',
      refund: 'outline'
    }

    const labels: any = {
      deposit: 'Пополнение',
      withdraw: 'Вывод',
      payment: 'Оплата',
      refund: 'Возврат'
    }

    return (
      <Badge variant={variants[type] || 'secondary'} className="flex items-center gap-1">
        {getTransactionIcon(type)}
        {labels[type] || type}
      </Badge>
    )
  }

  const quickDepositAmounts = [1000, 2500, 5000, 10000]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Загрузка данных баланса...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Заголовок */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Баланс</h1>
            <p className="text-gray-600">Управление финансами и транзакциями</p>
          </div>

          {/* Уведомления */}
          {success && (
            <Alert className="mb-6" variant="default">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-6" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Основная информация о балансе */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Текущий баланс
                </CardTitle>
                <CardDescription>Доступные средства на вашем счете</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-4">
                    {balance.toLocaleString('ru-RU')} ₽
                  </div>
                  
                  <div className="flex justify-center gap-4">
                    <Dialog open={depositDialog} onOpenChange={setDepositDialog}>
                      <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Пополнить
                        </Button>
                      </DialogTrigger>
                    </Dialog>

                    <Dialog open={withdrawDialog} onOpenChange={setWithdrawDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                          <Minus className="h-4 w-4" />
                          Вывести
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Быстрая статистика */}
            <Card>
              <CardHeader>
                <CardTitle>Статистика</CardTitle>
                <CardDescription>Основные показатели</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Пополнения</span>
                  </div>
                  <span className="font-medium">
                    {transactions
                      .filter(t => t.type === 'deposit')
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toLocaleString('ru-RU')} ₽
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Расходы</span>
                  </div>
                  <span className="font-medium">
                    {transactions
                      .filter(t => t.type === 'payment' || t.type === 'withdraw')
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toLocaleString('ru-RU')} ₽
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Транзакций</span>
                  </div>
                  <span className="font-medium">{transactions.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* История транзакций */}
          <Card>
            <CardHeader>
              <CardTitle>История транзакций</CardTitle>
              <CardDescription>Все ваши финансовые операции</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    Нет транзакций
                  </h3>
                  <p className="text-gray-600 mb-4">
                    История транзакций появится после первой операции
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Тип</TableHead>
                      <TableHead>Описание</TableHead>
                      <TableHead>Сумма</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Дата</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {getTransactionBadge(transaction.type)}
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell className={
                          transaction.type === 'deposit' || transaction.type === 'refund'
                            ? 'text-green-600 font-medium'
                            : 'text-red-600 font-medium'
                        }>
                          {transaction.type === 'deposit' || transaction.type === 'refund' ? '+' : '-'}
                          {transaction.amount.toLocaleString('ru-RU')} ₽
                        </TableCell>
                        <TableCell>
                          <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                            {transaction.status === 'completed' ? 'Завершено' : 'В обработке'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(transaction.created_at).toLocaleDateString('ru-RU', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Диалог пополнения */}
          <Dialog open={depositDialog} onOpenChange={setDepositDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Пополнить баланс</DialogTitle>
                <DialogDescription>
                  Добавьте средства на ваш счет для оплаты услуг
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleDeposit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deposit-amount">Сумма пополнения (₽)</Label>
                  <Input
                    id="deposit-amount"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="1000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Быстрый выбор суммы</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {quickDepositAmounts.map(amount => (
                      <Button
                        key={amount}
                        type="button"
                        variant="outline"
                        onClick={() => setDepositAmount(amount.toString())}
                        className="h-12"
                      >
                        {amount.toLocaleString('ru-RU')} ₽
                      </Button>
                    ))}
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDepositDialog(false)}
                    disabled={actionLoading}
                  >
                    Отмена
                  </Button>
                  <Button type="submit" disabled={actionLoading}>
                    {actionLoading ? 'Пополнение...' : 'Пополнить баланс'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Диалог вывода */}
          <Dialog open={withdrawDialog} onOpenChange={setWithdrawDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Вывод средств</DialogTitle>
                <DialogDescription>
                  Выведите средства с вашего баланса. Доступно: {balance.toLocaleString('ru-RU')} ₽
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleWithdraw} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="withdraw-amount">Сумма вывода (₽)</Label>
                  <Input
                    id="withdraw-amount"
                    type="number"
                    min="1"
                    max={balance}
                    step="0.01"
                    placeholder="500"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    required
                  />
                </div>

                <Alert>
                  <CreditCard className="h-4 w-4" />
                  <AlertDescription>
                    Вывод средств обрабатывается в течение 1-3 рабочих дней
                  </AlertDescription>
                </Alert>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setWithdrawDialog(false)}
                    disabled={actionLoading}
                  >
                    Отмена
                  </Button>
                  <Button type="submit" disabled={actionLoading}>
                    {actionLoading ? 'Обработка...' : 'Вывести средства'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
