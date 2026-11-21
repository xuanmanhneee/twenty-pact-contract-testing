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
// Provider state gọi thẳng Twenty (không qua proxy) bằng phiên thật + Origin hợp lệ.
const STATE_URL = process.env.TARGET || 'http://localhost:3000';

// Fixture của I-03 (khớp CREATE_ONE_PERSON_VARIABLES trong tests/queries.js).
const I03_FIXTURE_ID = 'd05b3c0b-1da6-4a73-852b-6ad2b77f7d9e';

async function twenty(endpoint, query, variables = {}) {
  const res = await fetch(`${STATE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: `twenty-session=${SESSION}`, Origin: ORIGIN },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

// Precondition: workspace phải có ít nhất 1 bản ghi, nếu không báo lỗi rõ ràng thay vì để verify fail khó hiểu.
const requireRecords = (collection) => async () => {
  const body = await twenty('/graphql', `{ ${collection}(first: 1) { totalCount } }`);
  if (!body?.data?.[collection]?.totalCount) {
    throw new Error(`Precondition không thỏa: workspace không có ${collection} (${JSON.stringify(body).slice(0, 200)})`);
  }
};

// Xóa fixture I-03: xóa mềm rồi xóa vĩnh viễn. Idempotent: fixture không tồn tại thì bỏ qua.
async function cleanupI03() {
  await twenty('/graphql', 'mutation ($id: UUID!) { deletePerson(id: $id) { id } }', { id: I03_FIXTURE_ID });
  await twenty('/graphql', 'mutation ($id: UUID!) { destroyPerson(id: $id) { id } }', { id: I03_FIXTURE_ID });
}

describe('twenty-server thật thỏa mãn hợp đồng của twenty-front', () => {
  it('xác minh toàn bộ interaction', async () => {
    if (!SESSION) throw new Error('Thiếu phiên: đặt TWENTY_SESSION hoặc dán giá trị cookie twenty-session vào token.txt');
    await new Verifier({
      provider: 'twenty-server',
      providerBaseUrl: BASE,
      pactUrls: [path.resolve('pacts/twenty-front-twenty-server.json')],
      stateHandlers: {
        'workspace có ít nhất 1 Person': requireRecords('people'),
        'workspace có ít nhất 1 Company': requireRecords('companies'),
        'workspace có ít nhất 1 Opportunity': requireRecords('opportunities'),
        'người dùng đã đăng nhập vào workspace': async () => {
          const body = await twenty('/metadata', '{ currentUser { id } }');
          if (!body?.data?.currentUser?.id) {
            throw new Error(`Precondition không thỏa: chưa đăng nhập (${JSON.stringify(body).slice(0, 200)})`);
          }
        },
        // I-03 tạo bản ghi thật: dọn fixture trước (tránh trùng UUID) và sau (không để rác).
        'workspace sẵn sàng tạo Person I-03': { setup: cleanupI03, teardown: cleanupI03 },
        'phiên hợp lệ nhưng request thiếu Origin': async () => {},
        'phiên không hợp lệ': async () => {},
      },
      // I-01: thay phiên giả bằng phiên thật. I-06: giữ phiên sai.
      requestFilter: (req, _res, next) => {
        // Chỉ đặt Origin khi hợp đồng có Origin; I-07 cố ý không gửi để kiểm tra 403 CSRF.
        if (req.headers['origin']) req.headers['origin'] = ORIGIN;
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