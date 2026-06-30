<<<<<<< HEAD
FROM node:18-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 3003
CMD sh -c "npx prisma db push && (npx ts-node src/seed.ts || echo 'Seed ya aplicado') && npm run dev"
=======
# ── Build stage ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Agregamos las librerías necesarias para el motor de Prisma en Alpine
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar schema de Prisma y generar cliente con los binaryTargets del archivo
COPY prisma ./prisma/
RUN npx prisma generate

# Compilar TypeScript
COPY tsconfig.json ./
COPY src ./src/
RUN npm run build

# ── Runtime stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

# Instalamos las librerías criptográficas en la imagen final de ejecución
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Solo dependencias de producción
COPY package*.json ./
RUN npm install --omit=dev

# Copiar Prisma + cliente generado + archivos compilados desde el builder
COPY --from=builder /app/prisma ./prisma/
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma/
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma/
COPY --from=builder /app/dist ./dist/

EXPOSE 3001

# Comando definitivo con db push automático
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && (node dist/seed.js || true) && node dist/index.js"]
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
