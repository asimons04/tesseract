FROM node:20-alpine as builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN ADAPTER=node npm run build


FROM node:20-alpine as runner
WORKDIR /app
USER node
EXPOSE 3000
COPY package.json ./
COPY --from=builder --chown=1000:1000 /app /app
CMD ["npm", "run", "start"]