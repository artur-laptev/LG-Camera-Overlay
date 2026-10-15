# Validation record

## Release preparation, 15 October 2026

Automated checks cover app launch/relaunch cleanup, stale callbacks, BACK and timeout, URL and size/duration bounds; shared encoders, independent TV replacement, slow clients, rejected routes, pinned SSH identity, software fallback, spawn-failure cleanup, private stderr suppression, per-TV renewal thresholds and retry scheduling; and strict configuration validation.

The pairing import helper authenticated against the previously pinned OLED65B9PLA Developer Mode SSH identity. A separate test app ID was installed beside the unchanged working app. The new relay used a distinct port/token and software decoding on macOS ARM64. A real FFmpeg/WebSocket synthetic-video test passed without a camera or TV dependency.

On the dedicated Home Assistant 2026.10.1 Docker test instance, both blueprints imported through the validated API. The native LG integration paired successfully. The imported launch script reached the OLED65B9PLA (firmware 05.50.00, SDK 4.10.0); the TV acknowledged first decoded video after 2,342 ms from HA's launch timestamp in one sample, and reported about 24–25 fps. The viewer subsequently disconnected and its encoder stopped. This is telemetry, not proof of audible native-app sound or physical overlay appearance.

Inert HA event/counter tests passed: first normal event accepted, repeated normal event suppressed, priority accepted during cooldown, subsequent normal suppressed, Pause blocked both event types, and Resume accepted a new normal event after timer cancellation. These tests do not exercise real camera detection zones or a physical doorbell.

A separate 15-second launch completed with encoder/viewer cleanup. A BACK command sent through the lab's native webOS service was followed by viewer disconnection; physical remote-button acceptance remains distinct. The release build disables the packager's automatic JavaScript minification so all ten app files, including GPL/MIT notices, can be compared byte-for-byte with released source. The same packaging method was installed under the separate test app ID for the final TV test.

GitHub CI passed on Ubuntu, Windows and macOS, packaged the TV app on Linux, and built the supplied non-root Linux container. Inside that container the real FFmpeg/WebSocket synthetic-video and cleanup test passed. This confirms the container's software-encoding path, not an actual NAS-to-TV network path.

The production HA instance was not used for project changes or launch tests. Public-package testing used only the dedicated lab. Existing production app/relay configuration was preserved.

## User-confirmed Plex viewing, 15 October 2026

The user confirmed that the overlay works on the Living Room **LG OLED65B9PLA** in both cases:

| Playback path | Result |
|---|---|
| Plex running directly on LG webOS | User-confirmed working |
| Plex running on an Apple TV connected to the LG through HDMI | User-confirmed working |

These reports establish compatibility for the working installation and those two playback paths. The exact overlay package version was not identified in the reports, and separate audio, BACK and timeout checks were not itemized. They do not certify every Plex version, TV firmware or HDMI source.

## Remaining physical/platform limits

Historical YouTube/Netflix viewing confirmation for the predecessor is documented in README; the Plex confirmations above extend the known playback paths. Physical viewing tied specifically to the released 1.0.0 package, BACK/timeout as seen by a person, Disney+, other TV models/firmware and HDMI source/app combinations, actual road-traffic/vehicle filtering, simultaneous physical detection on multiple TVs, Mac reboot/login, TV power-cycle recovery and phone dashboard layout remain unverified. Do not treat this matrix as universal compatibility or a latency guarantee.

Runtime dependencies are audited separately from the official build tool. Docker and cross-platform CI results are visible on the matching release commit; a Docker build alone does not prove a real NAS-to-TV path. No FFmpeg binary/container image is published.
