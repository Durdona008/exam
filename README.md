# CRM Backend — NestJS + PostgreSQL + TypeORM

O'quv markazi boshqaruv tizimi (CRM) uchun backend.

## Texnologiyalar

- **NestJS** — Backend framework
- **PostgreSQL** — Ma'lumotlar bazasi
- **TypeORM** — ORM + Migrations
- **Passport.js** — JWT, Google OAuth2, GitHub OAuth2
- **Swagger** — API hujjatlari

---

## O'rnatish

```bash
npm install
cp .env.example .env
# .env faylni to'ldiring
```

---

## Migration

```bash
# Barcha migrationlarni ishga tushirish
npm run migration:run

# Migration holati
npm run migration:show

# Yangi migration yaratish (entity o'zgartirilgandan so'ng)
npm run migration:generate -- src/database/migrations/MigrationName

# Oxirgi migrationni bekor qilish
npm run migration:revert
```

> **Muhim:** Development da `synchronize: true` bo'lib, jadvallar avtomatik yangilanadi.  
> Production da `synchronize: false` va `migrationsRun: true` — faqat migrationlar ishlatiladi.

---

## Google OAuth sozlash

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) ga kiring
2. **Create Credentials → OAuth 2.0 Client ID** bosing
3. Application type: **Web application**
4. Authorized redirect URIs ga qo'shing:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
5. `.env` fayliga `GOOGLE_CLIENT_ID` va `GOOGLE_CLIENT_SECRET` ni qo'shing

---

## GitHub OAuth sozlash

1. [GitHub Developer Settings](https://github.com/settings/developers) ga kiring
2. **New OAuth App** bosing
3. **Authorization callback URL**:
   ```
   http://localhost:3000/api/auth/github/callback
   ```
4. `.env` fayliga `GITHUB_CLIENT_ID` va `GITHUB_CLIENT_SECRET` ni qo'shing

---

## Auth endpointlar

| Method | URL | Tavsif |
|--------|-----|--------|
| POST | `/api/auth/login` | Telefon + parol bilan kirish |
| GET | `/api/auth/google` | Google orqali kirish |
| GET | `/api/auth/google/callback` | Google callback |
| GET | `/api/auth/github` | GitHub orqali kirish |
| GET | `/api/auth/github/callback` | GitHub callback |
| GET | `/api/auth/profile` | Profil (JWT kerak) |
| POST | `/api/auth/users` | Yangi user yaratish (SuperAdmin) |
| GET | `/api/auth/users` | Userlar ro'yxati (SuperAdmin) |
| DELETE | `/api/auth/users/:id` | Userni deaktiv qilish (SuperAdmin) |

---

## OAuth callback (Frontend)

OAuth muvaffaqiyatli bo'lganda frontend quyidagi URL ga yo'naltiriladi:

```
{FRONTEND_URL}/auth/callback?token=JWT_TOKEN&user={...}
```

Frontend bu URL dan token va user ni olib, localStorage ga saqlaydi.

---

## Ishga tushirish

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

Swagger: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## Rollar

| Rol | Huquqlar |
|-----|----------|
| **SUPERADMIN** | Barcha amallar + admin/teacher yaratish |
| **ADMIN** | Students, Groups, Payments, Complaints CRUD |
| **TEACHER** | O'z guruhlarini va davomatni boshqarish |
