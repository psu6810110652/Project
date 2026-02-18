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
  
  findAll() {
    return this.usersRepository.find();
  }

  
  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
    
