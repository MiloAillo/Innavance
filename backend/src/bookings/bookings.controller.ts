import { Body, Controller, Post } from '@nestjs/common';
import { BookBodyDto } from './dto/book-body.dto';
import { BookingsService } from './bookings.service';

@Controller('bookings')
export class BookingsController {
    constructor(private readonly bookingsService: BookingsService) {}

    // POST /bookings       =>      reserve an empty room to a user
    @Post()
    async book(@Body() bookBodyDto: BookBodyDto) {
        const data = await this.bookingsService.book(bookBodyDto)

        return {
            "message": "successfully booked the room",
            ...data
        }
    }
}
