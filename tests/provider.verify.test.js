import { describe, it, expect } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import { Verifier } from '@pact-foundation/pact';

// Giá trị cookie twenty-session (phần sau "twenty-session=", đến trước dấu ;).
// Đặt biến TWENTY_SESSION hoặc dán vào file token.txt (đã .gitignore).
const readFile = () => { try { return fs.readFileSync('token.txt', 'utf8').trim(); } catch { return undefined; } };
const SESSION = process.env.TWENTY_SESSION || process.env.TWENTY_TOKEN || readFile();
// Mặc định đi qua auth-proxy (cổng 4002): gọi thẳng Twenty từ Verifier bị 403 CSRF (xem README).
const BASE = process.env.TWENTY_URL || 'http://localhost:4002';
// Twenty v2.46.0 chặn request dùng cookie nếu thiếu Origin hợp lệ (403 CSRF_ORIGIN_MISMATCH).
const ORIGIN = process.env.TWENTY_ORIGIN || 'http://localhost:3000';

describe('twenty-server thật thỏa mãn hợp đồng của twenty-front', () => {
  it('xác minh I-01 và I-06', async () => {
    if (!SESSION) throw new Error('Thiếu phiên: đặt TWENTY_SESSION hoặc dán giá trị cookie twenty-session vào token.txt');
    await new Verifier({
      provider: 'twenty-server',
      providerBaseUrl: BASE,
      pactUrls: [path.resolve('pacts/twenty-front-twenty-server.json')],
      stateHandlers: {
        'workspace có ít nhất 1 Person': async () => {},
        'token không hợp lệ': async () => {},
      },
      // I-01: thay phiên giả bằng phiên thật. I-06: giữ phiên sai.
      requestFilter: (req, _res, next) => {
        req.headers['origin'] = ORIGIN; // như trình duyệt thật
        if (process.env.DEBUG_PACT) console.log('[filter] origin=', req.headers['origin'], '| cookie prefix=', String(req.headers['cookie']).slice(0, 22));
        if (req.headers['cookie'] === 'twenty-session=valid-session') {
          req.headers['cookie'] = `twenty-session=${SESSION}`;
        }
        next();
      },
      logLevel: 'warn',
    }).verifyProvider();
    expect(true).toBe(true);
  }, 60000);
});