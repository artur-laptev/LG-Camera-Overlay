# Security

See [LG TV privacy and network protection](docs/PRIVACY-AND-NETWORK.md) for LG privacy settings, media/IoT isolation, the Overlay's required connections and private camera/token handling.

Report vulnerabilities using this repository's private GitHub security advisory reporting when available. Do not disclose camera stream URLs, relay/session tokens, SSH keys, passphrases or unredacted HA traces in public issues. If private reporting is unavailable, open an issue asking for a private reporting route without exploit details or secrets.

Use the current release and review dependency advisories. The relay is intended for a trusted local installation with loopback listeners and pinned SSH. It is not designed for a public reverse proxy or hostile multi-tenant host. The shared relay token grants access to all configured routes. Pairing first-use trust must be established on a trusted network; future pin mismatches are refused.

Supported fixes target the latest release. See docs/LICENSING.md for the separate official build-tool audit limitation. Production runtime packages are audited independently.
