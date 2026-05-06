import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOAuthFields1746350001000 implements MigrationInterface {
  name = 'AddOAuthFields1746350001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // phone va passwordHash ni nullable qilish
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phone" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "passwordHash" DROP NOT NULL`);

    // email, googleId, githubId qo'shish (agar avval yo'q bo'lsa)
    const columns = await queryRunner.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'users'
    `);
    const names = columns.map((c: any) => c.column_name);

    if (!names.includes('email')) {
      await queryRunner.query(`ALTER TABLE "users" ADD "email" CHARACTER VARYING UNIQUE`);
    }
    if (!names.includes('googleId')) {
      await queryRunner.query(`ALTER TABLE "users" ADD "googleId" CHARACTER VARYING`);
    }
    if (!names.includes('githubId')) {
      await queryRunner.query(`ALTER TABLE "users" ADD "githubId" CHARACTER VARYING`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phone" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "passwordHash" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "email"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "googleId"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "githubId"`);
  }
}
