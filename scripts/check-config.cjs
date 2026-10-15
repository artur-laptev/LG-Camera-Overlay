// SPDX-License-Identifier: GPL-3.0-only
'use strict';
try{const {conf}=require('../relay/config.cjs').load();const r=require('child_process').spawnSync(conf.ffmpeg,['-version'],{encoding:'utf8'});if(r.error||r.status!==0)throw Error('FFmpeg is unavailable');console.log(JSON.stringify({valid:true,cameras:Object.keys(conf.sources),tvs:Object.keys(conf.tvs),ffmpeg:r.stdout.split('\n')[0]}));}catch(e){console.error(e.message);process.exitCode=1;}
