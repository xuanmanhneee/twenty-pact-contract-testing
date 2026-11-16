import { describe, it } from 'vitest';
import path from 'node:path';
import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import {
  FIND_MANY_PEOPLE_QUERY,
  FIND_MANY_PEOPLE_VARIABLES,
  FIND_MANY_COMPANIES_QUERY,
  FIND_MANY_COMPANIES_VARIABLES,
  FIND_MANY_OPPORTUNITIES_QUERY,
  FIND_MANY_OPPORTUNITIES_VARIABLES,
  GET_CURRENT_USER_QUERY,
  GET_CURRENT_USER_VARIABLES,
} from './queries.js';

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

async function findManyCompanies(baseUrl, token) {
  const res = await fetch(`${baseUrl}/graphql`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({
      operationName: 'FindManyCompanies',
      variables: FIND_MANY_COMPANIES_VARIABLES,
      query: FIND_MANY_COMPANIES_QUERY,
    }),
  });
  return res.json();
}

async function findManyOpportunities(baseUrl, token) {
  const res = await fetch(`${baseUrl}/graphql`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({
      operationName: 'FindManyOpportunities',
      variables: FIND_MANY_OPPORTUNITIES_VARIABLES,
      query: FIND_MANY_OPPORTUNITIES_QUERY,
    }),
  });
  return res.json();
}

// GetCurrentUser thuộc schema /metadata (không phải /graphql) trên cùng host:port.
async function getCurrentUser(baseUrl, token) {
  const res = await fetch(`${baseUrl}/metadata`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({
      operationName: 'GetCurrentUser',
      variables: GET_CURRENT_USER_VARIABLES,
      query: GET_CURRENT_USER_QUERY,
    }),
  });
  return res.json();
}

// I-07: lặp lại đúng request I-01 nhưng bỏ header Origin, cần cả status HTTP nên trả về response.
async function findManyPeopleWithoutOrigin(baseUrl, token) {
  const headersNoOrigin = headers(token);
  delete headersNoOrigin.Origin;
  return fetch(`${baseUrl}/graphql`, {
    method: 'POST',
    headers: headersNoOrigin,
    body: JSON.stringify({
      operationName: 'FindManyPeople',
      variables: FIND_MANY_PEOPLE_VARIABLES,
      query: FIND_MANY_PEOPLE_QUERY,
    }),
  });
}

