FROM node:20-bookworm AS development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 5000
CMD ["npm", "run", "dev"]

FROM node:20-bookworm AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm prune --omit=dev

FROM node:20-bookworm AS production
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 5000
CMD ["npm", "start"]