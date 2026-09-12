# ========================================================================
# CAMILA RODRIGUES BEAUTY STUDIO — DOCKERFILE MULTI-STAGE
# Node.js 20 Backend API + SPA Frontend + Banco Persistente no Disco
# ========================================================================

# --- ESTÁGIO 1: BUILD DO FRONTEND ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copia manifests e instala dependências de compilação
COPY package.json package-lock.json ./
RUN npm ci

# Copia código-fonte e compila os assets estáticos do Vite
COPY . .

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN npm run build

# --- ESTÁGIO 2: SERVIDOR DE PRODUÇÃO PERSISTENTE ---
FROM node:20-alpine AS runner

WORKDIR /app

# Instala apenas dependências de produção necessárias
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copia o backend do servidor e os arquivos compilados do frontend
COPY server/ ./server/
COPY --from=builder /app/dist ./dist

# Cria e declara o diretório de dados persistentes do banco
RUN mkdir -p /app/data
VOLUME ["/app/data"]

ENV NODE_ENV=production
ENV PORT=80
ENV DATA_DIR=/app/data

# Expõe a porta 80 do container
EXPOSE 80

# Inicia o servidor com o banco persistente
CMD ["node", "server/index.js"]
