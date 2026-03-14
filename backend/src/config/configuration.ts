export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  supabase: {
    url: process.env.SUPABASE_URL!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
  },
  
  database: {
    url: process.env.DATABASE_URL!,
  },
  
  jwt: {
    secret: process.env.JWT_SECRET!,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  ai: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY!,
    },
    groq: {
      apiKey: process.env.GROQ_API_KEY!,
    },
    cohere: {
      apiKey: process.env.COHERE_API_KEY!,
    },
  },
  
  rateLimit: {
    standard: parseInt(process.env.RATE_LIMIT_STANDARD || '100', 10),
    ai: parseInt(process.env.RATE_LIMIT_AI || '10', 10),
    auth: parseInt(process.env.RATE_LIMIT_AUTH || '5', 10),
  },
  
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
    allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(','),
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
});
