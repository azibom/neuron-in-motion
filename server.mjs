import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { networkInterfaces } from 'node:os';

const root=dirname(fileURLToPath(import.meta.url));
const port=Number(process.env.PORT||process.argv.find(a=>/^--port=/.test(a))?.split('=')[1]||4178);
const urls=Object.entries(networkInterfaces()).flatMap(([name,entries])=>entries.map(entry=>({...entry,name})))
  .filter(x=>x.family==='IPv4'&&!x.internal&&!x.address.startsWith('169.254.'))
  .sort((a,b)=>Number(/^(wi.?fi|wlan|ethernet)/i.test(b.name))-Number(/^(wi.?fi|wlan|ethernet)/i.test(a.name)))
  .map(x=>`http://${x.address}:${port}`);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.json':'application/json; charset=utf-8','.txt':'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    if(url.pathname==='/__host'){res.writeHead(200,{'Content-Type':mime['.json'],'Cache-Control':'no-store'});res.end(JSON.stringify({urls}));return;}
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
    const pathname=decodeURIComponent(url.pathname),file=resolve(root,'.'+pathname);
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end('Forbidden');return;}
    let target=file;const s=await stat(target);if(s.isDirectory())target=resolve(target,'index.html');
    const data=await readFile(target);res.writeHead(200,{'Content-Type':mime[extname(target)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:data);
  }catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');}
});
server.on('error',e=>{console.error(e.code==='EADDRINUSE'?`Port ${port} is in use. Try: node server.mjs --port=4180`:e.message);process.exitCode=1;});
server.listen(port,'0.0.0.0',()=>{console.log(`NEURON is ready at http://localhost:${port}`);for(const url of urls)console.log(`Same-network devices: ${url}`);});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
