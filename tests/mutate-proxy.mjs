// Proxy mô phỏng provider thay đổi response (breaking / non-breaking change) mà KHÔNG sửa server Twenty thật.
// Chuỗi: Verifier → mutate-proxy (:4001) → auth-proxy (:4002) → Twenty (:3000).
// Proxy chuyển tiếp nguyên request (cookie, Origin), chỉ biến đổi JSON của response.
//
// Biến môi trường:
//   MUTATION  none | rename | remove | retype | add      (mặc định none = chuyển tiếp nguyên vẹn, dùng làm đối chứng)
//   FIELD     tên field bị tác động (ví dụ jobTitle, amount, totalCount)
//   TO        rename: tên mới; add: tên field thêm vào
//   UPSTREAM  mặc định http://localhost:4002
//   MUTATE_PORT mặc định 4001
import http from 'node:http';

const UPSTREAM = new URL(process.env.UPSTREAM || 'http://localhost:4002');
const PORT = Number(process.env.MUTATE_PORT || 4001);
const MODE = process.env.MUTATION || 'none';
const FIELD = process.env.FIELD;
const TO = process.env.TO;

if (MODE !== 'none' && !FIELD) throw new Error('Thiếu FIELD cho MUTATION=' + MODE);
if ((MODE === 'rename' || MODE === 'add') && !TO) throw new Error('Thiếu TO cho MUTATION=' + MODE);

let changed = 0;

function walk(node) {
  if (Array.isArray(node)) return node.map(walk);
  if (node === null || typeof node !== 'object') return node;
  const out = {};
  for (const [key, value] of Object.entries(node)) {
    if (key === FIELD && MODE === 'remove') { changed++; continue; }
    if (key === FIELD && MODE === 'rename') { out[TO] = walk(value); changed++; continue; }
    if (key === FIELD && MODE === 'retype' && typeof value === 'number') { out[key] = String(value); changed++; continue; }
    out[key] = walk(value);
    if (key === FIELD && MODE === 'add') { out[TO] = 'extra'; changed++; }
  }
  return out;
}

http.createServer((req, res) => {
  const headers = { ...req.headers, host: UPSTREAM.host };
  delete headers['accept-encoding']; // tránh response nén, dễ đọc/sửa JSON
  const up = http.request({ hostname: UPSTREAM.hostname, port: UPSTREAM.port, path: req.url, method: req.method, headers }, (ur) => {
    const chunks = [];
    ur.on('data', (c) => chunks.push(c));
    ur.on('end', () => {
      let body = Buffer.concat(chunks);
      const before = changed;
      if (MODE !== 'none' && /json/.test(String(ur.headers['content-type']))) {
        try { body = Buffer.from(JSON.stringify(walk(JSON.parse(body.toString('utf8'))))); } catch { /* không phải JSON: giữ nguyên */ }
      }
      console.log(`${req.method} ${req.url} -> ${ur.statusCode} | mutation=${MODE} field=${FIELD ?? '-'} | số chỗ đã sửa: ${changed - before}`);
      const out = { ...ur.headers };
      delete out['transfer-encoding'];
      out['content-length'] = String(body.length);
      res.writeHead(ur.statusCode, out);
      res.end(body);
    });
  });
  up.on('error', (e) => { console.log('!! lỗi gửi tới upstream:', e.message); res.writeHead(502); res.end(); });
  req.pipe(up);
}).listen(PORT, () => console.log(`mutate-proxy :${PORT} → ${UPSTREAM.origin} | MUTATION=${MODE} FIELD=${FIELD ?? '-'} TO=${TO ?? '-'}`));
