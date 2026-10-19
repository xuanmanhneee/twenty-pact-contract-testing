import { describe, it } from 'vitest';
import path from 'node:path';
import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import { FIND_MANY_PEOPLE_QUERY, FIND_MANY_PEOPLE_VARIABLES } from './queries.js';

const { regex, string, eachLike, integer, boolean } = MatchersV3;

// Thí nghiệm phá hợp đồng: hợp đồng đòi tên field khác với server thật.
const JOB_TITLE = process.env.BREAK ? 'jobTitleName' : 'jobTitle';

const pact = new PactV3({
  consumer: 'twenty-front',
  provider: 'twenty-server',
  dir: path.resolve('pacts'),
  logLevel: 'warn',
});

// Front xác thực bằng cookie phiên (twenty-session), không dùng header Authorization.
const headers = (session) => ({
  'Content-Type': 'application/json',
  Cookie: `twenty-session=${session}`,
  Origin: 'http://localhost:3000',
  'x-app-version': 'v2.46.0',
});

async function findManyPeople(baseUrl, token) {
  const res = await fetch(`${baseUrl}/graphql`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({
      operationName: 'FindManyPeople',
      variables: FIND_MANY_PEOPLE_VARIABLES,
      query: FIND_MANY_PEOPLE_QUERY,
    }),
  });
  return res.json();
}

const request = (token) => ({
  method: 'POST',
  path: '/graphql',
  headers: headers(token),
  body: {
    operationName: 'FindManyPeople',
    variables: FIND_MANY_PEOPLE_VARIABLES, // chặt: khớp đúng như front gửi
    query: regex('^query FindManyPeople[\\s\\S]*$', FIND_MANY_PEOPLE_QUERY), // lỏng
  },
});

const jsonHeader = { 'Content-Type': regex('^application/json.*$', 'application/json; charset=utf-8') };

describe('twenty-front → twenty-server', () => {
  it('I-01 FindManyPeople với access token hợp lệ', async () => {
    pact
      .given('workspace có ít nhất 1 Person')
      .uponReceiving('I-01 FindManyPeople với access token hợp lệ')
      .withRequest(request('valid-session'))
      .willRespondWith({
        status: 200,
        headers: jsonHeader,
        // Chỉ mô tả field mà front dùng để hiển thị danh sách People.
        body: {
          data: {
            people: {
              edges: eachLike({
                node: {
                  id: string('20202020-b000-4485-94de-70c2a98daef2'),
                  name: { firstName: string('Jeffery'), lastName: string('Griffin') },
                  emails: { primaryEmail: string('a@example.com') },
                  [JOB_TITLE]: string('CEO'),
                },
                cursor: string('abc'),
              }, 1),
              pageInfo: { hasNextPage: boolean(true), endCursor: string('abc') },
              totalCount: integer(1200),
            },
          },
        },
      });
    await pact.executeTest(async (mock) => { await findManyPeople(mock.url, 'valid-session'); });
  });

  it('I-06 FindManyPeople với access token sai', async () => {
    pact
      .given('token không hợp lệ')
      .uponReceiving('I-06 FindManyPeople với access token sai')
      .withRequest(request('session-sai'))
      .willRespondWith({
        status: 200, // đã kiểm chứng bằng probe: phiên sai vẫn trả HTTP 200
        headers: jsonHeader,
        // Thực tế v2.46.0: lỗi validate query (Unknown type..., Cannot query field "people"), không có extensions.
        body: { errors: eachLike({ message: string('Cannot query field "people" on type "Query".') }, 1) },
      });
    await pact.executeTest(async (mock) => { await findManyPeople(mock.url, 'session-sai'); });
  });
});