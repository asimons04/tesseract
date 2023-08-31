FROM node:20-alpine as builder
WORKDIR /app
COPY package.json ./
RUN npm install
EXPOSE 3000
COPY . .
RUN ADAPTER=node npm run build

FROM node:20-alpine
WORKDIR /app
USER node
COPY package.json ./
COPY --from=builder /app /app
CMD ["npm", "run", "start"]
