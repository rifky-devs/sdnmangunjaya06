# Panduan Uji API Singkat

## Health Check
GET http://localhost:5000/api/health

## Login
POST http://localhost:5000/api/auth/login

Body:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

Salin token dari response, lalu gunakan pada header:

```text
Authorization: Bearer <token>
```

## Validasi Nilai

Nilai tugas, UTS, dan UAS harus berada pada rentang 0 sampai 100.
Nilai akhir dihitung dengan rumus:

```text
(30% x Tugas) + (30% x UTS) + (40% x UAS)
```

Status:
- Lulus jika nilai akhir >= 70
- Tidak Lulus jika nilai akhir < 70
