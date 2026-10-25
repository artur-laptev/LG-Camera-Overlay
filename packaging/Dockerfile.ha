FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund && npm cache clean --force
COPY relay ./relay
COPY setup ./setup
COPY dist ./dist
COPY entrypoint.sh /entrypoint.sh
RUN chmod 755 /entrypoint.sh
ENV OVERLAY_DATA_DIR=/data
ENTRYPOINT ["/entrypoint.sh"]
