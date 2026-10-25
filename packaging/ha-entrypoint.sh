#!/bin/sh
set -eu
# Supervisor provides /data. Drop privileges after preparing only this app's storage.
mkdir -p /data/private /data/logs
chown -R node:node /data/private /data/logs
chmod 700 /data/private /data/logs
exec su -s /bin/sh node -c 'exec node /app/setup/server.cjs --ingress --managed'
