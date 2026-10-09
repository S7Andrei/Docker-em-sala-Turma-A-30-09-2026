FROM node:24-alpine
WORKDIR /app
COPY package.json server.ts ./
RUN mkdir -p /app/registros
EXPOSE 4000
CMD ["node", "server.ts"]
