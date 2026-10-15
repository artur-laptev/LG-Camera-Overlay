// SPDX-License-Identifier: GPL-3.0-only
// Real FFmpeg / WebSocket boundary, synthetic input; no camera or television needed.
const fs=require('fs'),vm=require('vm'),os=require('os'),path=require('path'),assert=require('assert'),{EventEmitter}=require('events'),cp=require('child_process'),WS=require('ws');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'overlay-smoke-'));fs.mkdirSync(path.join(root,'logs'));
const port=18769,conf={port,token:'a'.repeat(64),ffmpeg:process.env.FFMPEG||'ffmpeg',hardwareDecode:'none',renewDeveloperMode:false,sources:{test:'rtsp://192.0.2.1/test'},tvs:{test:{privateKey:'private/key',hostKeySha256:'b'.repeat(64)}}};
let server,spawned=[],shutdown,exited=false;
class SSH extends EventEmitter{connect(){}end(){}}
const fakeFs={...fs,readFileSync:(p,...args)=>p.endsWith('private/key')?'unused':fs.readFileSync(p,...args)};
const ctx=vm.createContext({require:n=>n==='./config.cjs'?{load:()=>({root,conf})}:n==='./devmode.cjs'?{}:n==='ssh2'?{Client:SSH}:n==='fs'?fakeFs:n==='http'?{createServer:fn=>(server=require('http').createServer(fn))}:n==='child_process'?{spawn:(binary,args,opts)=>{const index=args.indexOf('-i');const output=args.slice(index+2);output[output.indexOf('-t')+1]='4';const child=cp.spawn(binary,['-hide_banner','-loglevel','error','-re','-f','lavfi','-i','testsrc=size=768x432:rate=25',...output],opts);spawned.push(child);return child;}}:require(n),__dirname:path.join(root,'relay'),process:{on:(event,fn)=>{if(event==='SIGTERM')shutdown=fn},memoryUsage:process.memoryUsage,exit:()=>{exited=true}},console,setTimeout,clearTimeout,Date,Buffer,Set,Map,JSON,Number});
async function main(){
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../relay/relay.cjs'),'utf8'),ctx);await new Promise(r=>server.once('listening',r));
 const denied=new WS('ws://127.0.0.1:'+port+'/live/wrong/test/test');await new Promise(resolve=>denied.on('unexpected-response',(r,res)=>{assert.equal(res.statusCode,403);res.resume();denied.terminate();resolve();}).on('error',()=>{}));
 const client=new WS('ws://127.0.0.1:'+port+'/live/'+conf.token+'/test/test');let bytes=0;
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('No encoded MPEG-TS received')),15000);client.on('message',data=>{bytes+=data.length;if(bytes>188*50){clearTimeout(timer);resolve();}});client.on('error',reject)});
 let health=await (await fetch('http://127.0.0.1:'+port+'/health')).json();assert.equal(health.encoder_running,true);assert.equal(health.clients,1);assert(!JSON.stringify(health).includes(conf.token));
 client.close();await new Promise(r=>client.once('close',r));await new Promise(r=>setTimeout(r,300));
 health=await (await fetch('http://127.0.0.1:'+port+'/health')).json();assert.equal(health.encoder_running,false);assert.equal(health.clients,0);
 console.log('PASS: real FFmpeg produced '+bytes+' MPEG-TS bytes through authenticated WebSocket; last-viewer cleanup verified');
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{if(shutdown)shutdown();for(const c of spawned)if(!c.killed)c.kill();fs.rmSync(root,{recursive:true,force:true});});
