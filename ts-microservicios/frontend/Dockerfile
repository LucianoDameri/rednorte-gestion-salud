<<<<<<< HEAD
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
=======
# ── Build stage: compilar React con Vite ───────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# En Docker el proxy de Vite no aplica; se usa nginx en runtime.
# El frontend solo hace llamadas a /bff (rutas relativas) → nginx las redirige al BFF.
RUN npm run build

# ── Runtime stage: nginx sirve el build estático ───────────────────────────
FROM nginx:1.27-alpine AS runner

# Configuración de nginx con proxy al BFF
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Archivos estáticos del build de Vite
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
