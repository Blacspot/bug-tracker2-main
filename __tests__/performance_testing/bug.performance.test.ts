import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 75 },  // Ramp up to 75 users over 1 minute
    { duration: '4m', target: 75 },  // Stay at 75 users for 4 minutes
    { duration: '1m', target: 150 }, // Ramp up to 150 users over 1 minute
    { duration: '4m', target: 150 }, // Stay at 150 users for 4 minutes
    { duration: '1m', target: 0 },   // Ramp down to 0 users over 1 minute
  ],
  thresholds: {
    http_req_duration: ['p(95)<2500'], // 95% of requests should be below 2.5s
    http_req_failed: ['rate<0.08'],    // Error rate should be below 8%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Shared variables for test data
let adminToken = '';
let testBugId = '';

export function setup() {
  console.log('Setting up bug performance tests...');

  // Create an admin user for authentication
  const adminEmail = `admin_bug_perf_${Math.random().toString(36).substr(2, 9)}@example.com`;
  const registerResponse = http.post(`${BASE_URL}/users/register`, JSON.stringify({
    username: 'admin_bug_perf',
    email: adminEmail,
    password: 'admin123',
    role: 'admin'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (registerResponse.status === 201) {
    const loginResponse = http.post(`${BASE_URL}/users/login`, JSON.stringify({
      email: adminEmail,
      password: 'admin123',
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

    if (loginResponse.status === 200) {
      const jsonResponse = loginResponse.json() as any;
      adminToken = jsonResponse.token;
      console.log('Admin token acquired for bug tests');
    }
  }

  return { adminToken };
}

export default function (data: any) {
  const token = data.adminToken;

  // Test: Get all bugs (Admin only)
  if (token) {
    const getAllResponse = http.get(`${BASE_URL}/bugs`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const getAllCheck = check(getAllResponse, {
      'get all bugs status is 200': (r) => r.status === 200,
      'get all bugs response time < 2000ms': (r) => r.timings.duration < 2000,
    });

    errorRate.add(!getAllCheck);
    responseTime.add(getAllResponse.timings.duration);

    if (!getAllCheck) {
      console.log(`Get all bugs failed: ${getAllResponse.status} - ${getAllResponse.body}`);
    }
  }

  sleep(0.5);

  // Test: Create a new bug (no auth required)
  const bugPayload = {
    Title: `Performance Test Bug ${Math.random().toString(36).substr(2, 9)}`,
    Description: 'This is a bug created during performance testing to measure system response times under load.',
    Status: 'open',
    Priority: 'medium',
    ProjectID: 1, // Assuming project ID 1 exists
    ReporterID: 1, // Assuming user ID 1 exists
    AssigneeID: null
  };

  const createResponse = http.post(`${BASE_URL}/bugs`, JSON.stringify(bugPayload), {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const createCheck = check(createResponse, {
    'create bug status is 201': (r) => r.status === 201,
    'create bug response time < 1500ms': (r) => r.timings.duration < 1500,
  });

  errorRate.add(!createCheck);
  responseTime.add(createResponse.timings.duration);

  if (createCheck && createResponse.status === 201) {
    const jsonResponse = createResponse.json() as any;
    testBugId = jsonResponse.bug?.BugID || '';
  }

  if (!createCheck) {
    console.log(`Create bug failed: ${createResponse.status} - ${createResponse.body}`);
  }

  sleep(0.5);

  // Test: Get bug by ID (if we have a bug ID)
  if (testBugId) {
    const getByIdResponse = http.get(`${BASE_URL}/bugs/${testBugId}`);

    const getByIdCheck = check(getByIdResponse, {
      'get bug by ID status is 200': (r) => r.status === 200,
      'get bug by ID response time < 1000ms': (r) => r.timings.duration < 1000,
    });

    errorRate.add(!getByIdCheck);
    responseTime.add(getByIdResponse.timings.duration);

    if (!getByIdCheck) {
      console.log(`Get bug by ID failed: ${getByIdResponse.status} - ${getByIdResponse.body}`);
    }
  }

  sleep(0.5);

  // Test: Get bugs by project
  const getByProjectResponse = http.get(`${BASE_URL}/bugs/project/1`);

  const getByProjectCheck = check(getByProjectResponse, {
    'get bugs by project status is 200': (r) => r.status === 200,
    'get bugs by project response time < 1500ms': (r) => r.timings.duration < 1500,
  });

  errorRate.add(!getByProjectCheck);
  responseTime.add(getByProjectResponse.timings.duration);

  if (!getByProjectCheck) {
    console.log(`Get bugs by project failed: ${getByProjectResponse.status} - ${getByProjectResponse.body}`);
  }

  sleep(0.5);

  // Test: Get bugs by status
  const getByStatusResponse = http.get(`${BASE_URL}/bugs/status/open`);

  const getByStatusCheck = check(getByStatusResponse, {
    'get bugs by status status is 200': (r) => r.status === 200,
    'get bugs by status response time < 1500ms': (r) => r.timings.duration < 1500,
  });

  errorRate.add(!getByStatusCheck);
  responseTime.add(getByStatusResponse.timings.duration);

  if (!getByStatusCheck) {
    console.log(`Get bugs by status failed: ${getByStatusResponse.status} - ${getByStatusResponse.body}`);
  }

  sleep(0.5);

  // Test: Get bugs by reporter
  const getByReporterResponse = http.get(`${BASE_URL}/bugs/reporter/1`);

  const getByReporterCheck = check(getByReporterResponse, {
    'get bugs by reporter status is 200': (r) => r.status === 200,
    'get bugs by reporter response time < 1500ms': (r) => r.timings.duration < 1500,
  });

  errorRate.add(!getByReporterCheck);
  responseTime.add(getByReporterResponse.timings.duration);

  if (!getByReporterCheck) {
    console.log(`Get bugs by reporter failed: ${getByReporterResponse.status} - ${getByReporterResponse.body}`);
  }

  sleep(1);
}

export function teardown() {
  console.log('Bug performance tests completed.');
}