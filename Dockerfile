FROM node:24-alpine

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app
COPY . /app

RUN corepack enable
RUN apk add --no-cache python3 alpine-sdk
RUN pnpm install --frozen-lockfile

ENV WEB_DEFAULT_API=https://cobalty-yzvrpx.cranl.net
RUN pnpm --filter @imput/cobalt-web build

WORKDIR /app/web
USER node
EXPOSE 3000
CMD ["node", "server.cjs"]
