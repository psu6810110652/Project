import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    let hashedPassword: string | undefined = undefined;
    // ตรวจสอบว่ามีรหัสผ่านส่งมาหรือไม่ (ถ้าเป็น Google Login จะไม่มี)
    if (createUserDto.password) {
      const salt = await bcrypt.genSalt();
      hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    }

    // สร้าง User โดยถ้าไม่มีรหัสผ่าน ค่า password ในฐานข้อมูลจะถูกบันทึกเป็น null (หรือค่าว่าง)
    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    try {
      const savedUser = await this.usersRepository.save(newUser);

      // แยก password ออกมา และเก็บค่าที่เหลือไว้ในตัวแปร result
      const { password, ...result } = savedUser;

      return result as User; // คืนค่า result กลับไปแทน
    } catch (error) {
      // เพิ่ม optional chaining (?.) เพื่อป้องกันแอปพังถ้า error.detail เป็น undefined
      if (error.code === '23505' || error.detail?.includes('already exists')) {
        throw new ConflictException('Username หรือ Email นี้มีอยู่แล้วครับน้องบ่าว');
      }
      throw new InternalServerErrorException('เกิดข้อผิดพลาดในการสร้างผู้ใช้');
    }
  }

  async findOne(username: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { username },
      relations: ['addresses'],
    });
  }

  async findOneById(id: number): Promise<User | null> {
    console.log('Searching for User ID:', id);

    const user = await this.usersRepository.findOne({
      where: { id: id },
      relations: ['addresses'],
    });

    if (!user) {
      console.log('User not found in Database');
      return null;
    }

    const { password, ...result } = user;
    return result as User;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { email },
      relations: ['addresses'],
    });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ relations: ['addresses'] });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // ถ้ามีการส่งรหัสผ่านเข้ามาเพื่ออัปเดต ให้เข้ารหัสก่อนบันทึกเสมอ
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    const user = await this.usersRepository.preload({
      id,
      ...updateUserDto,
    });

    if (!user) {
      throw new NotFoundException('หาผู้ใช้ไม่เจอครับ');
    }

    const updatedUser = await this.usersRepository.save(user);

    // ใช้ Destructuring เหมือนใน create() เพื่อแก้ปัญหา Error ts(2790)
    const { password, ...result } = updatedUser;

    return result as User;
  }

  async remove(id: number) {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('หาผู้ใช้ไม่เจอครับ');
    }
    return this.usersRepository.remove(user);
  }
}