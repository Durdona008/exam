import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/user.entity';
import { LoginDto, CreateAdminDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // Login — barcha rollar uchun
  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { phone: dto.phone, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('Telefon raqam yoki parol noto\'g\'ri');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Telefon raqam yoki parol noto\'g\'ri');
    }

    const payload = { sub: user.id, phone: user.phone, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  // Admin yoki Teacher yaratish — faqat SuperAdmin
  async createUser(dto: CreateAdminDto) {
    const exists = await this.userRepo.findOne({ where: { phone: dto.phone } });
    if (exists) {
      throw new ConflictException('Bu telefon raqam allaqachon ro\'yxatdan o\'tgan');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      fullName: dto.fullName,
      phone: dto.phone,
      passwordHash,
      role: dto.role,
    });

    await this.userRepo.save(user);

    return {
      id: user.id,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  // Barcha adminlar va o'qituvchilar ro'yxati
  async getAllUsers() {
    return this.userRepo
      .createQueryBuilder('user')
      .where('user.role != :role', { role: UserRole.SUPERADMIN })
      .orderBy('user.createdAt', 'DESC')
      .select([
        'user.id',
        'user.fullName',
        'user.phone',
        'user.role',
        'user.isActive',
        'user.createdAt',
      ])
      .getMany();
  }

  // Foydalanuvchini o'chirish / deaktiv qilish
  async deactivateUser(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
    if (user.role === UserRole.SUPERADMIN) {
      throw new ConflictException('SuperAdminni o\'chirib bo\'lmaydi');
    }
    user.isActive = false;
    await this.userRepo.save(user);
    return { message: 'Foydalanuvchi deaktiv qilindi' };
  }

  // Mening profilim
  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'fullName', 'phone', 'role', 'photo', 'isActive', 'createdAt'],
    });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
    return user;
  }
}
