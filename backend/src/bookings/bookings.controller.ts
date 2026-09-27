import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BookBodyDto } from './dto/book-body.dto';
import { BookingsService } from './bookings.service';
import { RoomGuard } from './guard/rooms.guard';
import { multerConfig } from '../config/multer.config';
import { FileValidationPipe } from '../pipes/file-validation.pipe';
import { JwtAuthGuard } from '../admins/guard/jwt-auth-guard.guard';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // POST /bookings/upload-id-card    =>      upload ID card photo (Admin/Staff only)
  @Post('upload-id-card')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', multerConfig))
  uploadIdCard(@UploadedFile(new FileValidationPipe()) file: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    
    return {
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  // POST /bookings                   =>      reserve an empty room to a user (Admin/Staff only)
  @Post()
  @UseGuards(JwtAuthGuard)
  async book(@Body() bookBodyDto: BookBodyDto) {
    const data = await this.bookingsService.book(bookBodyDto);

    return {
      message: 'successfully booked the room',
      ...data,
    };
  }

  // GET /bookings/:id                =>      see booking detail (public for status check)
  @Get(':id')
  async detail(@Param('id', ParseIntPipe) bookingId: number) {
    const data = await this.bookingsService.detail(bookingId);

    return data;
  }

  // POST /bookings/:id/checkout      =>      checkout a booking
  @Post(':id/checkout')
  @UseGuards(RoomGuard)
  @HttpCode(HttpStatus.OK)
  async checkout(
    @Param('id', ParseIntPipe) bookingId: number,
    @Req() request: Request,
  ) {
    const accountId = request['accountId'];
    const data = await this.bookingsService.checkout(bookingId, accountId);

    return {
      message: 'successfully checked out.',
      ...data,
    };
  }
}
