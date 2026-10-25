# Validation record

## Tested and operating setups

Status recorded 16 October 2026. “Operating reference” means the existing installation preserved during release work, supported by saved deployment evidence and user viewing reports. It is not a new live audit of production HA or a claim that the reference was upgraded to public v1.0.0.

| Setup or behaviour | Evidence | Limits |
|---|---|---|
| Operating reference: UniFi Protect detections/medium streams → HA native Protect and LG integrations → native Node/FFmpeg relay on Apple Silicon Mac mini → LG TVs | Existing household deployment, original app recorded as v0.3.1; saved rules and user confirmations | Household scripts predate the public blueprints; production HA version/host and Protect version were not freshly inventoried for this publication |
| Living Room LG OLED65B9PLA, firmware 05.50.00 / webOS SDK 4.10.0 | Historical physical YouTube/Netflix acceptance; user-confirmed native Plex and Apple TV HDMI Plex viewing | Plex report did not identify package version or separately itemize audio/BACK/timeout |
| Second LG 65NANO766QA, firmware 04.60.91 / webOS SDK 7.6.0 | Historical physical Netflix acceptance, including video, underlying audio and automatic close | Not a public v1.0.0 acceptance test on this model |
| Both LG TVs with Apple TV and NVIDIA SHIELD TV Pro over HDMI | User reported overlay appearance with Netflix, Amazon Prime Video and Plex on each player and each TV: all 12 combinations, detailed below | Appearance confirmed; player/app versions, video modes and per-combination audio/BACK/timeout results were not itemized |
| Reference person detection and doorbell priority | Historical real walk triggered Front Right and suppressed overlapping Front Left; physical entry ring took over during cooldown | Not exhaustive zone-boundary, road-traffic/vehicle or simultaneous physical multi-TV detection validation |
| User photo session, 16 October 2026 | Direct launch of the existing Living Room TV app was accepted; user supplied photos showing the Front Left panel over a programme | Did not use HA detection triggers; README image is AI-retouched, not raw timing evidence |
| Public-release lab: HA 2026.10.1 in a NAS Docker container, native LG integration, separate test TV app and native macOS ARM64 relay with software decoding | Blueprint import, inert event/counter rules and actual OLED65B9PLA video telemetry; firmware 05.50.00 / SDK 4.10.0. User subsequently confirmed correct panel appearance, continuing underlying picture/sound and roughly 30-second auto-close | The relay was on the Mac, not inside the NAS HA container; physical zone/ring inputs were not replayed through these public blueprints; physical remote BACK was not confirmed |
| Linux x86-64 relay Docker container in CI | Real FFmpeg synthetic stream, WebSocket and cleanup checks, with simulated SSH | CI alone does not prove a physical TV route; the separate 25 October NAS acceptance below now covers one |
| Windows/macOS automated tests | Node tests and relevant build checks passed | Does not prove Docker Desktop networking, startup or physical TV playback |
| Windows Docker Desktop, Mac Docker Desktop, ARM64 Docker/Pi, shared HA/relay hosts | Documented installation approaches and resource recommendations | No end-to-end physical acceptance or benchmarked minimum for these deployments |
| Non-UniFi detectors/cameras, including Frigate, MQTT and webhooks | Possible connection patterns described in [detection flow](DETECTION-FLOW.md) | Not tested integrations for this project; video and detection need independent validation |
| Direct HA OS App installation | Experimental package supplied with v1.1.0 | **NOT TESTED**: no HA OS/Supervisor ingress or lifecycle acceptance |
| v1.1.0 configurator and Linux x64 NAS relay → separate HA 2026.10.1 test container → OLED65B9PLA | 25 October: 18 acceptance checks; pinned pairing, test app install, real stream, HA launch and user-confirmed panel/picture/sound/auto-close | One TV/camera; not HA OS, ARM64, Docker Desktop or a sustained capacity benchmark |

The NAS HA lab was stopped after testing. The operating reference app/relay was retained. Detailed release tests follow; they must not be read as certification of the untested rows above.


## Configurator and NAS Docker acceptance, 25 October 2026

The local configurator and relay were built and run on the NAS as non-root Linux x64 containers (Node v22.23.4, UID 1000, read-only filesystem, dropped capabilities, no published ports). Only the separate HA Test 2026.10.1 instance was used. The production HA configuration and operating relay were not changed.

- Existing player/relay checks and all **13 Node tests** passed on Windows and inside the NAS container.
- **18 acceptance checks passed**: request guards; FFmpeg and real camera decode; saved settings; HA discovery and generated script; unavailable-TV safeguard; real RTSP → WebSocket → decoder; viewer/encoder cleanup; pinned TV pairing; separate test app installation; HA launch; decoded TV frames; auto-close; shutdown and production-app readback.
- OLED65B9PLA: firmware **05.50.00**, SDK **4.10.0**. The separate test package was installed through the configurator's pinned SSH adapter; the working app was not replaced.
- The announced repeat measured first TV video **2,250 ms** after the HA launch command and about **16 fps** at **768×432**. The first run measured **2,483 ms** and about **17 fps**. These are samples, not a guaranteed rate or hardware minimum.
- The user watched the announced repeat and confirmed **“Yes, all worked”** to correct panel display, continuing underlying picture/sound and automatic close after 30 seconds. The playback source was not recorded; physical BACK and detection-zone inputs were not part of this run.
- The temporary test app was removed, original app metadata was unchanged, temporary NAS credential copies were removed, the test login was revoked, and HA Test/review containers were stopped.

The NAS's older Docker builder required the public IPK/checksum exceptions in the root ignore file. HA Test's own Docker network resolved a container-to-host-port routing failure. These fixes are reflected in the supplied packaging and installation notes. The test reused an existing pairing key; first-time Key Server retrieval was not separately physically accepted.

