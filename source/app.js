/* Continuous software-decoded MPEG1 live video. No HTML media player or camera credentials. */
(function () {
 "use strict";
 var panel=document.getElementById("panel"),canvas=document.getElementById("camera"),message=document.getElementById("message");
 var status=document.getElementById("status"),seconds=document.getElementById("seconds"),label=document.getElementById("label");
 var player=null,closeTimer=null,tickTimer=null,generation=0,lastFrame=0,frames=0,lastCount=0,started=0;
 function stop(){
  generation++;
  if(closeTimer!==null){clearTimeout(closeTimer);closeTimer=null;}
  if(tickTimer!==null){clearInterval(tickTimer);tickTimer=null;}
  if(player){player.destroy();player=null;}
  canvas.style.visibility="hidden";
 }
 function dismiss(){stop();panel.style.display="none";try{window.close();}catch(e){}}
 function params(event){
  var p=event&&event.detail;
  if(p&&p.launchParams)p=p.launchParams;
  if(!p){try{p=window.PalmSystem&&window.PalmSystem.launchParams||window.webOSSystem&&window.webOSSystem.launchParams;}catch(e){}}
  if(typeof p==="string"){try{p=JSON.parse(p);}catch(e){p={};}}
  return p&&typeof p==="object"?p:{};
 }
 function bounded(value,low,high,fallback){value=Number(value);return isFinite(value)&&value>0?Math.max(low,Math.min(high,value)):fallback;}
 function show(event){
  stop();
  var p=params(event),url=p.stream||"",duration=bounded(p.duration,15,90,45),mine=generation;
  panel.style.display="block";panel.style.width=bounded(p.width,25,55,42)+"%";
  label.textContent=typeof p.label==="string"?p.label.slice(0,60):"Camera";
  seconds.textContent=String(Math.ceil(duration));status.textContent="Connecting...";
  status.style.color="#a9bac4";message.textContent="Connecting live camera...";message.style.display="block";
  started=Date.now();lastFrame=0;frames=0;lastCount=0;
  closeTimer=setTimeout(dismiss,duration*1000);
  if(!/^wss?:\/\/(?:[a-z0-9.-]+|\[[a-f0-9:]+\])(?::\d+)?\/[a-zA-Z0-9/_-]+$/.test(url)){
   status.textContent="No stream";message.textContent="Live stream was not supplied";return;
  }
  try{
   player=new JSMpeg.Player(url,{canvas:canvas,audio:false,autoplay:true,pauseWhenHidden:false,disableWebAssembly:true,videoBufferSize:1024*1024,
    onVideoDecode:function(){if(mine!==generation)return;frames++;lastFrame=Date.now();canvas.style.visibility="visible";message.style.display="none";if(frames===1){var socket=player&&player.source&&player.source.socket;if(socket&&socket.readyState===1)socket.send(JSON.stringify({type:"started",appStartupMs:lastFrame-started,sentAt:Number(p.sentAt)||0,detectedAt:Number(p.detectedAt)||0}));}}});
  }catch(e){status.textContent="Player error";message.textContent="Live video could not start";return;}
  tickTimer=setInterval(function(){
   var now=Date.now(),fps=frames-lastCount;lastCount=frames;
   seconds.textContent=String(Math.max(0,Math.ceil(duration-(now-started)/1000)));
   if(lastFrame&&now-lastFrame<3000){status.textContent="LIVE · "+fps+" fps";status.style.color="#67dfad";}
   else if(now-started>8000){status.textContent="Stream stalled";status.style.color="#ffd38a";canvas.style.visibility="hidden";message.textContent="Waiting for live camera";message.style.display="block";}
   var socket=player&&player.source&&player.source.socket;
   if(socket&&socket.readyState===1){socket.send(JSON.stringify({type:"metrics",frames:frames,fps:fps,width:canvas.width,height:canvas.height,age:lastFrame?now-lastFrame:-1}));}
  },1000);
 }
 document.addEventListener("webOSRelaunch",show);
 document.addEventListener("keydown",function(e){if(e.keyCode===461||e.keyCode===27){e.preventDefault();dismiss();}});
 window.addEventListener("pagehide",stop);
 window.addEventListener("unload",stop);
 show();
}());
