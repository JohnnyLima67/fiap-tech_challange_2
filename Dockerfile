# Etapa 1: Imagem base com Node
FROM node:18-alpine AS build

# Diretório de trabalho
WORKDIR /app

# Copia arquivos essenciais
COPY package*.json ./
COPY tsconfig.json ./

# Instala dependências
RUN npm install

# Copia restante do projeto (src, etc)
COPY . .

# Compila com tsup
RUN npm run build

# Etapa 2: Imagem final, só com arquivos necessários
FROM node:18-alpine

WORKDIR /app

# Copia apenas arquivos compilados
COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./
COPY --from=build /app/.env ./

# Reinstala só dependências em produção (se preferir, pode usar `npm ci --omit=dev`)
RUN npm install --omit=dev

# Porta exposta (vem da variável PORT)
EXPOSE 3000

# Inicia o app
CMD ["node", "build/server.js"]