# Frontend - Sistem Informasi Penilaian Siswa SDN Mangunjaya 06

Frontend dibuat menggunakan React, Vite, Tailwind CSS, React Router, Axios, Lucide React, dan Framer Motion.

## Cara Running Frontend

1. Masuk ke folder frontend:
   ```bash
   cd sdnmangunjaya06-frontend
   ```

2. Install dependency:
   ```bash
   npm install
   ```

3. Buat file `.env` dari contoh:
   ```bash
   copy .env.example .env
   ```
   Untuk Windows PowerShell bisa pakai:
   ```powershell
   Copy-Item .env.example .env
   ```

4. Pastikan isi `.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

5. Jalankan frontend:
   ```bash
   npm run dev
   ```

6. Buka browser:
   ```text
   http://localhost:5173
   ```

## Akun Demo

Akun dibuat dari seed backend:

| Role | Username | Password |
|---|---|---|
| Admin | admin | admin123 |
| Guru | guru | guru123 |
| Siswa | siswa | siswa123 |

## Catatan

Frontend membutuhkan backend berjalan pada `http://localhost:5000`.
