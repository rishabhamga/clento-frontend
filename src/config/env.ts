import { z } from 'zod'

const envSchema = z.object({
  // Next.js
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // API
  NEXT_PUBLIC_API_URL: z.string().url('Invalid API URL').default('http://localhost:3001/api'),
  
  // Clerk Authentication (with defaults for simplified deployment)
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).default('pk_test_YmVjb21pbmctbW9zcXVpdG8tODMuY2xlcmsuYWNjb3VudHMuZGV2JA'),
  CLERK_SECRET_KEY: z.string().min(1).default('sk_test_El3pHN9Rqd1BlBzT2nOpllNOMEQzxoufh'),
  
  // App Configuration
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid app URL').default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().default('Clento Clay'),
  
  // Feature Flags
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().default('true').transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_DEBUG: z.string().default('false').transform(val => val === 'true'),
})

// Validate environment variables with defaults
function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join('\n')
      console.error(`Invalid environment variables:\n${missingVars}`)
      // Return defaults instead of throwing
      return envSchema.parse({})
    }
    throw error
  }
}

export const env = validateEnv()

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>
