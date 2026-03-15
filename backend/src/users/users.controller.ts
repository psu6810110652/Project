import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  ParseIntPipe, 
  Request, 
  ForbiddenException, 
  InternalServerErrorException, 
  HttpException 
} from '@nestjs/common';
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

  // ====================================================================
  // 🟢 ส่วนที่เพิ่มเข้ามาใหม่: API สำหรับลืมรหัสผ่าน (Public)
  // ====================================================================

  @Post('forgot-password')
  forgotPassword(@Body('email') email: string) {
    return this.usersService.forgotPassword(email);
  }

  // เปลี่ยนจาก @Post('reset-password') เป็นรับ :token ใน URL
  @Post('reset-password/:token')
  resetPassword(
    @Param('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.usersService.resetPassword(token, newPassword);
  }
  // ====================================================================

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
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    try {
      // IDOR Protection: allow access only for the same user or an Admin
      // Note: req.user.sub comes from JWT as a number; id is parsed by ParseIntPipe
      if (Number(req.user.sub) !== id && req.user.role !== UserRole.ADMIN) {
        throw new ForbiddenException('You can only access your own profile');
      }
      const user = await this.usersService.findOneById(id);
      return user;
    } catch (error) {
      // Re-throw known HTTP exceptions (403, 404, etc.) without wrapping them as 500
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error in UsersController.findOne:', error);
      throw new InternalServerErrorException('เกิดข้อผิดพลาดขณะดึงข้อมูลผู้ใช้ — ตรวจสอบ server logs');
    }
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
    if (Number(req.user.sub) !== id && req.user.role !== UserRole.ADMIN) {
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