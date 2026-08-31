import { Controller, Get, Param, Query } from '@nestjs/common';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { RoomsService } from './rooms.service';
import { DetailParam } from './dto/detail-param.dto';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  // GET /rooms       =>      paginated rooms overview
  @Get()
  async overview(@Query() query: PaginationQueryDto) {
    const data = await this.roomsService.overview(query);

    return data;
  }

  // GET /rooms/:id    =>     get detail of the room specified
  @Get(':id')
  async detail(@Param() param: DetailParam) {
    const data = await this.roomsService.detail(param);

    return data;
  }

  // GET /rooms/:id/qr-code    =>     get QR code data for the room
  @Get(':id/qr-code')
  async qrCode(@Param() param: DetailParam) {
    const data = await this.roomsService.qrCode(param);

    return data;
  }
}
