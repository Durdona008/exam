import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, CreateAdminDto, LoginResponseDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @ApiOperation({
    summary: 'Tizimga kirish',
    description: 'Barcha rollar (SuperAdmin, Admin, Teacher) uchun login endpoint.',
  })
  @ApiResponse({ status: 200, description: 'Muvaffaqiyatli kirish', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Noto\'g\'ri login yoki parol' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('users')
  @Roles(UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Yangi admin/teacher yaratish',
    description: 'Faqat **SuperAdmin** bajarishi mumkin. Admin yoki Teacher rolini tayinlaydi.',
  })
  @ApiResponse({ status: 201, description: 'Foydalanuvchi yaratildi' })
  @ApiResponse({ status: 403, description: 'Ruxsat yo\'q' })
  @ApiResponse({ status: 409, description: 'Bu telefon raqam allaqachon mavjud' })
  createUser(@Body() dto: CreateAdminDto) {
    return this.authService.createUser(dto);
  }

  @Get('users')
  @Roles(UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Barcha admin va o\'qituvchilar ro\'yxati',
    description: 'Faqat **SuperAdmin** ko\'ra oladi.',
  })
  @ApiResponse({ status: 200, description: 'Ro\'yxat' })
  getAllUsers() {
    return this.authService.getAllUsers();
  }

  @Delete('users/:id')
  @Roles(UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Foydalanuvchini deaktiv qilish' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Deaktiv qilindi' })
  deactivateUser(@Param('id') id: string) {
    return this.authService.deactivateUser(id);
  }

  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mening profilim' })
  @ApiResponse({ status: 200, description: 'Profil ma\'lumotlari' })
  getProfile(@CurrentUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }
}
