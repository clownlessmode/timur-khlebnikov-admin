import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ImageUploadService {
  private readonly API_KEY = '7a13b5b0bccd2030e2fefe7a20b86591';

  async uploadImageToImgbb(file: Express.Multer.File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', file.buffer.toString('base64'));

      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${this.API_KEY}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      const result = response.data;
      if (result.success) {
        return result.data.url;
      } else {
        throw new Error('Ошибка загрузки изображения на imgbb');
      }
    } catch (error) {
      console.error('Ошибка при загрузке изображения:', error);
      throw error;
    }
  }
}
