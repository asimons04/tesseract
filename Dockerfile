FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN ADAPTER=node npm run build


FROM node:22-alpine AS runner
RUN mkdir /app
RUN chown node:node /app
WORKDIR /app
USER node
EXPOSE 3000
COPY package.json ./
COPY --from=builder --chown=node:node /app/build /app/build
CMD ["npm", "run", "start"]