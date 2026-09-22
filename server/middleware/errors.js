export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

export const errorHandler = (error, req, res, next) => {
  const status = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
  if (res.headersSent) return next(error);
  res.status(status).json({
    message: status === 500 ? 'Internal server error' : error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
  });
};
