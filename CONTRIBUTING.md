# Contributing

Use a pull request with the concrete problem, changed behavior and verification. Keep credentials, real camera imagery, private network details and HA backups out of commits and issues. Use documentation addresses such as `192.0.2.30` and obvious placeholders.

Run `npm ci --ignore-scripts`, `npm test`, and `npm audit --omit=dev`. For the IPK run `npm ci --prefix tooling --ignore-scripts` then `npm run build`. `node scripts/build.cjs --test` creates a distinct test app ID. Use a distinct relay port and token when testing alongside an existing deployment.

With system FFmpeg installed, run `node tests/encoder-smoke.cjs`. This uses synthetic video, a real encoder and WebSocket, and fake TV SSH. It does not establish native-app compatibility. Describe tests as automated, visually observed, physically/user confirmed or unverified. Add regression tests for authentication, lifecycle, privacy or routing changes; keep input keys stable when updating blueprints.

Contributions to project-owned code are under GPL-3.0-only. Preserve third-party licences. Do not add binary dependencies without provenance and a redistribution/source plan.
