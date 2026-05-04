import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, Matches, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../users/user.entity';

export class LoginDto {
  @ApiProperty({
    example: '+998901234567',
    description: 'Telefon raqam',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: 'password123',
    description: 'Parol (minimum 6 belgi)',
  })
  @IsString()
  @MinLength(6)
  password: string;
}

export class CreateAdminDto {
  @ApiProperty({ example: 'Muxamadaliyev Ibrohim' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '+998901234567' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    enum: [UserRole.ADMIN, UserRole.TEACHER],
    example: UserRole.ADMIN,
    description: 'Faqat ADMIN yoki TEACHER tayinlash mumkin',
  })
  @IsEnum([UserRole.ADMIN, UserRole.TEACHER])
  role: UserRole.ADMIN | UserRole.TEACHER;
}

export class UpdateUserDto {
  @ApiProperty({ example: 'Yangi Ism', required: false })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({ example: 'yangiparol123', required: false })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  isActive?: boolean;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  token: string;

  @ApiProperty()
  user: {
    id: string;
    fullName: string;
    phone: string;
    role: string;
  };
}
