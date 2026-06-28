FROM node:22-alpine AS spec-builder
WORKDIR /app
COPY package.json package-lock.json* ./
COPY spec/ spec/
COPY tspconfig.yaml ./
RUN npm ci
RUN npm run compile

FROM node:22-alpine AS frontend-builder
WORKDIR /app/booking-ui
COPY booking-ui/package.json booking-ui/package-lock.json* ./
RUN npm ci --legacy-peer-deps
COPY booking-ui/ ./
COPY --from=spec-builder /app/tsp-output/ ../tsp-output/
RUN npm run generate:types
RUN npx vite build

FROM node:22-alpine AS backend-builder
WORKDIR /app/booking-api
COPY booking-api/package.json booking-api/package-lock.json* ./
RUN npm ci
COPY booking-api/ ./
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app

COPY --from=backend-builder /app/booking-api/dist ./booking-api/dist
COPY --from=backend-builder /app/booking-api/node_modules ./booking-api/node_modules
COPY --from=backend-builder /app/booking-api/package.json ./booking-api/package.json

COPY --from=frontend-builder /app/booking-ui/dist ./booking-ui/dist

ENV NODE_ENV=production
EXPOSE 8080

WORKDIR /app/booking-api
CMD ["node", "dist/index.js"]
