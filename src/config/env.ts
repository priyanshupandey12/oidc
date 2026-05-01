export const env = {
  issuerUrl: process.env.ISSUER_URL!,
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
};