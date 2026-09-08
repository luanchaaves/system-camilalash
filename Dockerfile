# ========================================================================
# CAMILA RODRIGUES BEAUTY STUDIO — DOCKERFILE MULTI-STAGE
# ========================================================================

# --- ESTÁGIO 1: BUILD ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copia dependências e instala
COPY package.json package-lock.json ./
RUN npm ci

# Copia código-fonte e compila
COPY . .

# Argumentos de ambiente opcionais durante o build
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN npm run build

# --- ESTÁGIO 2: PRODUÇÃO (NGINX ALPINE LEVE) ---
FROM nginx:alpine-slim

# Copia configuração customizada do Nginx para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia artefatos compilados do estágio anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Expõe a porta 80
EXPOSE 80

# Inicia o servidor Nginx
CMD ["nginx", "-g", "daemon off;"]
