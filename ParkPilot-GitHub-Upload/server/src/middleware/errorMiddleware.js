export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(res.statusCode && res.statusCode !== 200 ? res.statusCode : 500).json({
    message: err.message || "Something went wrong.",
  });
};
