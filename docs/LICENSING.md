# Licensing and dependency boundaries

Own project code is GPL-3.0-only. Preserve LICENSE and notices when redistributing it. The TV IPK includes LICENSE, NOTICE and the original MIT JSMpeg notice, with the corresponding project source available in the same release. JSMpeg's MIT licence remains unchanged.

Runtime npm dependencies are installed from the lockfile and retain their package notices. The official webOS CLI is isolated under `tooling/`; it is required only for building/pairing through that route, not to run the relay. Its bundled transitive dependency audit findings include unfixed advisories. Use it only with trusted source/package inputs, avoid exposing its development server, and review updates upstream. The runtime dependency audit is checked independently in CI.

No FFmpeg executable or prebuilt container image is distributed by this project. The Dockerfile instructs the user to install Debian's FFmpeg package during their own local build. FFmpeg licensing depends on its build configuration: [FFmpeg's legal page](https://ffmpeg.org/legal.html) explains the LGPL/GPL distinctions and source obligations. If you redistribute your built container or an FFmpeg binary, retain the relevant notices and provide the corresponding source/build information required for that exact build and its dependencies. The project GPL licence does not discharge those obligations.
