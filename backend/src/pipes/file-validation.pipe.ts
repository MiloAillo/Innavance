import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  transform(value: any) {
    if (!value) {
      throw new BadRequestException('File is required');
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (value.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }
    
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedMimes.includes(value.mimetype)) {
      throw new BadRequestException('Only JPG, JPEG, and PNG files are allowed');
    }
    
    return value;
  }
}
