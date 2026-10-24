# LG TV privacy and your network

Updated 24 October 2026. Adapted for Camera Overlay from the [Home Launcher privacy guide](https://github.com/mbsintegrations/LG-TV-HA-Home-Launcher/blob/main/docs/PRIVACY-AND-NETWORK.md).

Camera Overlay displays your camera locally. It does **not** disable LG's advertising, viewing recognition, voice services or device discovery, change privacy agreements, or block traffic from webOS and streaming apps.

## LG privacy settings

In its [published explanation](https://www.lg.com/global/newsroom/news/statements/statement-understanding-privacy-on-lg-smart-tvs/), LG distinguishes device discovery from Automatic Content Recognition (ACR) and nearby Wi-Fi processing. LG says discovery supports connecting compatible devices rather than advertising profiling; separately, nearby Wi-Fi information can support approximate location for enabled ACR services. LG describes ACR, voice recognition and interest-based advertising as optional services controlled by agreements and settings. These are LG's statements, not results of a firmware or network audit by this project.

Review the TV's viewing-information/ACR, personalised advertising, voice settings and accepted agreements. Names vary by model, region and firmware. Installing either Camera Overlay or Home Launcher does not change them. Discovery traffic alone is not proof of surveillance, and a legitimate discovery feature does not settle questions about other data collection.

## Connections Camera Overlay needs

Use these directions when planning firewall rules. Permit established reply traffic; do not open an entire network merely to make one connection work.

| From | To | Purpose |
|---|---|---|
| Relay host/container | Each configured LG, TCP 9922 | Persistent authenticated SSH connection carrying the camera's reverse tunnel |
| Setup computer | Selected LG's Developer Mode services | Initial pairing and app installation; Key Server is needed while retrieving the key |
| Relay host/container | Configured camera/NVR stream endpoint | RTSP/RTSPS video using the actual stream port; the relay requests RTSP over TCP |
| Home Assistant | Selected LG's webOS control endpoint | Native LG integration launches and dismisses the overlay; retain its existing pairing/control access |
| TV app | TV loopback `127.0.0.1:8766` by default | Video through the SSH tunnel; this is not a public LAN listener |
| Relay host/container | `developer.lge.com`, HTTPS 443 | Optional session checks and renewal, using the privately cached LG session token |

The relay also supports Developer Mode session checks/renewal; preserve the internet access required by that mechanism. TVs may separately need DNS, time, updates, streaming services and local media servers. The [native HA LG integration](https://www.home-assistant.io/integrations/webostv/) documents its setup and discovery requirements.

For this overlay alone, the TV does not need direct access to the camera/NVR or an HA API token. The public IPK contains neither camera credentials nor an HA token. HA supplies a private relay route at launch. If Home Launcher is installed too, retain its separate TV-to-HA connection and protect its token-bearing package.

## Practical network protection

- Put TVs and streaming devices on a media/IoT network with enforced firewall restrictions to trusted computers and storage. Apply rules to IPv4 and IPv6. A different Wi-Fi name or VLAN alone does not enforce isolation; devices on the same VLAN may still reach each other.
- Allow the specific relay-to-TV, relay-to-camera and HA-to-TV paths above. The relay requires ongoing SSH access, not just access during installation. Limit other developer access to your maintenance computer.
- Keep the relay bound to loopback. The supplied container needs no published ports, host networking, privileged mode or Docker socket mount. Never forward TV developer ports or the relay from the internet.
- If casting across networks is needed, forward only the required discovery services and allow the corresponding media/control connections. Do not open all inter-VLAN access. See [Apple's AirPlay network guidance](https://support.apple.com/en-gb/guide/deployment/dep9151c4ace/web) for its discovery cases.
- Keep firmware updated and review optional privacy features. Network isolation limits local access; it does not stop cloud telemetry on an allowed internet connection or nearby radio discovery. Outbound filtering can affect streaming, updates and Developer Mode renewal.

## Camera and credential privacy

The relay converts video without camera audio and does not implement video recording or a cloud relay. RTSP traffic is unencrypted on the camera-to-relay path. RTSPS protection depends on the endpoint and FFmpeg's TLS behaviour; do not assume certificate verification simply from the URL scheme. The relay-to-TV tunnel uses encrypted SSH with a pinned host key.

Protect `private/`, its backups, SSH keys/passphrases, renewal tokens and camera addresses. The relay's shared token grants access to all configured camera routes; camera/TV IDs are not separate permissions. Treat HA launch URLs, script configuration and traces containing that token as secrets. A process able to read the host's private files or FFmpeg command arguments may obtain stream credentials. There is no encryption-at-rest guarantee.

Do not upload private files or unredacted diagnostic bundles to GitHub or Wiki. If exposed, replace the relay token and affected camera credentials, update HA launch routes, and re-pair affected TV access as necessary. See [Security reporting](../SECURITY.md).

These are setup recommendations. Installing Camera Overlay makes no router, firewall or LG privacy-setting changes.