const request = (token, options = {}) => {
  const {
    operationName = 'FindManyPeople',
    variables = FIND_MANY_PEOPLE_VARIABLES,
    query = FIND_MANY_PEOPLE_QUERY,
    path = '/graphql',
    origin = true,
  } = options;
  const requestHeaders = headers(token);
  if (!origin) delete requestHeaders.Origin;
  return {
    method: 'POST',
    path,
    headers: requestHeaders,
    body: {
      operationName,
      variables, // chặt: khớp đúng như front gửi
      query: regex(`^query ${operationName}[\\s\\S]*$`, query), // lỏng
    },
  };
};

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

  it('I-02 FindManyCompanies với phiên hợp lệ', async () => {
    pact
      .given('workspace có ít nhất 1 Company')
      .uponReceiving('I-02 FindManyCompanies với phiên hợp lệ')
      .withRequest(request('valid-session', {
        operationName: 'FindManyCompanies',
        variables: FIND_MANY_COMPANIES_VARIABLES,
        query: FIND_MANY_COMPANIES_QUERY,
      }))
      .willRespondWith({
        status: 200,
        headers: jsonHeader,
        // Chỉ mô tả field front dùng ở bảng Companies: tên, domain, phân trang.
        body: {
          data: {
            companies: {
              edges: eachLike({
                node: {
                  id: string('c776ee49-f608-4a77-8cc8-6fe96ae1e43f'),
                  name: string('Airbnb'),
                  domainName: { primaryLinkUrl: string('airbnb.com') },
                },
                cursor: string('abc'),
              }, 1),
              pageInfo: { hasNextPage: boolean(false), endCursor: string('abc') },
              totalCount: integer(5),
            },
          },
        },
      });
    await pact.executeTest(async (mock) => { await findManyCompanies(mock.url, 'valid-session'); });
  });

  it('I-04 FindManyOpportunities với phiên hợp lệ', async () => {
    pact
      .given('workspace có ít nhất 1 Opportunity')
      .uponReceiving('I-04 FindManyOpportunities với phiên hợp lệ')
      .withRequest(request('valid-session', {
        operationName: 'FindManyOpportunities',
        variables: FIND_MANY_OPPORTUNITIES_VARIABLES,
        query: FIND_MANY_OPPORTUNITIES_QUERY,
      }))
      .willRespondWith({
        status: 200,
        headers: jsonHeader,
        // Field front hiển thị: tên deal, số tiền, ngày đóng, company liên kết.
        body: {
          data: {
            opportunities: {
              edges: eachLike({
                node: {
                  id: string('f5d3a6a6-0000-4000-8000-000000000001'),
                  name: string('Platform Migration'),
                  amount: { amountMicros: integer(60000000000), currencyCode: string('USD') },
                  closeDate: string('2026-01-31T16:25:00.000Z'),
                  company: { id: string('c776ee49-f608-4a77-8cc8-6fe96ae1e43f'), name: string('Stripe') },
                },
                cursor: string('abc'),
              }, 1),
              pageInfo: { hasNextPage: boolean(false), endCursor: string('abc') },
              totalCount: integer(6),
            },
          },
        },
      });
    await pact.executeTest(async (mock) => { await findManyOpportunities(mock.url, 'valid-session'); });
  });

  it('I-05 GetCurrentUser với phiên hợp lệ', async () => {
    pact
      .given('người dùng đã đăng nhập vào workspace')
      .uponReceiving('I-05 GetCurrentUser với phiên hợp lệ')
      .withRequest(request('valid-session', {
        operationName: 'GetCurrentUser',
        variables: GET_CURRENT_USER_VARIABLES,
        query: GET_CURRENT_USER_QUERY,
        path: '/metadata', // operation thuộc schema metadata của Twenty v2.46.0
      }))
      .willRespondWith({
        status: 200,
        headers: jsonHeader,
        // Field front dùng để dựng phiên đăng nhập và trang Profile.
        body: {
          data: {
            currentUser: {
              id: string('bfe5fb2c-45d0-45c0-b178-04d0b5e109aa'),
              email: string('member@example.com'),
              onboardingStatus: string('COMPLETED'),
              currentWorkspace: {
                id: string('def8ac74-4230-4016-849f-2137475f5b66'),
                displayName: string('dlu-qa'),
              },
              workspaceMember: {
                id: string('7d3f4c9b-0000-4000-8000-000000000001'),
                name: { firstName: string('Phước'), lastName: string('Mai') },
              },
            },
          },
        },
      });
    await pact.executeTest(async (mock) => { await getCurrentUser(mock.url, 'valid-session'); });
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

  it('I-07 FindManyPeople thiếu Origin, bị chặn CSRF 403', async () => {
    pact
      .given('phiên hợp lệ nhưng request thiếu Origin')
      .uponReceiving('I-07 FindManyPeople thiếu Origin')
      .withRequest(request('valid-session', { origin: false }))
      .willRespondWith({
        status: 403, // phản hồi thật của Twenty v2.46.0 khi cookie hợp lệ nhưng thiếu Origin
        headers: jsonHeader,
        body: {
          statusCode: integer(403),
          messages: eachLike(string('Request origin is not allowed for cookie-authenticated requests'), 1),
          error: string('CSRF_ORIGIN_MISMATCH'),
        },
      });
    await pact.executeTest(async (mock) => { await findManyPeopleWithoutOrigin(mock.url, 'valid-session'); });
  });
});