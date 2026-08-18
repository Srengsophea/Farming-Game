FROM node:20-slim

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/

RUN npm install

COPY backend/src ./backend/src
COPY backend/tsconfig.json ./backend/
COPY shared/src ./shared/src
COPY shared/tsconfig.json ./shared/

EXPOSE 3001

CMD ["npm", "run", "dev:backend"]
