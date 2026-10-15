# Hosting on Home Assistant hardware

Ready to install? [Choose your setup](START-HERE.md) provides step-by-step Docker routes for Windows, Mac and Linux, with HA on the same computer or elsewhere.

You do not necessarily need another computer. The Node/FFmpeg relay can share a suitable host with Home Assistant, provided there is enough spare capacity for video decoding and encoding. The TV app still runs on the LG, and HA still uses its native LG integration to launch it.

## Choose the installation path

| Existing setup | How to host the relay | Current project status |
|---|---|---|
| HA Container on Linux or a Docker-capable NAS | Run the supplied Compose service as a separate container on the same host | Available now; follow [installation step 6](INSTALL.md#6-docker--nas-option) |
| HA OS in a virtual machine | Run the relay in a separate Linux VM or container on the underlying host, if supported | Existing relay can be used; allocate resources separately from the HA VM |
| HA OS installed directly on the machine | Package the relay as an HA App (formerly add-on), managed by Supervisor | Technically feasible, but no App package or App Store installation is provided by this release |
| Another always-on computer | Run the native relay or a locally built Docker container | Available now; useful when HA hardware has little spare capacity |

HA OS supports Apps; HA Container does not provide the App system and requires you to manage sibling services yourself. See the official [installation types](https://www.home-assistant.io/installation/#about-installation-types). Do not install Node/FFmpeg inside HA Core's container or treat a terminal App as a permanent relay host. The supplied Compose instructions target a host you manage, not the HA OS host shell.

An HA OS App would need its own manifest, startup/configuration handling, persistent private key storage, build distribution and lifecycle testing. Both `amd64` and `aarch64` would need validation before claiming support. This is a possible future packaging route, not an implemented feature. See the official [App configuration documentation](https://developers.home-assistant.io/docs/apps/configuration/).

## Hardware requirements and recommendations

**There is no benchmarked minimum hardware specification yet.** The following are conservative starting recommendations for trials, not guaranteed capacity ratings or a reason to replace a working host.

| Use | Suggested starting point | Qualification |
|---|---|---|
| One active camera on a shared HA/relay host | Modern 64-bit x86 mini-PC or NAS, four CPU cores, 8 GB total RAM, SSD and wired Ethernet | Aim to leave roughly two cores' worth of CPU headroom and 1 GiB available RAM for a one-camera trial, beyond HA and other services; measure actual demand |
| Existing always-on Mac | Reuse it if it has spare CPU/RAM | Native Apple Silicon operation has been exercised; this does not establish a minimum Mac model or capacity |
| Raspberry Pi 5 with 4 or 8 GB RAM | Experimental candidate with cooling and a low-resolution camera substream, using a managed Linux/Docker host | ARM64 Docker and physical TV operation on Pi have not been validated; HA OS still needs an App package |
| HA Green or another small, busy HA appliance | Prefer an existing external relay host | No project transcoding benchmark or HA OS App is available for these devices |
| Several different cameras visible at once | Start with a larger host or keep the relay separate from HA | Measure each additional camera under normal household load; there is no certified camera-count limit |

Prefer trying an existing suitable NAS or computer before buying hardware. For a new shared host, the x86/8 GB/SSD starting point above offers a more practical validation target than sizing to HA's own minimum requirements. HA's published minimum describes HA itself, not the extra video workload here.

The runtime needs Node.js 22 or later and FFmpeg; the Docker build supplies them. It needs writable private configuration/log storage and network access to the cameras and each TV's Developer Mode SSH service. No GPU or public inbound port is required. The project does not record video, so camera recordings do not determine its disk requirement; allow space for the OS, container images, updates and log retention.

## What determines load

- Output is 768×432 at 25 fps, encoded as MPEG-1. Use a camera medium/substream first; decoding a 4K or HEVC input can add considerable work without improving the output resolution.
- One encoder runs per distinct active camera. Multiple TVs watching the same camera share that encoder, although network/tunnel work still increases. The encoder stops when its last viewer leaves.
- Linux currently uses software decoding and encoding. Intel Quick Sync/VAAPI acceleration is not implemented; do not buy a GPU expecting it to be used. Optional macOS VideoToolbox decoding does not eliminate encoding work.
- The supplied Compose service has a **512 MiB memory cap**. That is a configured limit, not a measured minimum or a guarantee that every input fits. The 1 GiB headroom recommendation above does not change this cap. Review measured usage before deliberately adjusting it.
- FFmpeg's encoder thread setting is not a CPU quota. Decoding, filtering and other processes can consume additional CPU. Sharing hardware also means relay and HA compete during backups and other busy periods.

## Validate before relying on a shared host

1. Begin with one camera substream and manual launches in a test environment. Keep automatic alerts disabled until acceptance is complete.
2. Observe whole-host CPU, available RAM, temperature/throttling and HA responsiveness, plus `docker stats` for the relay container. Check for restarts or out-of-memory kills. Container-only readings omit other host workloads.
3. Verify sustained moving video, startup delay, underlying audio, BACK and timer dismissal. Repeat while the host is doing its normal work and with the intended number of distinct cameras.
4. Confirm encoders exit after viewing ends and check restart/reconnect behavior during a planned test. If HA responsiveness or video suffers, use a lighter source, reduce concurrent cameras or move the relay to another host.

Linux x86-64 CI has exercised the container with real FFmpeg and a synthetic video source, using simulated SSH. Native Mac operation and physical LG viewing have separate evidence. An actual NAS-container-to-TV route, ARM64 Docker operation and an HA OS App have not been validated. See [the validation record](VALIDATION.md); a successful container build alone does not prove those deployment paths.
