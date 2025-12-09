import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up to 50 users over 1 minute
    { duration: '3m', target: 50 },  // Stay at 50 users for 3 minutes
    { duration: '1m', target: 100 }, // Ramp up to 100 users over 1 minute
    { duration: '3m', target: 100 }, // Stay at 100 users for 3 minutes
    { duration: '1m', target: 0 },   // Ramp down to 0 users over 1 minute
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.05'],    // Error rate should be below 5%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Shared variables for test data
let adminToken = '';
let testProjectId = '';

export function setup() {
  console.log('Setting up project performance tests...');

  // Create an admin user for authentication
  const adminEmail = `admin_perf_${Math.random().toString(36).substr(2, 9)}@example.com`;
  const registerResponse = http.post(`${BASE_URL}/users/register`, JSON.stringify({
    username: 'admin_perf',
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
      console.log('Admin token acquired for project tests');
    }
  }

  return { adminToken };
}

export default function (data: any) {
  const token = data.adminToken;

  // Test: Get all projects (Admin only)
  if (token) {
    const getAllResponse = http.get(`${BASE_URL}/projects`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const getAllCheck = check(getAllResponse, {
      'get all projects status is 200': (r) => r.status === 200,
      'get all projects response time < 1500ms': (r) => r.timings.duration < 1500,
    });

    errorRate.add(!getAllCheck);
    responseTime.add(getAllResponse.timings.duration);

    if (!getAllCheck) {
      console.log(`Get all projects failed: ${getAllResponse.status} - ${getAllResponse.body}`);
    }
  }

  sleep(0.5);

  // Test: Create a new project (Admin only)
  if (token) {
    const projectPayload = {
      ProjectName: `Perf Test Project ${Math.random().toString(36).substr(2, 9)}`,
      Description: 'Performance testing project description',
      StartDate: new Date().toISOString().split('T')[0],
      EndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      Status: 'active',
      CreatorID: 1 // Assuming admin user ID is 1
    };

    const createResponse = http.post(`${BASE_URL}/projects`, JSON.stringify(projectPayload), {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const createCheck = check(createResponse, {
      'create project status is 201': (r) => r.status === 201,
      'create project response time < 2000ms': (r) => r.timings.duration < 2000,
    });

    errorRate.add(!createCheck);
    responseTime.add(createResponse.timings.duration);

    if (createCheck && createResponse.status === 201) {
      const jsonResponse = createResponse.json() as any;
      testProjectId = jsonResponse.project?.ProjectID || '';
    }

    if (!createCheck) {
      console.log(`Create project failed: ${createResponse.status} - ${createResponse.body}`);
    }
  }

  sleep(0.5);

  // Test: Get project by ID (if we have a project ID)
  if (testProjectId) {
    const getByIdResponse = http.get(`${BASE_URL}/projects/${testProjectId}`);

    const getByIdCheck = check(getByIdResponse, {
      'get project by ID status is 200': (r) => r.status === 200,
      'get project by ID response time < 1000ms': (r) => r.timings.duration < 1000,
    });

    errorRate.add(!getByIdCheck);
    responseTime.add(getByIdResponse.timings.duration);

    if (!getByIdCheck) {
      console.log(`Get project by ID failed: ${getByIdResponse.status} - ${getByIdResponse.body}`);
    }
  }

  sleep(0.5);

  // Test: Get projects by creator (using creator ID 1)
  const getByCreatorResponse = http.get(`${BASE_URL}/projects/creator/1`);

  const getByCreatorCheck = check(getByCreatorResponse, {
    'get projects by creator status is 200': (r) => r.status === 200,
    'get projects by creator response time < 1500ms': (r) => r.timings.duration < 1500,
  });

  errorRate.add(!getByCreatorCheck);
  responseTime.add(getByCreatorResponse.timings.duration);

  if (!getByCreatorCheck) {
    console.log(`Get projects by creator failed: ${getByCreatorResponse.status} - ${getByCreatorResponse.body}`);
  }

  sleep(1);
}

export function teardown() {
  console.log('Project performance tests completed.');
}