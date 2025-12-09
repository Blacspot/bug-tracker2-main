import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users over 2 minutes
    { duration: '5m', target: 100 }, // Stay at 100 users for 5 minutes
    { duration: '2m', target: 200 }, // Ramp up to 200 users over 2 minutes
    { duration: '5m', target: 200 }, // Stay at 200 users for 5 minutes
    { duration: '2m', target: 0 },   // Ramp down to 0 users over 2 minutes
  ],
  thresholds: {
    http_req_duration: ['p(99)<1500'], // 99% of requests should be below 1.5s
    http_req_failed: ['rate<0.1'],     // Error rate should be below 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // User registration performance test
  const registerPayload = {
    username: `perfuser_${Math.random().toString(36).substr(2, 9)}`,
    email: `perfuser_${Math.random().toString(36).substr(2, 9)}@example.com`,
    password: 'password123',
    role: 'user'
  };

  const registerResponse = http.post(`${BASE_URL}/users/register`, JSON.stringify(registerPayload), {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const registerCheck = check(registerResponse, {
    'registration status is 201': (r) => r.status === 201,
    'registration response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  errorRate.add(!registerCheck);
  responseTime.add(registerResponse.timings.duration);

  if (!registerCheck) {
    console.log(`Registration failed: ${registerResponse.status} - ${registerResponse.body}`);
  }

  sleep(1);

  // User login performance test
  const loginPayload = {
    email: registerPayload.email,
    password: registerPayload.password,
  };

  const loginResponse = http.post(`${BASE_URL}/users/login`, JSON.stringify(loginPayload), {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const loginCheck = check(loginResponse, {
    'login status is 200': (r) => r.status === 200,
    'login response time < 1000ms': (r) => r.timings.duration < 1000,
    'login returns token': (r) => {
      try {
        const jsonResponse = r.json() as any;
        return jsonResponse.token !== undefined;
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!loginCheck);
  responseTime.add(loginResponse.timings.duration);

  if (!loginCheck) {
    console.log(`Login failed: ${loginResponse.status} - ${loginResponse.body}`);
  }

  sleep(1);

  // Get user profile performance test (requires authentication)
  if (loginResponse.status === 200) {
    const jsonResponse = loginResponse.json() as any;
    const token = jsonResponse.token;
    const profileResponse = http.get(`${BASE_URL}/users/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const profileCheck = check(profileResponse, {
      'profile status is 200': (r) => r.status === 200,
      'profile response time < 1000ms': (r) => r.timings.duration < 1000,
    });

    errorRate.add(!profileCheck);
    responseTime.add(profileResponse.timings.duration);

    if (!profileCheck) {
      console.log(`Profile fetch failed: ${profileResponse.status} - ${profileResponse.body}`);
    }
  }

  sleep(1);
}

// Setup function to prepare test data if needed
export function setup() {
  console.log('Starting user performance tests...');
}

// Teardown function for cleanup
export function teardown() {
  console.log('User performance tests completed.');
}