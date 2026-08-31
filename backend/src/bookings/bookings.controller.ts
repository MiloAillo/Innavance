import {
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
  UseGuards,
} from '@nestjs/common';
import { BookBodyDto } from './dto/book-body.dto';
import { BookingsService } from './bookings.service';
import { RoomGuard } from './guard/rooms.guard';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // POST /bookings                   =>      reserve an empty room to a user
  @Post()
  async book(@Body() bookBodyDto: BookBodyDto) {
    const data = await this.bookingsService.book(bookBodyDto);

    return {
      message: 'successfully booked the room',
      ...data,
    };
  }

  // GET /bookings/:id                =>      see booking detail
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
