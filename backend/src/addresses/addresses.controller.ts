import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('addresses')
@UseGuards(AuthGuard('jwt')) //บังคับล็อกอินทุกเส้นทาง
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) { }

  @Post()
  create(@Request() req, @Body() createAddressDto: any) {
    const userId = req.user.sub; // ดึง ID จาก JWT Token
    return this.addressesService.create(userId, createAddressDto);
  }

  @Get()
  findMyAddresses(@Request() req) {
    const userId = req.user.sub;
    return this.addressesService.findAllByUserId(userId);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    const userId = req.user.sub;
    return this.addressesService.remove(userId, +id);
  }
}
