// SPDX-License-Identifier: GPL-3.0-only
"use strict";
const fs=require("fs"),path=require("path"),{Client}=require("ssh2");
const {root,conf}=require("./config.cjs").load();
function defaults(){return conf.tvs?.living_room||conf.tv||Object.values(conf.tvs||{})[0];}
function cachePath(tvId){if(!/^[a-z][a-z0-9_]{0,40}$/.test(tvId))throw Error("Invalid TV identifier");return path.join(root,"private",tvId==="living_room"?"devmode-token":"devmode-token-"+tvId);}
function getToken(tv,tvId){return new Promise((resolve,reject)=>{
 const cache=cachePath(tvId),client=new Client();let done=false;
 const timer=setTimeout(()=>finish(new Error("TV token read timed out")),12000);
 function finish(error,value){
  if(done)return;done=true;clearTimeout(timer);client.end();
  if(error){try{const saved=fs.readFileSync(cache,"utf8").trim();if(/^[a-z0-9]{10,200}$/i.test(saved))return resolve(saved);}catch(e){}return reject(error);}
  try{fs.writeFileSync(cache,value,{mode:0o600});}catch(e){return reject(new Error("Private token cache write failed"));}
  resolve(value);
 }
 client.on("ready",()=>client.exec("cat /var/luna/preferences/devmode_enabled",(error,stream)=>{
  if(error)return finish(new Error("TV token read failed"));let content="";
  stream.on("data",chunk=>{content+=chunk.toString();if(content.length>1024)finish(new Error("Invalid token data"));});
  stream.on("close",()=>{const token=content.trim();if(!/^[a-z0-9]{10,200}$/i.test(token))finish(new Error("Invalid developer token"));else finish(null,token);});
 }));
 client.on("error",()=>finish(new Error("TV unavailable for session check")));
 client.connect({host:tv.host,port:tv.port,username:tv.username,privateKey:fs.readFileSync(path.join(root,tv.privateKey)),passphrase:tv.passphrase,hostHash:"sha256",hostVerifier:hash=>hash===tv.hostKeySha256,readyTimeout:10000});
});}
async function request(action,token){
 const url=new URL("https://developer.lge.com/secure/"+action+".dev");url.searchParams.set("sessionToken",token);
 const response=await fetch(url,{signal:AbortSignal.timeout(10000),redirect:"error"});
 if(!response.ok)throw Error("LG session endpoint HTTP "+response.status);
 const raw=await response.json(),remaining=typeof raw.errorMsg==="string"&&/^[\d:.,\s-]+$/.test(raw.errorMsg)?raw.errorMsg:null;
 return {success:raw.result==="success",code:typeof raw.errorCode==="string"&&/^[A-Z0-9_-]{1,16}$/.test(raw.errorCode)?raw.errorCode:null,remaining};
}
async function run(renew,tv=defaults(),tvId="living_room"){
 const token=await getToken(tv,tvId),before=await request("CheckDevModeSession",token);
 if(!renew)return {time:new Date().toISOString(),before};
 const reset=await request("ResetDevModeSession",token),after=await request("CheckDevModeSession",token);
 const value={time:new Date().toISOString(),before,reset,after};
 fs.writeFileSync(path.join(root,"logs/devmode-status-"+tvId+".json"),JSON.stringify(value,null,2),{mode:0o600});return value;
}
module.exports={run};
if(require.main===module)run(process.argv.includes("--renew")).then(result=>console.log(JSON.stringify(result))).catch(()=>{console.log(JSON.stringify({success:false,error:"Developer Mode session check failed"}));process.exitCode=1;});
