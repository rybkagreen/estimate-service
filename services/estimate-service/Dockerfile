FROM /usr/local/bin/node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/

EXPOSE 3000

USER /usr/local/bin/node

CMD ["/usr/local/bin/node", "dist/main.js"]
