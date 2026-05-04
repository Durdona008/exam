import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: 'uuid-here' })
  id: string;

  @Column()
  @ApiProperty({ example: 'Muxamadaliyev Ibrohim' })
  fullName: string;

  @Column({ unique: true })
  @ApiProperty({ example: '+998901234567' })
  phone: string;

  @Column()
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.ADMIN,
  })
  @ApiProperty({ enum: UserRole, example: UserRole.ADMIN })
  role: UserRole;

  @Column({ nullable: true })
  @ApiProperty({ example: 'uploads/photo.jpg', required: false })
  photo: string;

  @Column({ default: true })
  @ApiProperty({ example: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
