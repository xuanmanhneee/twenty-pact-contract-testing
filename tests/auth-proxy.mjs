// Proxy chẩn đoán: thay cookie valid-session bằng phiên thật, đặt Origin, in ra những gì server nhận/trả.
// Chạy: node tests/auth-proxy.mjs   (cổng 4002), rồi: TWENTY_URL=http://localhost:4002 npm run test:provider
import http from 'node:http';
import fs from 'node:fs';

const TARGET = new URL(process.env.TARGET || 'http://localhost:3000');
const PORT = Number(process.env.PROXY_PORT || 4002);
const ORIGIN = process.env.TWENTY_ORIGIN || 'http://localhost:3000';
const SESSION = (process.env.TWENTY_SESSION || fs.readFileSync('token.txt', 'utf8')).trim();

http.createServer((req, res) => {
  const headers = { ...req.headers, host: TARGET.host, origin: ORIGIN };
  const replaced = headers.cookie === 'twenty-session=valid-session';
  if (replaced) headers.cookie = `twenty-session=${SESSION}`;
  console.log(`${req.method} ${req.url} | header vào: ${Object.keys(req.headers).join(',')} | origin vào: ${req.headers.origin} | đã thay cookie: ${replaced}`);

  const up = http.request({ hostname: TARGET.hostname, port: TARGET.port, path: req.url, method: req.method, headers }, (ur) => {
    const chunks = [];
    ur.on('data', (c) => chunks.push(c));
    ur.on('end', () => {
      const body = Buffer.concat(chunks);
      console.log(`   -> ${ur.statusCode} ${body.toString('utf8').slice(0, 200).replace(/\s+/g, ' ')}`);
      const out = { ...ur.headers };
      delete out['transfer-encoding']; delete out['content-length'];
      res.writeHead(ur.statusCode, out);
      res.end(body);
    });
  });
  up.on('error', (e) => { console.log('   !! lỗi gửi tới server:', e.message); res.writeHead(502); res.end(); });
  req.pipe(up);
}).listen(PORT, () => console.log(`auth-proxy cổng ${PORT} → ${TARGET.origin}`));
