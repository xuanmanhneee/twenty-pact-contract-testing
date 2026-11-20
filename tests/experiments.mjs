// Chạy các thí nghiệm phá hợp đồng phía provider và ghi bằng chứng vào logs/experiments/.
// Điều kiện: Twenty chạy (:3000), auth-proxy chạy (:4002), token.txt có phiên hợp lệ, hợp đồng đã sinh (npm run test:consumer).
// Chạy: npm run experiments            (tất cả)
//       npm run experiments -- M-2 M-4 (chỉ một số mã)
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';

const OUT = path.resolve('logs/experiments');
const PROXY_PORT = 4001;
const strip = (s) => s.replace(/\x1b\[[0-9;]*m/g, '');

// expectFail: tập interaction mà thay đổi đó PHẢI làm fail (và chỉ những interaction đó).
const EXPERIMENTS = [
  { id: 'M-0', title: 'Đối chứng: proxy chuyển tiếp nguyên vẹn', env: { MUTATION: 'none' }, expectFail: [] },
  { id: 'M-2', title: 'Đổi tên field jobTitle → jobTitleName', env: { MUTATION: 'rename', FIELD: 'jobTitle', TO: 'jobTitleName' }, expectFail: ['I-01', 'I-03'] },
  { id: 'M-3', title: 'Xóa field amount (Opportunity)', env: { MUTATION: 'remove', FIELD: 'amount' }, expectFail: ['I-04'] },
  { id: 'M-4', title: 'Đổi kiểu totalCount từ số sang chuỗi', env: { MUTATION: 'retype', FIELD: 'totalCount' }, expectFail: ['I-01', 'I-02', 'I-04'] },
  { id: 'M-6', title: 'Thêm field mới jobTitleExtra (tương thích ngược)', env: { MUTATION: 'add', FIELD: 'jobTitle', TO: 'jobTitleExtra' }, expectFail: [] },
];

const waitPort = (port, ms = 10000) => new Promise((resolve, reject) => {
  const t0 = Date.now();
  const tryOnce = () => {
    const s = net.connect(port, '127.0.0.1');
    s.on('connect', () => { s.destroy(); resolve(); });
    s.on('error', () => { s.destroy(); Date.now() - t0 > ms ? reject(new Error('proxy không lên cổng ' + port)) : setTimeout(tryOnce, 150); });
  };
  tryOnce();
});

// Tách kết quả từng interaction từ log của Pact Verifier.
function parseInteractions(text) {
  const results = {};
  let current = null;
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*(I-\d+)\s/);
    if (m) { current = m[1]; results[current] = 'OK'; continue; }
    if (current && /\(FAILED\)/.test(line)) results[current] = 'FAILED';
    if (/^Failures:/.test(line)) current = null;
  }
  return results;
}

const selected = process.argv.slice(2);
const list = selected.length ? EXPERIMENTS.filter((e) => selected.includes(e.id)) : EXPERIMENTS;
fs.mkdirSync(OUT, { recursive: true });

const pactVersion = JSON.parse(fs.readFileSync('node_modules/@pact-foundation/pact/package.json', 'utf8')).version;
const rows = [];

for (const exp of list) {
  const proxy = spawn(process.execPath, ['tests/mutate-proxy.mjs'], { env: { ...process.env, ...exp.env, MUTATE_PORT: String(PROXY_PORT) }, stdio: ['ignore', 'pipe', 'pipe'] });
  let proxyLog = '';
  proxy.stdout.on('data', (d) => (proxyLog += d));
  proxy.stderr.on('data', (d) => (proxyLog += d));
  try {
    await waitPort(PROXY_PORT);
    const t0 = Date.now();
    const run = spawnSync('npx', ['vitest', 'run', 'tests/provider.verify.test.js'], {
      env: { ...process.env, TWENTY_URL: `http://localhost:${PROXY_PORT}` }, encoding: 'utf8', shell: true, timeout: 120000,
    });
    const seconds = ((Date.now() - t0) / 1000).toFixed(2);
    const output = strip(`${run.stdout || ''}\n${run.stderr || ''}`);
    const results = parseInteractions(output);
    const failed = Object.keys(results).filter((k) => results[k] === 'FAILED').sort();
    const expected = [...exp.expectFail].sort();
    const match = JSON.stringify(failed) === JSON.stringify(expected) && Object.keys(results).length === 7;
    const when = new Date().toISOString();
    const header = [
      `# ${exp.id}: ${exp.title}`, `Thời điểm: ${when}`, `Pact ${pactVersion}, Node ${process.version}, Twenty v2.46.0 (image đã pin, xem VERSIONS.md)`,
      `Proxy: MUTATION=${exp.env.MUTATION} FIELD=${exp.env.FIELD ?? '-'} TO=${exp.env.TO ?? '-'}`,
      `Kỳ vọng fail: ${expected.join(', ') || '(không)'} | Thực tế fail: ${failed.join(', ') || '(không)'} | Khớp: ${match ? 'CÓ' : 'KHÔNG'}`, `Thời gian chạy verify: ${seconds} s`, '',
      '## Log mutate-proxy', proxyLog.trim(), '', '## Log Pact Verifier', output.trim(), '',
    ].join('\n');
    fs.writeFileSync(path.join(OUT, `${exp.id}.log`), header);
    rows.push({ id: exp.id, title: exp.title, expected, failed, results, match, seconds });
    console.log(`${exp.id} ${match ? 'KHỚP' : 'KHÔNG KHỚP'} | fail: ${failed.join(',') || '-'} | kỳ vọng: ${expected.join(',') || '-'} | ${seconds}s`);
  } finally {
    proxy.kill();
  }
}

const ids = ['I-01', 'I-02', 'I-03', 'I-04', 'I-05', 'I-06', 'I-07'];
const md = [
  '# Kết quả thí nghiệm phá hợp đồng phía provider',
  '',
  `Sinh tự động bởi \`npm run experiments\` lúc ${new Date().toISOString()}. Pact ${pactVersion}, Node ${process.version}.`,
  'Server Twenty thật không bị sửa: `tests/mutate-proxy.mjs` chỉ biến đổi JSON response trên đường về Verifier.',
  '',
  `| Mã | Thay đổi | ${ids.join(' | ')} | Khớp kỳ vọng | Thời gian |`,
  `|---|---|${ids.map(() => '---').join('|')}|---|---|`,
  ...rows.map((r) => `| ${r.id} | ${r.title} | ${ids.map((i) => r.results[i] ?? '?').join(' | ')} | ${r.match ? 'có' : '**KHÔNG**'} | ${r.seconds} s |`),
  '',
  'Log chi tiết từng lượt: `logs/experiments/<mã>.log`.',
  '',
];
fs.writeFileSync(path.join(OUT, 'summary.md'), md.join('\n'));
fs.writeFileSync(path.join(OUT, 'summary.json'), JSON.stringify(rows, null, 2));
console.log(`\nĐã ghi ${OUT}`);
process.exitCode = rows.every((r) => r.match) ? 0 : 1;
