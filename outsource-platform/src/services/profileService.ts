import { apiRequest, createSimpleToken, createExtendedToken, ClientProfile, CompanyProfile } from '@/config/api'

export interface UpdateProfileRequest {
  full_name: string
  email: string
  phone: string
  photo?: string
}

// Сервис для работы с профилем
export class ProfileService {
  // Получение профиля пользователя
  static async getProfile(token: string): Promise<ClientProfile | CompanyProfile> {
    const response = await apiRequest('/v1/account/', {
      method: 'POST',
      body: JSON.stringify(createSimpleToken(token))
    })
    
    const data = await response.json()
    
    if (data.status_response?.status === 'success') {
      return data.user.account
    }
    
    throw new Error(data.error?.message || 'Failed to fetch profile')
  }

  // Обновление профиля клиента
  static async updateProfile(token: string, profileData: UpdateProfileRequest): Promise<void> {
    const response = await apiRequest('/v1/account/profile/update', {
      method: 'POST',
      body: JSON.stringify({
        ...createExtendedToken(token),
        profile: profileData
      })
    })
    
    const data = await response.json()

    if (!data) {
      throw new Error(data.error?.message || 'Failed to update profile')
    }
  }
}
