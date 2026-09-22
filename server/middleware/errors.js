export const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}`, data: null });
};

export const errorHandler = (error, req, res, next) => {
  const status = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
  if (res.headersSent) return next(error);
  res.status(status).json({
    success: false,
    message: status === 500 ? 'Internal server error' : error.message,
    data: null,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
  });
};
