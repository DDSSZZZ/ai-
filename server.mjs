import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {extname,join,normalize} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('.',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json'};
const server=createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/api/chat' && req.method==='POST'){
   let raw='';for await(const chunk of req)raw+=chunk;
   const input=JSON.parse(raw||'{}'); const endpoint=process.env.AI_API_URL, key=process.env.AI_API_KEY, model=process.env.AI_MODEL||'gpt-4o-mini';
   if(!endpoint||!key){res.writeHead(204);res.end();return}
   const upstream=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json','authorization':`Bearer ${key}`},body:JSON.stringify({model,messages:[{role:'system',content:'你是反诈互动 H5 的调查搭档。只基于虚构剧情回答，优先建议停止转账、独立核实、保存证据和寻求官方帮助。用简洁中文回答。'},...(Array.isArray(input.messages)?input.messages:[])]})});
   const data=await upstream.json(); const reply=data?.choices?.[0]?.message?.content||data?.output_text||'暂时无法连接 AI，请使用离线提示。'; res.writeHead(upstream.ok?200:502,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify({reply}));return;
  }
  const relative=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname);
  const file=normalize(join(root,relative));
  if(!file.startsWith(normalize(root))){res.writeHead(403);res.end('Forbidden');return}
  const info=await stat(file);if(!info.isFile())throw new Error('not file');
  const body=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'"});res.end(body);
 }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Not found')}
});
const port=Number(process.env.PORT||4173);server.listen(port,()=>console.log(`Future Signal running at http://localhost:${port}`));
