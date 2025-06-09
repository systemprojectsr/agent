import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ProfileService } from '@/services/profileService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { User, Building, Mail, Phone, Globe, Save, Camera } from 'lucide-react'

export const ProfilePage: React.FC = () => {
  const { user, profile, refreshProfile, isClient, isCompany } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  
  // Состояние формы для клиентов
  const [clientForm, setClientForm] = useState({
    full_name: (profile as any)?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    photo: profile?.photo || ''
  })

  // Состояние формы для компаний
  const [companyForm, setCompanyForm] = useState({
    company_name: (profile as any)?.company_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    full_name: (profile as any)?.full_name || '',
    position_agent: (profile as any)?.position_agent || '',
    id_company: (profile as any)?.id_company || '',
    address: (profile as any)?.address || '',
    type_service: (profile as any)?.type_service || '',
    website: (profile as any)?.website || '',
    description: (profile as any)?.description || '',
    photo: profile?.photo || ''
  })

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.token) return

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const profileData = isClient() ? {
        full_name: clientForm.full_name,
        email: clientForm.email,
        phone: clientForm.phone,
        photo: clientForm.photo
      } : {
        full_name: companyForm.full_name,
        email: companyForm.email,
        phone: companyForm.phone,
        photo: companyForm.photo
      }

      await ProfileService.updateProfile(user.token, profileData)
      await refreshProfile()
      setSuccess('Профиль успешно обновлен!')
    } catch (err: any) {
      setError(err.message || 'Ошибка обновления профиля')
    } finally {
      setLoading(false)
    }
  }

  const getInitials = () => {
    if (isClient()) {
      return (profile as any)?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'У'
    } else {
      return (profile as any)?.company_name?.split(' ').map((n: string) => n[0]).join('') || 'К'
    }
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Загрузка профиля...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Заголовок */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Профиль</h1>
            <p className="text-gray-600">Управление информацией аккаунта</p>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Информация профиля */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Информация профиля</CardTitle>
                <CardDescription>Основные данные аккаунта</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Аватар */}
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.photo} alt="Аватар" />
                    <AvatarFallback className="text-lg">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">
                      {isClient() ? (profile as any).full_name : (profile as any).company_name}
                    </h3>
                    <Badge variant="secondary" className="mt-1">
                      {isClient() ? (
                        <>
                          <User className="h-3 w-3 mr-1" />
                          Клиент
                        </>
                      ) : (
                        <>
                          <Building className="h-3 w-3 mr-1" />
                          Компания
                        </>
                      )}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Контактная информация */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {profile.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {profile.phone}
                  </div>
                  {isCompany() && (profile as any).website && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Globe className="h-4 w-4 mr-2" />
                      <a 
                        href={(profile as any).website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {(profile as any).website}
                      </a>
                    </div>
                  )}
                </div>

                {/* Дополнительная информация для компаний */}
                {isCompany() && (
                  <>
                    <Separator />
                    <div className="space-y-2 text-sm">
                      {(profile as any).type_service && (
                        <div>
                          <span className="font-medium">Тип услуг:</span> {(profile as any).type_service}
                        </div>
                      )}
                      {(profile as any).address && (
                        <div>
                          <span className="font-medium">Адрес:</span> {(profile as any).address}
                        </div>
                      )}
                      {(profile as any).position_agent && (
                        <div>
                          <span className="font-medium">Должность:</span> {(profile as any).position_agent}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Баланс для клиентов */}
                {isClient() && (
                  <>
                    <Separator />
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {(profile as any).balance?.toLocaleString('ru-RU') || 0} ₽
                      </div>
                      <div className="text-sm text-gray-600">Баланс</div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Форма редактирования */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Редактировать профиль</CardTitle>
                <CardDescription>Обновите информацию вашего аккаунта</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {isClient() ? (
                    // Форма клиента
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="full_name">Полное имя</Label>
                          <Input
                            id="full_name"
                            value={clientForm.full_name}
                            onChange={(e) => setClientForm({ ...clientForm, full_name: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={clientForm.email}
                            onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Телефон</Label>
                          <Input
                            id="phone"
                            value={clientForm.phone}
                            onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="photo">Фото (URL)</Label>
                          <Input
                            id="photo"
                            placeholder="https://example.com/photo.jpg"
                            value={clientForm.photo}
                            onChange={(e) => setClientForm({ ...clientForm, photo: e.target.value })}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    // Форма компании
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="company_name">Название компании</Label>
                          <Input
                            id="company_name"
                            value={companyForm.company_name}
                            onChange={(e) => setCompanyForm({ ...companyForm, company_name: e.target.value })}
                            disabled
                            className="bg-gray-50"
                          />
                          <p className="text-xs text-gray-500">Название компании нельзя изменить</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={companyForm.email}
                            onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Телефон</Label>
                          <Input
                            id="phone"
                            value={companyForm.phone}
                            onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="full_name">Имя контактного лица</Label>
                          <Input
                            id="full_name"
                            value={companyForm.full_name}
                            onChange={(e) => setCompanyForm({ ...companyForm, full_name: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="photo">Логотип (URL)</Label>
                        <Input
                          id="photo"
                          placeholder="https://example.com/logo.jpg"
                          value={companyForm.photo}
                          onChange={(e) => setCompanyForm({ ...companyForm, photo: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>Сохранение...</>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Сохранить изменения
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
