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

export interface OAuthUserDto {
  provider: 'google' | 'github';
  providerId: string;
  fullName: string;
  email?: string;
  photo?: string;
}

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

    return this.generateTokenResponse(user);
  }

  // Google / GitHub OAuth orqali kirish
  async validateOAuthUser(dto: OAuthUserDto) {
    const field = dto.provider === 'google' ? 'googleId' : 'githubId';

    // Avval providerId bo'yicha qidirish
    let user = await this.userRepo.findOne({ where: { [field]: dto.providerId } });

    // Agar topilmasa, email bo'yicha qidirish
    if (!user && dto.email) {
      user = await this.userRepo.findOne({ where: { email: dto.email } });
      if (user) {
        // Email mavjud — providerId bog'lash
        user[field] = dto.providerId;
        await this.userRepo.save(user);
      }
    }

    // Yangi foydalanuvchi yaratish
    if (!user) {
      user = this.userRepo.create({
        fullName: dto.fullName,
        email: dto.email,
        [field]: dto.providerId,
        photo: dto.photo,
        role: UserRole.ADMIN,
        isActive: true,
      });
      await this.userRepo.save(user);
    }

    return user;
  }

  // OAuth callback — JWT token qaytarish
  generateTokenResponse(user: User) {
    const payload = { sub: user.id, phone: user.phone, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        role: user.role,
        photo: user.photo,
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
        'user.email',
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
      select: ['id', 'fullName', 'phone', 'email', 'role', 'photo', 'isActive', 'createdAt'],
    });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
    return user;
  }
}
