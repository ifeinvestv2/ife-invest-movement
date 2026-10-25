// Cloudflare Worker registration API. Deploy only after configuring D1 binding DB,
// TURNSTILE_SECRET_KEY and CORS_ORIGIN. Never expose the secret in GitHub.
export default {async fetch(request,env){
 const origin=request.headers.get('Origin');const headers={'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':env.CORS_ORIGIN||'https://ife-invest-movement.ltkouture.workers.dev','Vary':'Origin'};
 const reply=(status,data)=>new Response(JSON.stringify(data),{status,headers});
 if(origin!==env.CORS_ORIGIN)return reply(403,{error:'Origin not allowed'});
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'}});
 if(request.method!=='POST'||new URL(request.url).pathname!=='/api/register')return reply(404,{error:'Not found'});
 if(!env.DB||!env.TURNSTILE_SECRET_KEY)return reply(503,{error:'Registration unavailable'});
 if(Number(request.headers.get('Content-Length')||0)>8192)return reply(413,{error:'Too large'});
 let data;try{data=await request.json()}catch{return reply(400,{error:'Invalid request'})}
 const name=String(data.name||'').trim().slice(0,120),email=String(data.email||'').trim().toLowerCase(),country=String(data.country||'').trim().slice(0,100),interests=String(data.interests||'').trim().slice(0,400);
 if(name.length<2||!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)||email.length>254||data.consent!==true||!data.turnstileToken)return reply(400,{error:'Please complete the required fields and consent'});
 const check=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:env.TURNSTILE_SECRET_KEY,response:data.turnstileToken,remoteip:request.headers.get('CF-Connecting-IP')})});
 const result=await check.json();if(!result.success)return reply(400,{error:'Security check failed'});
 try{await env.DB.prepare('INSERT INTO movement_signups(id,full_name,email,country,interests,consent_version,consented_at) VALUES(?,?,?,?,?,?,?)').bind(crypto.randomUUID(),name,email,country,interests,'2026-10-v1',new Date().toISOString()).run()}catch(e){if(String(e).includes('UNIQUE'))return reply(200,{ok:true,message:'Your interest is recorded'});return reply(500,{error:'Could not save registration'})}
 return reply(200,{ok:true,message:'Your interest is recorded'});
}};