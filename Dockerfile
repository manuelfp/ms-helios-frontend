# ---------- build ----------
FROM node:20-alpine3.20 AS build
WORKDIR /app

RUN apk update && apk upgrade --no-cache && rm -rf /var/cache/apk/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_MEASUREMENT_ID
ARG VITE_API_BASE_URL

RUN npm run build

# ---------- runner ----------
FROM nginx:1.27-alpine AS runner

RUN apk update && apk upgrade --no-cache && rm -rf /var/cache/apk/*

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
