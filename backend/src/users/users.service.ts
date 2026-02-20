import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
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
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    const newUser = this.usersRepository.create({
      ...createUserDto,      
      password: hashedPassword, 
    });
    try { 
      return await this.usersRepository.save(newUser);
    } catch (error) {
      if (error.code === '23505' || error.detail.includes('already exists')) {
        throw new ConflictException ('Username หรือ Email นี้มีอยู่แล้วครับน้องบ่าว');
      }
      throw new InternalServerErrorException('เกิดข้อผิดพลาดในการสร้างผู้ใช้');
    }
  }

  async findOne(username: string): Promise<User | null> {
    return await this.usersRepository.findOne({ 
      where: { username } 
    });
  }

  async findOneById(id: number): Promise<User | null> {
    return await this.usersRepository.findOne({ 
      where: { id } 
    });
  }
  
  async findOneByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ 
      where: { email } 
    });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  
  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.preload({
      id,
      ...updateUserDto,
    });
    if (!user) {
      throw new ConflictException('User not found');
    }
    return this.usersRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findOneById(id);
    if (!user) {
      throw new ConflictException('User not found');
    }
    return this.usersRepository.remove(user);
  }
}
    
