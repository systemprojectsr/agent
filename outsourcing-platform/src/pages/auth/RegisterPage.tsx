import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Building } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const clientSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  lastName: z.string().min(2, 'Фамилия должна содержать минимум 2 символа'),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

const companySchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  confirmPassword: z.string(),
  companyName: z.string().min(2, 'Название компании должно содержать минимум 2 символа'),
  companyDescription: z.string().min(10, 'Описание должно содержать минимум 10 символов'),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

type ClientFormData = z.infer<typeof clientSchema>;
type CompanyFormData = z.infer<typeof companySchema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { registerClient, registerCompany, isLoading, isAuthenticated } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationType, setRegistrationType] = useState<'client' | 'company'>('client');

  const clientForm = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  });

  const companyForm = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onClientSubmit = async (data: ClientFormData) => {
    try {
      await registerClient({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });
      toast.success('Регистрация успешна! Добро пожаловать!');
      navigate('/');
    } catch (error) {
      // Error is handled in the store
    }
  };

  const onCompanySubmit = async (data: CompanyFormData) => {
    try {
      await registerCompany({
        email: data.email,
        password: data.password,
        companyName: data.companyName,
        companyDescription: data.companyDescription,
        phone: data.phone,
      });
      toast.success('Регистрация компании успешна! Добро пожаловать!');
      navigate('/company-profile');
    } catch (error) {
      // Error is handled in the store
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Регистрация</CardTitle>
            <CardDescription>
              Создайте аккаунт для поиска услуг или предложения своих
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={registrationType} onValueChange={(value) => setRegistrationType(value as 'client' | 'company')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="client" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Клиент
                </TabsTrigger>
                <TabsTrigger value="company" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Компания
                </TabsTrigger>
              </TabsList>

              {/* Client Registration */}
              <TabsContent value="client">
                <form onSubmit={clientForm.handleSubmit(onClientSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Имя</Label>
                      <Input
                        id="firstName"
                        placeholder="Иван"
                        {...clientForm.register('firstName')}
                        className={clientForm.formState.errors.firstName ? 'border-red-500' : ''}
                      />
                      {clientForm.formState.errors.firstName && (
                        <p className="text-sm text-red-500">{clientForm.formState.errors.firstName.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Фамилия</Label>
                      <Input
                        id="lastName"
                        placeholder="Иванов"
                        {...clientForm.register('lastName')}
                        className={clientForm.formState.errors.lastName ? 'border-red-500' : ''}
                      />
                      {clientForm.formState.errors.lastName && (
                        <p className="text-sm text-red-500">{clientForm.formState.errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Электронная почта</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      {...clientForm.register('email')}
                      className={clientForm.formState.errors.email ? 'border-red-500' : ''}
                    />
                    {clientForm.formState.errors.email && (
                      <p className="text-sm text-red-500">{clientForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон (необязательно)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+7 (999) 123-45-67"
                      {...clientForm.register('phone')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Пароль</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Введите пароль"
                        {...clientForm.register('password')}
                        className={clientForm.formState.errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {clientForm.formState.errors.password && (
                      <p className="text-sm text-red-500">{clientForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Повторите пароль"
                        {...clientForm.register('confirmPassword')}
                        className={clientForm.formState.errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {clientForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-500">{clientForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Регистрация...' : 'Зарегистрироваться как клиент'}
                  </Button>
                </form>
              </TabsContent>

              {/* Company Registration */}
              <TabsContent value="company">
                <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Название компании</Label>
                    <Input
                      id="companyName"
                      placeholder="ООО Сервис+"
                      {...companyForm.register('companyName')}
                      className={companyForm.formState.errors.companyName ? 'border-red-500' : ''}
                    />
                    {companyForm.formState.errors.companyName && (
                      <p className="text-sm text-red-500">{companyForm.formState.errors.companyName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyDescription">Описание деятельности</Label>
                    <Textarea
                      id="companyDescription"
                      placeholder="Опишите деятельность вашей компании..."
                      rows={3}
                      {...companyForm.register('companyDescription')}
                      className={companyForm.formState.errors.companyDescription ? 'border-red-500' : ''}
                    />
                    {companyForm.formState.errors.companyDescription && (
                      <p className="text-sm text-red-500">{companyForm.formState.errors.companyDescription.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyEmail">Электронная почта</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      placeholder="company@email.com"
                      {...companyForm.register('email')}
                      className={companyForm.formState.errors.email ? 'border-red-500' : ''}
                    />
                    {companyForm.formState.errors.email && (
                      <p className="text-sm text-red-500">{companyForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyPhone">Телефон (необязательно)</Label>
                    <Input
                      id="companyPhone"
                      type="tel"
                      placeholder="+7 (999) 123-45-67"
                      {...companyForm.register('phone')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyPassword">Пароль</Label>
                    <div className="relative">
                      <Input
                        id="companyPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Введите пароль"
                        {...companyForm.register('password')}
                        className={companyForm.formState.errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {companyForm.formState.errors.password && (
                      <p className="text-sm text-red-500">{companyForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyConfirmPassword">Подтвердите пароль</Label>
                    <div className="relative">
                      <Input
                        id="companyConfirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Повторите пароль"
                        {...companyForm.register('confirmPassword')}
                        className={companyForm.formState.errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {companyForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-500">{companyForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Регистрация...' : 'Зарегистрировать компанию'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Уже есть аккаунт?{' '}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Войти
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
