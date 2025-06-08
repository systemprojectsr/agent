import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Edit, Save, X, ArrowLeft } from 'lucide-react';

interface ClientData {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  photo?: string;
  type: string;
}

interface ClientProfileProps {
  onBack: () => void;
}

const ClientProfile: React.FC<ClientProfileProps> = ({ onBack }) => {
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    loadClientData();
  }, []);

  const loadClientData = async () => {
    setIsLoading(true);
    try {
      const api = (window as any).serviceAPI;
      if (!api) {
        throw new Error('API не инициализован');
      }

      const response = await api.getAccount();
      if (response.user && response.user.account) {
        setClientData(response.user.account);
        setEditForm({
          full_name: response.user.account.full_name || '',
          phone: response.user.account.phone || '',
          email: response.user.account.email || ''
        });
      } else {
        throw new Error('Данные профиля не найдены');
      }
    } catch (err) {
      console.error('Ошибка загрузки профиля:', err);
      setError('Не удалось загрузить данные профиля');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь можно добавить API для обновления профиля
    setClientData(prev => prev ? {
      ...prev,
      full_name: editForm.full_name,
      phone: editForm.phone,
      email: editForm.email
    } : null);
    setIsEditing(false);
  };

  const handleEditChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (error || !clientData) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>{error || 'Данные профиля недоступны'}</AlertDescription>
        </Alert>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Профиль клиента</h1>
            <p className="text-gray-600">Управление личными данными</p>
          </div>
        </div>
        <Badge variant="secondary">
          <User className="w-4 h-4 mr-1" />
          Клиент
        </Badge>
      </div>

      {/* Основная информация */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Личная информация
            </CardTitle>
            {!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Редактировать
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm({
                      full_name: clientData.full_name || '',
                      phone: clientData.phone || '',
                      email: clientData.email || ''
                    });
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm"
                  onClick={handleEditSubmit}
                >
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">ФИО</Label>
                <Input
                  id="full_name"
                  value={editForm.full_name}
                  onChange={(e) => handleEditChange('full_name', e.target.value)}
                  placeholder="Введите ФИО"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  value={editForm.phone}
                  onChange={(e) => handleEditChange('phone', e.target.value)}
                  placeholder="Введите номер телефона"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => handleEditChange('email', e.target.value)}
                  placeholder="Введите email"
                />
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">ФИО</p>
                    <p className="font-medium">{clientData.full_name}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Телефон</p>
                    <p className="font-medium">{clientData.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{clientData.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">ID пользователя</p>
                  <p className="font-medium">#{clientData.id}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Тип аккаунта</p>
                  <Badge variant="secondary">{clientData.type}</Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Действия */}
      <Card>
        <CardHeader>
          <CardTitle>Действия</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start">
              <Mail className="w-4 h-4 mr-2" />
              История заказов
            </Button>
            <Button variant="outline" className="justify-start">
              <User className="w-4 h-4 mr-2" />
              Настройки профиля
            </Button>
          </div>
          
          <div className="pt-4 border-t">
            <Button 
              variant="destructive" 
              onClick={() => {
                const api = (window as any).serviceAPI;
                if (api) api.logout();
                onBack();
                window.location.reload();
              }}
            >
              Выйти из аккаунта
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientProfile;
