FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

FROM base AS build
WORKDIR /app
COPY . /app

RUN corepack enable
RUN apk add --no-cache python3 alpine-sdk

RUN pnpm install --frozen-lockfile

ENV WEB_DEFAULT_API=https://cobalty-yzvrpx.cranl.net
RUN pnpm --filter @imput/cobalt-web build

FROM base AS web
WORKDIR /app

COPY --from=build --chown=node:node /app/web/build /app/build
COPY --from=build --chown=node:node /app/web/server.cjs /app/server.cjs

USER node

EXPOSE 3000
CMD [ "sh", "-c", "exec node server.cjs" ]
