import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1746350000000 implements MigrationInterface {
  name = 'InitialSchema1746350000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // UserRole enum
    await queryRunner.query(`
      CREATE TYPE "public"."users_role_enum" AS ENUM('SUPERADMIN', 'ADMIN', 'TEACHER')
    `);

    // Users jadvali
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"           UUID NOT NULL DEFAULT uuid_generate_v4(),
        "fullName"     CHARACTER VARYING NOT NULL,
        "phone"        CHARACTER VARYING UNIQUE,
        "passwordHash" CHARACTER VARYING,
        "email"        CHARACTER VARYING UNIQUE,
        "googleId"     CHARACTER VARYING,
        "githubId"     CHARACTER VARYING,
        "role"         "public"."users_role_enum" NOT NULL DEFAULT 'ADMIN',
        "photo"        CHARACTER VARYING,
        "isActive"     BOOLEAN NOT NULL DEFAULT true,
        "createdAt"    TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"    TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    // Students jadvali
    await queryRunner.query(`
      CREATE TABLE "students" (
        "id"        UUID NOT NULL DEFAULT uuid_generate_v4(),
        "fullName"  CHARACTER VARYING NOT NULL,
        "phone"     CHARACTER VARYING NOT NULL UNIQUE,
        "parentPhone" CHARACTER VARYING,
        "address"   CHARACTER VARYING,
        "photo"     CHARACTER VARYING,
        "isActive"  BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_students" PRIMARY KEY ("id")
      )
    `);

    // Groups jadvali
    await queryRunner.query(`
      CREATE TABLE "groups" (
        "id"          UUID NOT NULL DEFAULT uuid_generate_v4(),
        "name"        CHARACTER VARYING NOT NULL,
        "description" CHARACTER VARYING,
        "teacherId"   UUID,
        "schedule"    CHARACTER VARYING,
        "price"       NUMERIC(10,2) NOT NULL DEFAULT 0,
        "isActive"    BOOLEAN NOT NULL DEFAULT true,
        "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"   TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_groups" PRIMARY KEY ("id"),
        CONSTRAINT "FK_groups_teacher" FOREIGN KEY ("teacherId")
          REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // Payments jadvali
    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id"        UUID NOT NULL DEFAULT uuid_generate_v4(),
        "studentId" UUID NOT NULL,
        "groupId"   UUID NOT NULL,
        "amount"    NUMERIC(10,2) NOT NULL,
        "month"     CHARACTER VARYING NOT NULL,
        "paidAt"    TIMESTAMP NOT NULL DEFAULT now(),
        "note"      CHARACTER VARYING,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_payments_student" FOREIGN KEY ("studentId")
          REFERENCES "students"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_payments_group" FOREIGN KEY ("groupId")
          REFERENCES "groups"("id") ON DELETE CASCADE
      )
    `);

    // Attendance jadvali
    await queryRunner.query(`
      CREATE TABLE "attendance" (
        "id"        UUID NOT NULL DEFAULT uuid_generate_v4(),
        "studentId" UUID NOT NULL,
        "groupId"   UUID NOT NULL,
        "date"      DATE NOT NULL,
        "present"   BOOLEAN NOT NULL DEFAULT false,
        "note"      CHARACTER VARYING,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_attendance" PRIMARY KEY ("id"),
        CONSTRAINT "FK_attendance_student" FOREIGN KEY ("studentId")
          REFERENCES "students"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_attendance_group" FOREIGN KEY ("groupId")
          REFERENCES "groups"("id") ON DELETE CASCADE
      )
    `);

    // Complaints jadvali
    await queryRunner.query(`
      CREATE TABLE "complaints" (
        "id"        UUID NOT NULL DEFAULT uuid_generate_v4(),
        "studentId" UUID,
        "text"      TEXT NOT NULL,
        "status"    CHARACTER VARYING NOT NULL DEFAULT 'open',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_complaints" PRIMARY KEY ("id"),
        CONSTRAINT "FK_complaints_student" FOREIGN KEY ("studentId")
          REFERENCES "students"("id") ON DELETE SET NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "complaints"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "attendance"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "groups"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "students"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_role_enum"`);
  }
}
