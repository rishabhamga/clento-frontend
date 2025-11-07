# Multi-stage Dockerfile for Next.js on Cloud Run
# Based on official Next.js Docker example

FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set hardcoded environment variables for simplified deployment
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YmVjb21pbmctaGFtc3Rlci02OC5jbGVyay5hY2NvdW50cy5kZXYk
ENV CLERK_SECRET_KEY=sk_test_EI3pHN9RGd1BIBzT2nOplINOMEQzxoufMGx71nBE9s
ENV NEXT_PUBLIC_API_URL=https://api-staging.clento.ai/api
ENV NEXT_PUBLIC_APP_NAME="Clento Clay"
ENV NEXT_PUBLIC_ENABLE_ANALYTICS=true
ENV NEXT_PUBLIC_ENABLE_DEBUG=false

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]
