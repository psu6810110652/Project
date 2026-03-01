import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Request, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // Usually left unprotected so new users can register
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // Protected: Find all users (Admin only)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Protected: Find a user by their username (Admin or self)
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    // IDOR Protection: Determine if user is accessing their own profile or is an Admin
    if (req.user.sub !== id && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only access your own profile');
    }
    // โค้ดนี้จะส่ง id ที่เป็นตัวเลข (เช่น 8) ไปให้ Service ค้นหา
    return this.usersService.findOneById(id);
  }

  // Protected: Update a user
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req
  ) {
    // Explicit IDOR protection check: ensure req.user.sub === id
    // If the IDs do not match, throw a ForbiddenException, unless the user has the 'Admin' role.
    if (req.user.sub !== id && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You are not allowed to update this profile');
    }
    return this.usersService.update(id, updateUserDto);
  }

  // Protected: Delete a user (Admin only)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}