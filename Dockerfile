# Dockerfile untuk SIJA Learn (Next.js Production)

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies berdasarkan package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies dari stage deps
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js app
RUN npm run build

# Stage 3: Runner (Production)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create user untuk security (jangan pake root)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start aplikasi
CMD ["node", "server.js"]