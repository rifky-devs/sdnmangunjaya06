# Backend - Sistem Informasi Penilaian Siswa SDN Mangunjaya 06

Backend dibuat menggunakan Node.js, Express.js, MySQL, mysql2, JWT, bcryptjs, helmet, cors, dan dotenv.

## Cara Running Backend

1. Pastikan XAMPP/MySQL sudah berjalan.

2. Buat database di phpMyAdmin:
   ```sql
   CREATE DATABASE db_sdnmangunjaya06;
   ```

3. Import file SQL:
   ```text
   database/schema.sql
   ```

4. Masuk ke folder backend:
   ```bash
   cd sdnmangunjaya06-backend
   ```

5. Install dependency:
   ```bash
   npm install
   ```

6. Buat file `.env` dari contoh:
   ```bash
   copy .env.example .env
   ```
   Untuk PowerShell:
   ```powershell
   Copy-Item .env.example .env
   ```

7. Sesuaikan `.env` dengan MySQL lokal:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=db_sdnmangunjaya06
   ```

8. Jalankan seed data:
   ```bash
   npm run seed
   ```

9. Jalankan backend:
   ```bash
   npm run dev
   ```

10. Test API:
   ```text
   http://localhost:5000/api/health
   ```

## Akun Demo

| Role | Username | Password |
|---|---|---|
| Admin | admin | admin123 |
| Guru | guru | guru123 |
| Siswa | siswa | siswa123 |

## Endpoint Utama

| Endpoint | Fungsi |
|---|---|
| POST /api/auth/login | Login role admin/guru/siswa |
| GET /api/students | Data siswa |
| POST /api/students | Tambah siswa |
| GET /api/teachers | Data guru |
| POST /api/teachers | Tambah guru |
| GET /api/classes | Data kelas |
| GET /api/subjects | Data mata pelajaran |
| POST /api/grades | Input nilai |
| GET /api/grades | Laporan nilai admin |
| GET /api/grades/my-subject | Rekap nilai guru |
| GET /api/grades/me | Nilai pribadi siswa |
