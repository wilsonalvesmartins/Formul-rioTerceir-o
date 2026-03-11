# Usamos uma imagem base do Node (Debian based evita problemas de compilação com SQLite)
FROM node:20-slim

# Diretório de trabalho no container
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o resto do código
COPY . .

# Expor a porta que o app vai rodar
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "server.js"]