**HA OS App / Supervisor ingress: NOT TESTED.** Its experimental package is explicitly separate from the tested Docker route. Windows/macOS Docker Desktop and ARM64 end-to-end playback remain unverified. The configurator screenshots use sample mode and are not connection or performance evidence.

## TV software version evidence

| LG TV model | TV firmware | Reported webOS SDK (`sdkVersion`) | Evidence |
|---|---|---|---|
| OLED65B9PLA | 05.50.00 | 4.10.0 | Recorded in the 12 October 2026 deployment and reconfirmed during public-release lab testing |
| 65NANO766QA | 04.60.91 | 7.6.0 | Recorded in the 12 October 2026 deployment; not freshly queried on 16 October because the TV was unreachable |
| 55NANO766QA | 04.60.91 | 7.6.0 | Queried through the Developer Mode CLI on 16 October 2026 |

A separate webOS marketing/platform version was not captured. Firmware and SDK are distinct values; neither should be relabelled as the other or treated as a minimum supported version. Subsequent viewing reports did not independently recheck software versions.

An additional **55NANO766QA** reported firmware **04.60.91** and SDK **7.6.0** through the Developer Mode CLI on 16 October 2026. Its overlay test was cancelled before app installation or playback, so it is **not a tested overlay model**. Matching firmware and SDK alone do not establish compatibility.

## Release preparation, 15 October 2026

Automated checks cover app launch/relaunch cleanup, stale callbacks, BACK and timeout, URL and size/duration bounds; shared encoders, independent TV replacement, slow clients, rejected routes, pinned SSH identity, software fallback, spawn-failure cleanup, private stderr suppression, per-TV renewal thresholds and retry scheduling; and strict configuration validation.

The pairing import helper authenticated against the previously pinned OLED65B9PLA Developer Mode SSH identity. A separate test app ID was installed beside the unchanged working app. The new relay used a distinct port/token and software decoding on macOS ARM64. A real FFmpeg/WebSocket synthetic-video test passed without a camera or TV dependency.

On the dedicated Home Assistant 2026.10.1 Docker test instance, both blueprints imported through the validated API. The native LG integration paired successfully. The imported launch script reached the OLED65B9PLA (firmware 05.50.00, SDK 4.10.0); the TV acknowledged first decoded video after 2,342 ms from HA's launch timestamp in one sample, and reported about 24–25 fps. The viewer subsequently disconnected and its encoder stopped. These measurements are telemetry; the separate user viewing confirmation below establishes appearance, sound and automatic dismissal for the observed test.

### Physical viewing confirmation received 16 October 2026

In a direct reply to the pending acceptance question about the separate Living Room test app decoding live video at about 24 fps, the user confirmed: **“Yes, picture/sound and auto-close worked.”** The question explicitly asked whether the camera panel appeared correctly while the underlying picture and sound continued, and whether it closed after roughly 30 seconds. Those checks are therefore user-confirmed for that lab viewing session.

This confirmation concerns the separate test app, not a new production HA test. It does not identify the underlying playback app, separately confirm physical remote BACK, or identify which intermediate/final package build was observed. Do not extend it to every playback source or claim a checksum-specific downloaded v1.0.0 viewing test.

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

## User-confirmed HDMI viewing, 16 October 2026

The user tested both TVs with Apple TV and repeated the tests with NVIDIA SHIELD TV Pro. They reported that **the overlay appeared in every case** with Netflix, Amazon Prime Video and Plex.

| LG TV | HDMI player | Netflix | Amazon Prime Video | Plex |
|---|---|---|---|---|
| OLED65B9PLA | Apple TV | Overlay appeared | Overlay appeared | Overlay appeared |
| OLED65B9PLA | NVIDIA SHIELD TV Pro | Overlay appeared | Overlay appeared | Overlay appeared |
| 65NANO766QA | Apple TV | Overlay appeared | Overlay appeared | Overlay appeared |
| 65NANO766QA | NVIDIA SHIELD TV Pro | Overlay appeared | Overlay appeared | Overlay appeared |

These are user-reported physical results for the existing working installation, covering 12 TV/player/service combinations. They are HDMI-player tests, not a claim that Amazon Prime Video was also tested as a native LG app. The report did not identify the Apple TV model, player OS/app versions, exact overlay package build, HDMI video modes (such as HDR/Dolby Vision or refresh rate), or separately itemize audio, physical BACK and automatic close for each combination. The earlier lab sound/auto-close confirmation remains separate evidence.

The LG renders the overlay above the HDMI picture; neither Apple TV nor SHIELD needs the overlay app installed. This explains why different connected players can work with the same LG-side installation. It is a reasonable architectural expectation that other HDMI sources could work too, not proof of universal compatibility across devices, video modes or firmware. Test each source and mode you intend to use.

## Remaining physical/platform limits

Historical YouTube/Netflix viewing confirmation for the predecessor is documented in README; the native Plex and 12 HDMI combinations above extend the known playback paths. The separate lab app's appearance, underlying picture/sound and roughly 30-second automatic close are user-confirmed. Physical viewing tied to the exact released 1.0.0 download, physical remote BACK for the lab app, Disney+, native LG Amazon Prime Video, other TV models/firmware and HDMI combinations or video modes not identified above, actual road-traffic/vehicle filtering, simultaneous physical detection on multiple TVs, Mac reboot/login, TV power-cycle recovery and phone dashboard layout remain unverified. Do not treat this matrix as universal compatibility or a latency guarantee.

Runtime dependencies are audited separately from the official build tool. Docker and cross-platform CI results are visible on the matching release commit; a Docker build alone does not prove a real NAS-to-TV path. No FFmpeg binary/container image is published.
