import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Eye, EyeOff, User, Building } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onRegisterSuccess?: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onSwitchToLogin, onRegisterSuccess }) => {
  const [activeTab, setActiveTab] = useState('client');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [clientData, setClientData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });

  const [companyData, setCompanyData] = useState({
    companyName: '',
    email: '',
    phone: '',
    fullName: '',
    positionAgent: '',
    idCompany: '',
    address: '',
    typeService: '',
    password: '',
  });

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const api = (window as any).serviceAPI;
      
      if (!api) {
        throw new Error('API не инициализован');
      }

      const response = await api.registerClient(
        clientData.fullName,
        clientData.email,
        clientData.phone,
        clientData.password
      );
      
      if (response.status === 'success') {
        console.log('Успешная регистрация клиента:', response);
        onClose();
        if (onRegisterSuccess) {
          onRegisterSuccess();
        } else {
          window.location.reload();
        }
      } else {
        setError('Ошибка регистрации. Проверьте данные.');
      }
    } catch (err) {
      console.error('Ошибка регистрации клиента:', err);
      setError('Ошибка регистрации. Попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const api = (window as any).serviceAPI;
      
      if (!api) {
        throw new Error('API не инициализован');
      }

      const response = await api.registerCompany({
        company_name: companyData.companyName,
        email: companyData.email,
        phone: companyData.phone,
        full_name: companyData.fullName,
        position_agent: companyData.positionAgent,
        id_company: companyData.idCompany,
        address: companyData.address,
        type_service: companyData.typeService,
        password: companyData.password,
        photo: null,
        documents: []
      });
      
      if (response.status === 'success') {
        console.log('Успешная регистрация компании:', response);
        onClose();
        if (onRegisterSuccess) {
          onRegisterSuccess();
        } else {
          window.location.reload();
        }
      } else {
        setError('Ошибка регистрации. Проверьте данные.');
      }
    } catch (err) {
      console.error('Ошибка регистрации компании:', err);
      setError('Ошибка регистрации. Попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientData({
      ...clientData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCompanyData({
      ...companyData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Регистрация</DialogTitle>
          <DialogDescription>
            Выберите тип аккаунта и заполните данные для регистрации
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="client" className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              Клиент
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center">
              <Building className="w-4 h-4 mr-2" />
              Компания
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="client" className="space-y-4">
            <form onSubmit={handleClientSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="client-fullName">ФИО</Label>
                <Input
                  id="client-fullName"
                  name="fullName"
                  placeholder="Иванов Иван Иванович"
                  value={clientData.fullName}
                  onChange={handleClientChange}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="client-email">Электронная почта</Label>
                <Input
                  id="client-email"
                  name="email"
                  type="email"
                  placeholder="example@mail.com"
                  value={clientData.email}
                  onChange={handleClientChange}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="client-phone">Телефон</Label>
                <Input
                  id="client-phone"
                  name="phone"
                  placeholder="+7 (900) 123-45-67"
                  value={clientData.phone}
                  onChange={handleClientChange}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="client-password">Пароль</Label>
                <div className="relative">
                  <Input
                    id="client-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Минимум 6 символов"
                    value={clientData.password}
                    onChange={handleClientChange}
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Зарегистрироваться как клиент
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="company" className="space-y-4">
            <form onSubmit={handleCompanySubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="company-name">Название компании</Label>
                <Input
                  id="company-name"
                  name="companyName"
                  placeholder="ООО «Название»"
                  value={companyData.companyName}
                  onChange={handleCompanyChange}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-email">Email компании</Label>
                  <Input
                    id="company-email"
                    name="email"
                    type="email"
                    placeholder="company@mail.com"
                    value={companyData.email}
                    onChange={handleCompanyChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-phone">Телефон</Label>
                  <Input
                    id="company-phone"
                    name="phone"
                    placeholder="+7 (900) 123-45-67"
                    value={companyData.phone}
                    onChange={handleCompanyChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-fullName">ФИО представителя</Label>
                  <Input
                    id="company-fullName"
                    name="fullName"
                    placeholder="Иванов И.И."
                    value={companyData.fullName}
                    onChange={handleCompanyChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-position">Должность</Label>
                  <Input
                    id="company-position"
                    name="positionAgent"
                    placeholder="Директор"
                    value={companyData.positionAgent}
                    onChange={handleCompanyChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company-id">ИНН/ОГРН</Label>
                <Input
                  id="company-id"
                  name="idCompany"
                  placeholder="1234567890"
                  value={companyData.idCompany}
                  onChange={handleCompanyChange}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company-address">Адрес</Label>
                <Textarea
                  id="company-address"
                  name="address"
                  placeholder="г. Томск, ул. Пример, д. 1"
                  value={companyData.address}
                  onChange={handleCompanyChange}
                  required
                  disabled={isLoading}
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company-service">Тип услуг</Label>
                <Input
                  id="company-service"
                  name="typeService"
                  placeholder="Клининг, ремонт, доставка..."
                  value={companyData.typeService}
                  onChange={handleCompanyChange}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company-password">Пароль</Label>
                <div className="relative">
                  <Input
                    id="company-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Минимум 6 символов"
                    value={companyData.password}
                    onChange={handleCompanyChange}
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Зарегистрироваться как компания
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
        
        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={onSwitchToLogin}
            disabled={isLoading}
          >
            Уже есть аккаунт? Войти
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterModal;
