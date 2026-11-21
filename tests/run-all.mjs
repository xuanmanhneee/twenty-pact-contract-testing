// Chạy toàn bộ quy trình kiểm thử bằng một lệnh: npm run all
// Các bước: kiểm tra điều kiện -> consumer (sinh hợp đồng) -> provider verify (gọi thẳng Twenty) -> thí nghiệm phá hợp đồng.
// Kết quả tóm tắt in ra màn hình và ghi vào logs/run-all-summary.md. Exit code 0 khi tất cả đạt.
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';

const TWENTY = process.env.TWENTY_HEALTH_URL || 'http://localhost:3000/healthz';
const AUTH_PROXY_PORT = Number(process.env.PROXY_PORT || 4002);
const strip = (s) => s.replace(/\x1b\[[0-9;]*m/g, '');
const results = [];
const record = (name, ok, detail) => { results.push({ name, ok, detail }); console.log(`${ok ? 'ĐẠT ' : 'LỖI '} ${name}: ${detail}`); };

const portOpen = (port) => new Promise((resolve) => {
  const s = net.connect(port, '127.0.0.1');
  s.on('connect', () => { s.destroy(); resolve(true); });
  s.on('error', () => resolve(false));
});
const waitPort = async (port, ms = 10000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await portOpen(port)) return true; await new Promise((r) => setTimeout(r, 200)); } return false; };

function runStep(name, args) {
  const t0 = Date.now();
  const r = spawnSync('npm', ['run', ...args], { encoding: 'utf8', shell: true, timeout: 300000 });
  const out = strip(`${r.stdout || ''}\n${r.stderr || ''}`);
  const sec = ((Date.now() - t0) / 1000).toFixed(1);
  const tests = out.match(/Tests\s+(.*)/)?.[1]?.trim();
  record(name, r.status === 0, `${tests || 'xem log'} (${sec} s)`);
  if (r.status !== 0) console.log(out.split('\n').slice(-25).join('\n'));
  return r.status === 0;
}

// 1. Điều kiện
let ready = true;
try { const res = await fetch(TWENTY, { signal: AbortSignal.timeout(5000) }); if (!res.ok) throw new Error(`HTTP ${res.status}`); record('Twenty đang chạy', true, TWENTY); }
catch (e) { record('Twenty đang chạy', false, `${TWENTY} không phản hồi (${e.message}). Bật Docker và chạy docker compose up -d.`); ready = false; }
const hasSession = Boolean(process.env.TWENTY_SESSION) || fs.existsSync('token.txt');
record('Có phiên đăng nhập', hasSession, hasSession ? 'token.txt hoặc TWENTY_SESSION' : 'thiếu token.txt: lấy cookie twenty-session (xem docs/setup.md mục 3)');
ready = ready && hasSession;
if (process.env.HTTP_PROXY || process.env.HTTPS_PROXY || process.env.http_proxy || process.env.https_proxy) console.log('CẢNH BÁO: đang đặt biến proxy hệ thống, Verifier có thể bị 403. Gỡ HTTP_PROXY/HTTPS_PROXY.');

if (ready) {
  // 2. Consumer và provider
  const c = runStep('Consumer test (sinh hợp đồng)', ['test:consumer']);
  const p = c && runStep('Provider verify (gọi thẳng Twenty)', ['test:provider']);
  // 3. Thí nghiệm cần auth-proxy: tự bật nếu chưa chạy
  if (p) {
    let proxy;
    if (!(await portOpen(AUTH_PROXY_PORT))) { proxy = spawn(process.execPath, ['tests/auth-proxy.mjs'], { stdio: 'ignore' }); await waitPort(AUTH_PROXY_PORT); }
    try { runStep('Thí nghiệm phá hợp đồng (M-0, M-2, M-3, M-4, M-6)', ['experiments']); } finally { proxy?.kill(); }
  }
}

const ok = results.every((r) => r.ok) && results.length >= 5;
const md = ['# Tóm tắt chạy toàn bộ', '', `Thời điểm: ${new Date().toISOString()}. Node ${process.version}.`, '', '| Bước | Kết quả | Chi tiết |', '|---|---|---|',
  ...results.map((r) => `| ${r.name} | ${r.ok ? 'đạt' : '**lỗi**'} | ${r.detail.replace(/\|/g, '/')} |`), '', `Kết luận: ${ok ? 'TẤT CẢ ĐẠT' : 'CÓ BƯỚC LỖI hoặc chưa chạy đủ'}`, ''].join('\n');
fs.mkdirSync('logs', { recursive: true });
fs.writeFileSync('logs/run-all-summary.md', md);
console.log(`\n${ok ? 'TẤT CẢ ĐẠT' : 'CÓ BƯỚC LỖI hoặc chưa chạy đủ'}. Tóm tắt: logs/run-all-summary.md`);
process.exitCode = ok ? 0 : 1;
