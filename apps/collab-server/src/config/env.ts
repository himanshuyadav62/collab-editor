import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '1234', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
};
