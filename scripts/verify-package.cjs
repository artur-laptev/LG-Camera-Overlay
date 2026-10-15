// SPDX-License-Identifier: GPL-3.0-only
'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib'),assert=require('assert');
const root=path.resolve(__dirname,'..'),meta=require('../source/appinfo.json');
const data=fs.readFileSync(process.argv[2]||path.join(root,'dist',meta.id+'_'+meta.version+'_all.ipk'));assert.equal(data.subarray(0,8).toString(),'!<arch>\n');
let tar;
for(let pos=8;pos<data.length;){const h=data.subarray(pos,pos+60).toString(),name=h.slice(0,16).trim().replace(/\/$/,''),size=parseInt(h.slice(48,58).trim());if(name==='data.tar.gz')tar=zlib.gunzipSync(data.subarray(pos+60,pos+60+size));pos+=60+size+size%2;}
assert(tar,'IPK data archive missing');const files=new Map();
for(let pos=0;pos+512<=tar.length;){const header=tar.subarray(pos,pos+512),name=header.subarray(0,100).toString().replace(/\0.*$/s,''),prefix=header.subarray(345,500).toString().replace(/\0.*$/s,'');if(!name)break;const size=parseInt(header.subarray(124,136).toString().replace(/\0.*$/s,'').trim()||'0',8);const full=(prefix?prefix+'/':'')+name;const marker='usr/palm/applications/'+meta.id+'/';const i=full.indexOf(marker);if(i>=0&&header[156]!==53){files.set(full.slice(i+marker.length),tar.subarray(pos+512,pos+512+size));}pos+=512+Math.ceil(size/512)*512;}
let checked=0;function visit(dir,rel=''){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const n=rel+e.name;if(e.isDirectory())visit(path.join(dir,e.name),n+'/');else{assert(files.has(n),'Missing IPK file: '+n);assert(fs.readFileSync(path.join(dir,e.name)).equals(files.get(n)),'IPK differs from source: '+n);files.delete(n);checked++;}}}
if(process.argv.includes('--inspect'))for(const [n,b]of files)console.log(n,b.length,b.subarray(0,100).toString());
visit(path.join(root,'source'));assert.equal(files.size,0,'Unexpected package files');console.log('PASS: '+checked+' packaged app files exactly match source, including license notices');
