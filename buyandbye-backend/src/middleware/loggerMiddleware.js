/**
 * HTTP Request Logger Middleware
 */
export function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const color = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
    console.log(
      `[HTTP] ${req.method.padEnd(6)} ${req.originalUrl} ${color}${res.statusCode}\x1b[0m (${duration}ms)`
    );
  });
  next();
}
