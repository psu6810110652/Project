import { Controller, Get, Post, Patch, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
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

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    const userId = req.user.sub;
    return this.addressesService.findOne(+id, userId);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    const userId = req.user.sub;
    return this.addressesService.remove(+id, userId);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateAddressDto: any) {
    const userId = req.user.sub;
    return this.addressesService.update(+id, userId, updateAddressDto);
  }

  @Patch(':id/set-default')
  async setDefault(@Request() req, @Param('id') id: string) {
    const userId = req.user.sub;
    // Reset all addresses for this user
    const all = await this.addressesService.findAllByUserId(userId);
    for (const addr of all) {
      await this.addressesService.update(addr.id, userId, { isDefault: addr.id === +id });
    }
    return { success: true };
  }
}
