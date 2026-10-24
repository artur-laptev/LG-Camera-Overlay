# Easier installation: options and proposed configurator

Research date: 24 October 2026. This is a proposal, not a released installer. Use [Start here](START-HERE.md) for the current version.

## Recommendation

Build one shared setup engine with a local browser configurator first, borrowing the [Home Launcher's wizard](https://github.com/mbsintegrations/LG-TV-HA-Home-Launcher/tree/main/wizard). Then package the same engine for Home Assistant OS with an ingress setup screen. Provide a prebuilt relay image for Docker/NAS users so they can download rather than build it.

The Launcher setup computer can be switched off after installation; Camera Overlay's video relay must remain available. A configurator can remove JSON editing and repeated commands, but cannot remove that video-processing requirement or LG's on-TV Developer Mode/account steps.

## What is difficult today

The current [guide](START-HERE.md) asks users to install Docker and Node, install the TV app in Dev Manager, pair again through the official CLI, import the pairing, edit JSON, build a container and manually compose a secret HA stream URL. Errors often depend on which machine a command is running on. A NAS adds a private-file transfer and permissions step.

The existing [configuration validator](../relay/config.cjs), [pairing helper](../scripts/pair.cjs), health endpoint and HA blueprints are useful foundations. The pairing helper currently imports an already paired official CLI profile; it is not an end-to-end setup wizard.

## Options compared

| Option | What becomes easier | Remaining work | Priority |
|---|---|---|---|
| Local browser wizard, based on Launcher | Forms instead of JSON, generated routes, guided pairing and diagnostics | Starting the wizard still needs Node unless packaged; host startup remains platform-specific | First implementation |
| Prebuilt versioned Docker images for x86-64 and ARM64 | No local image build; reusable NAS/Compose instructions | Docker installation, private volume permissions and real hardware testing | Alongside wizard |
| HA OS App with ingress | Install/start/update through HA; setup in the HA sidebar; no separate desktop runtime | New packaging, resource testing and Supervisor-specific security adapter | Best eventual HA OS experience |
| Signed desktop installer | Double-click setup, bundled runtime and managed service | Separate Windows/macOS/Linux builds, signing/notarisation, updates and FFmpeg redistribution maintenance | Later, if demand warrants |
| Static website configurator | Simple layout/form preview and non-secret profile generation | Cannot itself run SSH, install an IPK or start FFmpeg; would still need a local agent | Preview only |
| HACS integration alone | Familiar HA distribution route | Does not supply the separate encoder runtime or TV Developer Mode pairing | Not the primary installer |

[Home Assistant's installation comparison](https://www.home-assistant.io/installation/#about-installation-types) distinguishes HA OS Apps from HA Container. The existing NAS HA Container lab can test relay behaviour, but cannot prove a Supervisor/ingress installation; that needs a separate disposable HA OS test environment.

## Proposed user journey

1. **Choose where it runs.** HA OS, NAS/Linux Docker, Windows or Mac. Separately choose where HA runs. Explain which device must stay on and show only the relevant instructions.
2. **Add a TV.** Enter its address and the Developer Mode passphrase, or reuse an existing paired profile. Show the TV model/firmware, establish and retain its SSH identity, and install the released IPK through a clearly labelled action. Keep LG account sign-in on the TV.
3. **Add a camera.** Enter a friendly name and RTSP/RTSPS address in a password-style field. Offer UniFi stream-location help and a generic camera route. A bounded, user-started stream test reports whether decoding works without exposing the address in logs.
4. **Choose the panel.** Preview label, size and duration using sample imagery. Preview controls do not launch anything on a TV.
5. **Connect HA.** Optionally discover TVs and trigger entities through a read-only request. Generate the private launch settings and link to the existing blueprint import. Reuse existing native LG integrations. Explain that camera video and person/vehicle/doorbell triggers are separate inputs.
6. **Try it and finish.** A deliberate test button targets only the selected TV. Report pairing, tunnel, decoder and first-frame results separately; ask the viewer to check picture/sound and dismissal. Show host-startup and Developer Mode renewal status, then offer a redacted support report.

The first version should not silently create or enable household automations. Start with a manual launch; offer automatic alerts as a separate guided step. Ordinary layout exports should omit credentials; complete private backups must be clearly distinguished and protected.

## Reuse and changes needed

Reuse the Launcher's local-session protection, Host/Origin checks, bounded requests, text-safe rendering, read-only HA discovery and token-free sample preview. Keep its dedicated non-admin HA account guidance if an optional HA token is used; selecting a few entities does not restrict that token's permissions. Overlay's TV app does not need that HA token.

Refactor pairing into a reusable module with CLI and UI adapters. Prefer one pairing flow for app installation and the relay; preserve changed-host-key rejection. [webOS Dev Manager](https://github.com/webosbrew/dev-manager-desktop#features) advertises CLI-compatible configuration, so test supported profile imports before asking users to pair twice. Do not assume every OS/version stores keys identically.

Use the existing runtime validator to generate settings, random tokens and matching HA routes. Save atomically with a private rollback copy and preserve unmodified TVs/cameras. Run tools with argument arrays, not shell strings. Restrict tests to explicitly supplied targets with timeouts and bounded output. Redact credentials from errors and never store them in browser localStorage or telemetry.

Desktop setup should stay on loopback with a session token and Host/Origin checks. A NAS setup screen must not become an unauthenticated LAN service: use an SSH-forwarded loopback session initially, or implement a separately authenticated HTTPS administration mode. Do not mount the Docker socket merely to start the relay from a web page.

An HA OS build needs a separate [ingress adapter](https://contributors.home-assistant.io/apps/guides/ingress/): relative URLs, Supervisor-only ingress traffic and administrator access. Keep the video listener separate on loopback. Use only the [HA/Supervisor API permissions](https://contributors.home-assistant.io/apps/guides/communication/) required by chosen features, and keep credentials out of the TV package. The Launcher's loopback server cannot be copied unchanged into ingress.

## Packaging and acceptance

Publish versioned, digest-pinned images with architecture manifests, checksums, dependency inventory and retained build/source information. [Docker documents multi-platform builds](https://docs.docker.com/build/building/multi-platform/); a successful emulated ARM build is not a transcoding benchmark. Shipping FFmpeg in images or desktop bundles also requires reviewing the [licensing obligations for that exact build](https://ffmpeg.org/legal.html). Current releases deliberately build it locally.

Before calling a new path beginner-ready, test a clean installation, update preserving private settings, rollback, restart recovery, invalid credentials, key mismatch and redacted diagnostics. Measure one camera on actual x86-64 and ARM64 hosts before declaring hardware support. Keep existing installations and Developer Mode renewal owners intact, including when Launcher and Overlay share a TV.

LG's [Developer Mode instructions](https://webostv.developer.lge.com/develop/getting-started/developer-mode-app) still require on-TV setup and session maintenance. Show expiry/failure clearly instead of promising permanent installation.
