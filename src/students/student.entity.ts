import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Group } from '../groups/group.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column()
  @ApiProperty({ example: 'Muxamadaliyev Ibrohim' })
  fullName: string;

  @Column()
  @ApiProperty({ example: '+998901234567' })
  phone: string;

  @Column()
  @ApiProperty({ example: 'Matematika' })
  direction: string;

  @Column({ nullable: true })
  @ApiProperty({ example: 'Karimov Sardor', required: false })
  parentName: string;

  @Column({ nullable: true })
  @ApiProperty({ example: '+998901234567', required: false })
  parentPhone: string;

  @Column({ nullable: true })
  @ApiProperty({ example: 'uploads/student-photo.jpg', required: false })
  photo: string;

  @Column({ default: true })
  @ApiProperty({ example: true })
  isActive: boolean;

  @ManyToMany(() => Group, (group) => group.students)
  groups: Group[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
