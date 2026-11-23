import dotenv from 'dotenv';

dotenv.config();

const env = {
    PORT: process.env.PORT || 4000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL || '',
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    SOCKET_PORT: process.env.SOCKET_PORT || 5000,
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || [
        'http://localhost:3000',
        'https://stuflux.vercel.app',
    ],
    CLERK_API_KEY: process.env.CLERK_API_KEY || '',
    CLOUDINARY_URL: process.env.CLOUDINARY_URL || '',
};

export default env;