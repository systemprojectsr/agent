import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, User, Building } from 'lucide-react'

export const AuthPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentTab, setCurrentTab] = useState('login')
  const [userType, setUserType] = useState<'client' | 'company'>('client')
  
  const { login, registerClient, registerCompany } = useAuth()
  const navigate = useNavigate()

  // Состояние форм
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })

  const [clientForm, setClientForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    photo: ''
  })

  const [companyForm, setCompanyForm] = useState({
    company_name: '',
    email: '',
    phone: '',
    password: '',
    website: '',
    description: '',
    photo: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(loginForm.email, loginForm.password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Ошибка авторизации')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (userType === 'client') {
        await registerClient(clientForm)
      } else {
        await registerCompany(companyForm)
      }
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Добро пожаловать</h1>
          <p className="text-gray-600 mt-2">Войдите или создайте аккаунт</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Вход</TabsTrigger>
                <TabsTrigger value="register">Регистрация</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              {/* Вход */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Пароль</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Введите пароль"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Вход...' : 'Войти'}
                  </Button>
                </form>
              </TabsContent>

              {/* Регистрация */}
              <TabsContent value="register">
                <div className="space-y-4">
                  {/* Выбор типа пользователя */}
                  <div className="space-y-2">
                    <Label>Тип аккаунта</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={userType === 'client' ? 'default' : 'outline'}
                        onClick={() => setUserType('client')}
                        className="h-16 flex flex-col items-center justify-center"
                      >
                        <User className="h-5 w-5 mb-1" />
                        <span className="text-sm">Клиент</span>
                      </Button>
                      <Button
                        type="button"
                        variant={userType === 'company' ? 'default' : 'outline'}
                        onClick={() => setUserType('company')}
                        className="h-16 flex flex-col items-center justify-center"
                      >
                        <Building className="h-5 w-5 mb-1" />
                        <span className="text-sm">Компания</span>
                      </Button>
                    </div>
                  </div>

                  {/* Форма регистрации клиента */}
                  {userType === 'client' && (
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Полное имя</Label>
                        <Input
                          id="full_name"
                          placeholder="Иван Иванов"
                          value={clientForm.full_name}
                          onChange={(e) => setClientForm({ ...clientForm, full_name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="client_email">Email</Label>
                        <Input
                          id="client_email"
                          type="email"
                          placeholder="your@email.com"
                          value={clientForm.email}
                          onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="client_phone">Телефон</Label>
                        <Input
                          id="client_phone"
                          placeholder="+7 900 123-45-67"
                          value={clientForm.phone}
                          onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="client_password">Пароль</Label>
                        <div className="relative">
                          <Input
                            id="client_password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Введите пароль"
                            value={clientForm.password}
                            onChange={(e) => setClientForm({ ...clientForm, password: e.target.value })}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="client_photo">Фото (необязательно)</Label>
                        <Input
                          id="client_photo"
                          placeholder="https://example.com/photo.jpg"
                          value={clientForm.photo}
                          onChange={(e) => setClientForm({ ...clientForm, photo: e.target.value })}
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Регистрация...' : 'Зарегистрироваться как клиент'}
                      </Button>
                    </form>
                  )}

                  {/* Форма регистрации компании */}
                  {userType === 'company' && (
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="company_name">Название компании</Label>
                        <Input
                          id="company_name"
                          placeholder="ООО Рога и Копыта"
                          value={companyForm.company_name}
                          onChange={(e) => setCompanyForm({ ...companyForm, company_name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company_email">Email</Label>
                        <Input
                          id="company_email"
                          type="email"
                          placeholder="company@email.com"
                          value={companyForm.email}
                          onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company_phone">Телефон</Label>
                        <Input
                          id="company_phone"
                          placeholder="+7 900 123-45-67"
                          value={companyForm.phone}
                          onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company_password">Пароль</Label>
                        <div className="relative">
                          <Input
                            id="company_password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Введите пароль"
                            value={companyForm.password}
                            onChange={(e) => setCompanyForm({ ...companyForm, password: e.target.value })}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website">Веб-сайт (необязательно)</Label>
                        <Input
                          id="website"
                          placeholder="https://example.com"
                          value={companyForm.website}
                          onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Описание (необязательно)</Label>
                        <Textarea
                          id="description"
                          placeholder="Описание вашей компании"
                          value={companyForm.description}
                          onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company_photo">Логотип (необязательно)</Label>
                        <Input
                          id="company_photo"
                          placeholder="https://example.com/logo.jpg"
                          value={companyForm.photo}
                          onChange={(e) => setCompanyForm({ ...companyForm, photo: e.target.value })}
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Регистрация...' : 'Зарегистрироваться как компания'}
                      </Button>
                    </form>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="text-center mt-6">
              <Button
                variant="link"
                onClick={() => navigate('/')}
                className="text-sm text-gray-600"
              >
                Вернуться на главную
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
