import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Complaint } from './complaint.entity';

@Module({ imports: [TypeOrmModule.forFeature([Complaint])], exports: [TypeOrmModule] })
export class ComplaintsModule {}
