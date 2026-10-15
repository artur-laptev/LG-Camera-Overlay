FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund && npm cache clean --force
COPY relay ./relay
COPY scripts/check-config.cjs ./scripts/check-config.cjs
ENV OVERLAY_DATA_DIR=/data
USER node
CMD ["node", "relay/relay.cjs"]
