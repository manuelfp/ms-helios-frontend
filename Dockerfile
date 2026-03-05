# ---------- deps ----------
FROM node:20-alpine3.20 AS deps
WORKDIR /app

# Update Alpine packages to fix vulnerabilities
RUN apk update && apk upgrade --no-cache && rm -rf /var/cache/apk/*

RUN corepack enable

# Yarn v4 (Berry)
COPY package.json yarn.lock .yarnrc.yml ./
# Note: .yarn/ directory not needed when using nodeLinker: node-modules

RUN yarn install --immutable

# ---------- build ----------
FROM node:20-alpine3.20 AS build
WORKDIR /app

# Update Alpine packages to fix vulnerabilities
RUN apk update && apk upgrade --no-cache && rm -rf /var/cache/apk/*

RUN corepack enable

COPY --from=deps /app/ /app/
COPY . .

RUN yarn build

# ---------- runner ----------
FROM node:20-alpine3.20 AS runner
WORKDIR /app

# Update Alpine packages to fix vulnerabilities
RUN apk update && apk upgrade --no-cache && rm -rf /var/cache/apk/*

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Next standalone output:
# - server.js + minimal node_modules live inside .next/standalone
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 8080

CMD ["node", "server.js"]
