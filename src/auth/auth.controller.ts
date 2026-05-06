import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LoginDto, CreateAdminDto, LoginResponseDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/user.entity';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { GithubAuthGuard } from './guards/github-auth.guard';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

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

  // ─── Google OAuth ─────────────────────────────────────────────
  @Get('google')
  @Public()
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Google orqali kirish',
    description: 'Google OAuth2 sahifasiga yo\'naltiradi.',
  })
  @ApiResponse({ status: 302, description: 'Google login sahifasiga redirect' })
  googleLogin() {
    // Passport redirect qiladi
  }

  @Get('google/callback')
  @Public()
  @UseGuards(GoogleAuthGuard)
  @ApiExcludeEndpoint()
  googleCallback(@Req() req: any, @Res() res: any) {
    const result = this.authService.generateTokenResponse(req.user);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3001');
    return res.redirect(
      `${frontendUrl}/auth/callback?token=${result.token}&user=${encodeURIComponent(JSON.stringify(result.user))}`,
    );
  }

  // ─── GitHub OAuth ─────────────────────────────────────────────
  @Get('github')
  @Public()
  @UseGuards(GithubAuthGuard)
  @ApiOperation({
    summary: 'GitHub orqali kirish',
    description: 'GitHub OAuth2 sahifasiga yo\'naltiradi.',
  })
  @ApiResponse({ status: 302, description: 'GitHub login sahifasiga redirect' })
  githubLogin() {
    // Passport redirect qiladi
  }

  @Get('github/callback')
  @Public()
  @UseGuards(GithubAuthGuard)
  @ApiExcludeEndpoint()
  githubCallback(@Req() req: any, @Res() res: any) {
    const result = this.authService.generateTokenResponse(req.user);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3001');
    return res.redirect(
      `${frontendUrl}/auth/callback?token=${result.token}&user=${encodeURIComponent(JSON.stringify(result.user))}`,
    );
  }

  // ─── User management ──────────────────────────────────────────
  @Post('users')
  @Roles(UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Yangi admin/teacher yaratish',
    description: 'Faqat **SuperAdmin** bajarishi mumkin.',
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
  @ApiOperation({ summary: 'Barcha admin va o\'qituvchilar ro\'yxati' })
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
