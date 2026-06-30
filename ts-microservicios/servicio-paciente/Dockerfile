FROM node:18-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 3001
CMD sh -c "npx prisma db push && (npx ts-node src/seed.ts || echo 'Seed ya aplicado') && npm run dev"
