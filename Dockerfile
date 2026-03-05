# ---------- build ----------
FROM node:20-alpine3.20 AS build
WORKDIR /app

RUN apk update && apk upgrade --no-cache && rm -rf /var/cache/apk/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

# ---------- runner ----------
FROM nginx:1.27-alpine AS runner

RUN apk update && apk upgrade --no-cache && rm -rf /var/cache/apk/*

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
