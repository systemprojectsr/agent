import { photosApi } from './config';
import { PhotoUploadResponse } from '@/types/api';

export class PhotosService {
  // Upload single photo
  static async uploadPhoto(file: File, metadata?: any): Promise<PhotoUploadResponse> {
    const formData = new FormData();
    formData.append('photo', file);

    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await photosApi.post('/photos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  // Upload multiple photos
  static async uploadPhotos(files: File[], metadata?: any): Promise<PhotoUploadResponse[]> {
    const uploadPromises = files.map(file => this.uploadPhoto(file, metadata));
    return await Promise.all(uploadPromises);
  }

  // Process photo (resize, optimize, etc.)
  static async processPhoto(photoId: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
  }): Promise<PhotoUploadResponse> {
    const response = await photosApi.post('/photos/process', {
      photoId,
      ...options,
    });

    return response.data;
  }

  // Get photo metadata
  static async getPhotoMetadata(photoId: string): Promise<any> {
    const response = await photosApi.get(`/photos/${photoId}/metadata`);
    return response.data;
  }

  // Delete photo
  static async deletePhoto(photoId: string): Promise<void> {
    await photosApi.delete(`/photos/${photoId}`);
  }

  // Get photo URL by ID
  static getPhotoUrl(photoId: string): string {
    return `${photosApi.defaults.baseURL}/photos/${photoId}`;
  }

  // Validate file before upload
  static validateFile(file: File): { valid: boolean; error?: string } {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Поддерживаются только форматы: JPEG, PNG, WebP',
      };
    }

    if (file.size > MAX_SIZE) {
      return {
        valid: false,
        error: 'Размер файла не должен превышать 10MB',
      };
    }

    return { valid: true };
  }

  // Create thumbnail URL
  static getThumbnailUrl(photoId: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
    const sizes = {
      small: '150x150',
      medium: '300x300',
      large: '600x600',
    };
    
    return `${photosApi.defaults.baseURL}/photos/${photoId}/thumbnail?size=${sizes[size]}`;
  }
}
