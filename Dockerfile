# Usamos uma imagem base do Node (Debian based evita problemas de compilação com SQLite)
FROM node:20-slim

# Diretório de trabalho no contentor
WORKDIR /app

# Copiar ficheiros de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o resto do código
COPY . .

# Expor a porta que a app vai utilizar
EXPOSE 3001

# Comando para iniciar o servidor
CMD ["node", "server.js"]
