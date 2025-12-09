import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

// Comprehensive load test configuration
export const options = {
  scenarios: {
    // Scenario 1: Steady load - normal usage pattern
    steady_load: {
      executor: 'ramping-vus',
      stages: [
        { duration: '2m', target: 50 },   // Ramp up to 50 users
        { duration: '10m', target: 50 },  // Stay at 50 users
        { duration: '2m', target: 0 },    // Ramp down
      ],
      tags: { test_type: 'steady_load' },
    },
    // Scenario 2: Spike test - sudden traffic increase
    spike_test: {
      executor: 'ramping-vus',
      stages: [
        { duration: '1m', target: 10 },   // Normal load
        { duration: '10s', target: 200 }, // Spike to 200 users
        { duration: '1m', target: 200 },  // Stay at spike
        { duration: '10s', target: 10 },  // Drop back
        { duration: '1m', target: 10 },   // Stay at normal
        { duration: '30s', target: 0 },   // Ramp down
      ],
      startTime: '15m', // Start after steady load
      tags: { test_type: 'spike_test' },
    },
    // Scenario 3: Stress test - maximum capacity
    stress_test: {
      executor: 'ramping-vus',
      stages: [
        { duration: '1m', target: 100 },  // Ramp up to 100
        { duration: '2m', target: 200 },  // Ramp up to 200
        { duration: '2m', target: 300 },  // Ramp up to 300
        { duration: '5m', target: 300 },  // Stay at 300
        { duration: '2m', target: 0 },    // Ramp down
      ],
      startTime: '25m', // Start after spike test
      tags: { test_type: 'stress_test' },
    },
  },
  thresholds: {
    http_req_duration: ['p(99)<3000'], // 99% of requests should be below 3s
    http_req_failed: ['rate<0.1'],     // Error rate should be below 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// User behavior weights (simulating real usage patterns)
const USER_BEHAVIORS = {
  REGISTER: 0.1,    // 10% of users register
  LOGIN: 0.3,       // 30% of users login
  VIEW_PROFILE: 0.2, // 20% of users view profile
  VIEW_PROJECTS: 0.4, // 40% of users browse projects
  VIEW_BUGS: 0.5,    // 50% of users browse bugs
  CREATE_BUG: 0.15,  // 15% of users create bugs
  ADMIN_ACTIONS: 0.05, // 5% of users perform admin actions
};

export default function () {
  // Simulate user journey based on weighted probabilities
  const random = Math.random();

  // User registration (10% probability)
  if (random < USER_BEHAVIORS.REGISTER) {
    performUserRegistration();
    sleep(Math.random() * 2 + 1); // 1-3 seconds
  }

  // User login (30% probability, but only if not registering)
  let userToken = '';
  if (random >= USER_BEHAVIORS.REGISTER && random < USER_BEHAVIORS.REGISTER + USER_BEHAVIORS.LOGIN) {
    userToken = performUserLogin();
    sleep(Math.random() * 1 + 0.5); // 0.5-1.5 seconds
  }

  // View profile (20% probability, requires login)
  if (userToken && random < USER_BEHAVIORS.VIEW_PROFILE) {
    performViewProfile(userToken);
    sleep(Math.random() * 1 + 0.5);
  }

  // Browse projects (40% probability)
  if (random < USER_BEHAVIORS.VIEW_PROJECTS) {
    performBrowseProjects();
    sleep(Math.random() * 2 + 1);
  }

  // Browse bugs (50% probability)
  if (random < USER_BEHAVIORS.VIEW_BUGS) {
    performBrowseBugs();
    sleep(Math.random() * 2 + 1);
  }

  // Create bug (15% probability)
  if (random < USER_BEHAVIORS.CREATE_BUG) {
    performCreateBug();
    sleep(Math.random() * 3 + 1); // 1-4 seconds (more time for creation)
  }

  // Admin actions (5% probability)
  if (random < USER_BEHAVIORS.ADMIN_ACTIONS) {
    performAdminActions();
    sleep(Math.random() * 2 + 1);
  }

  // Random think time between 1-5 seconds
  sleep(Math.random() * 4 + 1);
}

// Helper functions for different user actions
function performUserRegistration() {
  const registerPayload = {
    username: `loaduser_${Math.random().toString(36).substr(2, 9)}`,
    email: `loaduser_${Math.random().toString(36).substr(2, 9)}@example.com`,
    password: 'password123',
    role: 'user'
  };

  const response = http.post(`${BASE_URL}/users/register`, JSON.stringify(registerPayload), {
    headers: { 'Content-Type': 'application/json' },
  });

  const checkResult = check(response, {
    'registration successful': (r) => r.status === 201,
    'registration response time OK': (r) => r.timings.duration < 2000,
  });

  errorRate.add(!checkResult);
  responseTime.add(response.timings.duration);
}

function performUserLogin(): string {
  const loginPayload = {
    email: `loaduser_${Math.random().toString(36).substr(2, 9)}@example.com`,
    password: 'password123',
  };

  const response = http.post(`${BASE_URL}/users/login`, JSON.stringify(loginPayload), {
    headers: { 'Content-Type': 'application/json' },
  });

  const checkResult = check(response, {
    'login successful': (r) => r.status === 200,
    'login response time OK': (r) => r.timings.duration < 1500,
  });

  errorRate.add(!checkResult);
  responseTime.add(response.timings.duration);

  if (response.status === 200) {
    const jsonResponse = response.json() as any;
    return jsonResponse.token || '';
  }
  return '';
}

function performViewProfile(token: string) {
  const response = http.get(`${BASE_URL}/users/profile`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const checkResult = check(response, {
    'profile view successful': (r) => r.status === 200,
    'profile response time OK': (r) => r.timings.duration < 1000,
  });

  errorRate.add(!checkResult);
  responseTime.add(response.timings.duration);
}

function performBrowseProjects() {
  // Randomly choose between different project endpoints
  const endpoints = [
    `${BASE_URL}/projects/creator/1`,
    `${BASE_URL}/projects/member/1`,
  ];

  const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const response = http.get(randomEndpoint);

  const checkResult = check(response, {
    'project browse successful': (r) => r.status === 200,
    'project browse response time OK': (r) => r.timings.duration < 1500,
  });

  errorRate.add(!checkResult);
  responseTime.add(response.timings.duration);
}

function performBrowseBugs() {
  // Randomly choose between different bug endpoints
  const endpoints = [
    `${BASE_URL}/bugs/project/1`,
    `${BASE_URL}/bugs/status/open`,
    `${BASE_URL}/bugs/reporter/1`,
  ];

  const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const response = http.get(randomEndpoint);

  const checkResult = check(response, {
    'bug browse successful': (r) => r.status === 200,
    'bug browse response time OK': (r) => r.timings.duration < 1500,
  });

  errorRate.add(!checkResult);
  responseTime.add(response.timings.duration);
}

function performCreateBug() {
  const bugPayload = {
    Title: `Load Test Bug ${Math.random().toString(36).substr(2, 9)}`,
    Description: 'Bug created during comprehensive load testing.',
    Status: 'open',
    Priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
    ProjectID: 1,
    ReporterID: 1,
    AssigneeID: null
  };

  const response = http.post(`${BASE_URL}/bugs`, JSON.stringify(bugPayload), {
    headers: { 'Content-Type': 'application/json' },
  });

  const checkResult = check(response, {
    'bug creation successful': (r) => r.status === 201,
    'bug creation response time OK': (r) => r.timings.duration < 2000,
  });

  errorRate.add(!checkResult);
  responseTime.add(response.timings.duration);
}

function performAdminActions() {
  // For admin actions, we'd need an admin token
  // This is a simplified version - in real scenario, maintain admin session
  const adminPayload = {
    username: 'admin_load_test',
    email: `admin_load_${Math.random().toString(36).substr(2, 9)}@example.com`,
    password: 'admin123',
    role: 'admin'
  };

  // Register admin
  const registerResponse = http.post(`${BASE_URL}/users/register`, JSON.stringify(adminPayload), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (registerResponse.status === 201) {
    // Login admin
    const loginResponse = http.post(`${BASE_URL}/users/login`, JSON.stringify({
      email: adminPayload.email,
      password: adminPayload.password,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

    if (loginResponse.status === 200) {
      const jsonResponse = loginResponse.json() as any;
      const adminToken = jsonResponse.token;

      // Perform admin action: get all users
      const adminResponse = http.get(`${BASE_URL}/users`, {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });

      const checkResult = check(adminResponse, {
        'admin action successful': (r) => r.status === 200,
        'admin response time OK': (r) => r.timings.duration < 2000,
      });

      errorRate.add(!checkResult);
      responseTime.add(adminResponse.timings.duration);
    }
  }
}

export function setup() {
  console.log('Starting comprehensive load test...');
  console.log(`Target URL: ${BASE_URL}`);
}

export function teardown() {
  console.log('Comprehensive load test completed.');
}