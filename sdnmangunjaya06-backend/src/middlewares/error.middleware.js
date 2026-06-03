export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    message: `Endpoint ${req.originalUrl} tidak ditemukan.`
  });
};

export const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    message: error.message || 'Terjadi kesalahan pada server.'
  });
};
