// SPDX-License-Identifier: GPL-3.0-only
'use strict';
// Import an official CLI pairing; capture then explicitly confirm a TOFU host pin.
const fs=require('fs'),path=require('path'),os=require('os'),crypto=require('crypto'),{Client}=require('ssh2'),readline=require('readline/promises');
function safeError(message){const e=new Error(message);e.safe=true;return e;}
async function main(){
 const [profile,id,pinFlag]=process.argv.slice(2);
 if(!profile||!/^[a-z][a-z0-9_]{0,40}$/.test(id||''))throw safeError('Usage: npm run pair -- CLI_PROFILE TV_ID [--trust-local-network]');
 const root=path.resolve(process.env.OVERLAY_DATA_DIR||path.join(__dirname,'..')),configPath=path.join(root,'private/config.json');
 const config=JSON.parse(fs.readFileSync(configPath,'utf8'));
 const profilePath=process.env.WEBOS_DEVICES_FILE||path.join(process.platform==='win32'?process.env.APPDATA:os.homedir(),'.webos/tv/novacom-devices.json');
 const devices=JSON.parse(fs.readFileSync(profilePath,'utf8')),device=devices.find(d=>d.name===profile);
 if(!device||device.username!=='prisoner'||Number(device.port)!==9922)throw safeError('A paired Developer Mode CLI profile on port 9922 is required');
 const keyName=device.privateKey?.openSsh||device.privateKey;
 if(typeof keyName!=='string'||!keyName)throw safeError('CLI profile has no private key; run ares-novacom --getkey first');
 const keyPath=path.isAbsolute(keyName)?keyName:path.join(os.homedir(),'.ssh',keyName);
 const key=fs.readFileSync(keyPath);let fingerprint;
 // Abort before authentication: the first connection only discovers the server host key.
 await new Promise(resolve=>{const client=new Client();client.on('error',()=>resolve());client.on('close',resolve);client.connect({host:device.host,port:9922,username:'prisoner',readyTimeout:8000,hostHash:'sha256',hostVerifier:h=>{fingerprint=h;return false;}});});
 if(!fingerprint)throw safeError('TV SSH host key unavailable; turn on the TV and check Developer Mode');
 const previous=config.tvs?.[id];
 if(previous&&/^[a-f0-9]{64}$/.test(previous.hostKeySha256)&&previous.hostKeySha256!==fingerprint)throw safeError('Host key changed: investigate on the TV before replacing the saved pin');
 console.log('TV '+device.host+' SHA256 hex fingerprint: '+fingerprint);
 if(pinFlag!=='--trust-local-network'){
  const rl=readline.createInterface({input:process.stdin,output:process.stdout});
  const answer=await rl.question('First-use trust: verify this is your TV on a trusted LAN. Type the fingerprint to pin it: ');rl.close();
  if(answer.trim()!==fingerprint)throw safeError('Fingerprint not confirmed');
 }
 await new Promise((resolve,reject)=>{const client=new Client();client.on('ready',()=>{client.end();resolve();});client.on('error',()=>reject(safeError('Pinned SSH authentication failed')));client.connect({host:device.host,port:9922,username:'prisoner',privateKey:key,passphrase:device.passphrase,hostHash:'sha256',hostVerifier:h=>h===fingerprint,readyTimeout:10000});});
 const privateDir=path.join(root,'private');fs.mkdirSync(privateDir,{recursive:true,mode:0o700});
 fs.writeFileSync(path.join(privateDir,id+'-key'),key,{mode:0o600});
 if(!/^[a-f0-9]{64}$/.test(config.token||''))config.token=crypto.randomBytes(32).toString('hex');
 config.tvs=config.tvs||{};config.tvs[id]={host:device.host,port:9922,username:'prisoner',privateKey:'private/'+id+'-key',passphrase:device.passphrase||'',hostKeySha256:fingerprint};
 fs.copyFileSync(configPath,configPath+'.before-pair');fs.chmodSync(configPath+'.before-pair',0o600);
 fs.writeFileSync(configPath,JSON.stringify(config,null,2)+'\n',{mode:0o600});fs.chmodSync(configPath,0o600);
 console.log('Pinned SSH verified; private config and key saved. Complete camera sources, then run npm run check.');
}
main().catch(e=>{console.error(e.safe?e.message:'Pairing failed: check profile, private configuration, files and network. No private error data is printed.');process.exitCode=1;});
