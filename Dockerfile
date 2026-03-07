# ---------- build ----------
FROM node:22-alpine3.23 AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

# ---------- runner ----------
FROM nginx:stable-alpine3.23 AS runner

RUN apk update && \
    apk upgrade --no-cache && \
    apk add --no-cache --upgrade libxml2 libpng zlib && \
    rm -f /usr/bin/untgz && \
    rm -rf /var/cache/apk/*

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
