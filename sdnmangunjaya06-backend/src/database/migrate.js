import { pool, testConnection } from '../config/database.js';

const migrate = async () => {
  try {
    await testConnection();
    console.log('Memulai migrasi database...');

    const connection = await pool.getConnection();

    try {
      // Check if photo column already exists in students
      const [studentCols] = await connection.query("SHOW COLUMNS FROM students LIKE 'photo'");
      if (studentCols.length === 0) {
        console.log('Menambahkan kolom photo ke tabel students...');
        await connection.query('ALTER TABLE students ADD COLUMN photo VARCHAR(255) NULL AFTER class_id');
        console.log('Kolom photo berhasil ditambahkan ke tabel students.');
      } else {
        console.log('Kolom photo sudah ada di tabel students.');
      }

      // Check if photo column already exists in teachers
      const [teacherCols] = await connection.query("SHOW COLUMNS FROM teachers LIKE 'photo'");
      if (teacherCols.length === 0) {
        console.log('Menambahkan kolom photo ke tabel teachers...');
        await connection.query('ALTER TABLE teachers ADD COLUMN photo VARCHAR(255) NULL AFTER subject_id');
        console.log('Kolom photo berhasil ditambahkan ke tabel teachers.');
      } else {
        console.log('Kolom photo sudah ada di tabel teachers.');
      }

      // Check if photo column already exists in users
      const [userCols] = await connection.query("SHOW COLUMNS FROM users LIKE 'photo'");
      if (userCols.length === 0) {
        console.log('Menambahkan kolom photo ke tabel users...');
        await connection.query('ALTER TABLE users ADD COLUMN photo VARCHAR(255) NULL AFTER is_active');
        console.log('Kolom photo berhasil ditambahkan ke tabel users.');
      } else {
        console.log('Kolom photo sudah ada di tabel users.');
      }

      console.log('Migrasi database selesai dengan sukses.');
    } catch (err) {
      console.error('Gagal menjalankan query migrasi:', err.message);
      process.exitCode = 1;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Gagal terhubung ke database:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

migrate();
