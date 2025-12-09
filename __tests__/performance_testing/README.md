# Performance Testing Suite

This directory contains K6-based performance tests for the Bug Tracker API. These tests are designed to measure system performance under various load conditions and ensure the application can handle expected traffic patterns.

## Test Files

### 1. `user.performance.test.ts`
Tests user-related endpoints including registration, login, and profile retrieval.

**Scenarios:**
- Ramp up to 100 users over 2 minutes
- Stay at 100 users for 5 minutes
- Ramp up to 200 users over 2 minutes
- Stay at 200 users for 5 minutes
- Ramp down to 0 users

**Thresholds:**
- 99% of requests should complete in under 1.5 seconds
- Error rate should be below 10%

### 2. `project.performance.test.ts`
Tests project-related endpoints including creation and various retrieval methods.

**Scenarios:**
- Ramp up to 50 users over 1 minute
- Stay at 50 users for 3 minutes
- Ramp up to 100 users over 1 minute
- Stay at 100 users for 3 minutes
- Ramp down to 0 users

**Thresholds:**
- 95% of requests should complete in under 2 seconds
- Error rate should be below 5%

### 3. `bug.performance.test.ts`
Tests bug-related endpoints including creation and various retrieval methods.

**Scenarios:**
- Ramp up to 75 users over 1 minute
- Stay at 75 users for 4 minutes
- Ramp up to 150 users over 1 minute
- Stay at 150 users for 4 minutes
- Ramp down to 0 users

**Thresholds:**
- 95% of requests should complete in under 2.5 seconds
- Error rate should be below 8%

### 4. `comprehensive.load.test.ts`
Comprehensive load test simulating real user behavior patterns across all endpoints.

**Scenarios:**
1. **Steady Load** (15 minutes): Normal usage with 50 concurrent users
2. **Spike Test** (2 minutes): Sudden increase to 200 users to test system resilience
3. **Stress Test** (10 minutes): Maximum capacity test with up to 300 users

**User Behavior Simulation:**
- 10% of users register new accounts
- 30% of users login
- 20% of users view their profile
- 40% of users browse projects
- 50% of users browse bugs
- 15% of users create bugs
- 5% of users perform admin actions

**Thresholds:**
- 99% of requests should complete in under 3 seconds
- Error rate should be below 10%

## Prerequisites

1. Install K6:
   ```bash
   # Using npm
   npm install -g k6

   # Or using package managers
   # macOS with Homebrew
   brew install k6

   # Windows with Chocolatey
   choco install k6

   # Linux
   sudo apt update
   sudo apt install k6
   ```

2. Ensure the application is running on the target environment (default: `http://localhost:3000`)

## Running the Tests

### Individual Test Files

```bash
# Run user performance tests
k6 run __tests__/performance_testing/user.performance.test.ts

# Run project performance tests
k6 run __tests__/performance_testing/project.performance.test.ts

# Run bug performance tests
k6 run __tests__/performance_testing/bug.performance.test.ts

# Run comprehensive load test
k6 run __tests__/performance_testing/comprehensive.load.test.ts
```

### Custom Base URL

If your application is running on a different URL, set the `BASE_URL` environment variable:

```bash
# For staging environment
k6 run -e BASE_URL=http://staging-api.example.com __tests__/performance_testing/user.performance.test.ts

# For production environment
k6 run -e BASE_URL=https://api.example.com __tests__/performance_testing/comprehensive.load.test.ts
```

### Output Options

```bash
# Generate HTML report
k6 run --out json=results.json __tests__/performance_testing/comprehensive.load.test.ts

# Run with custom options
k6 run --vus 10 --duration 30s __tests__/performance_testing/user.performance.test.ts
```

## Interpreting Results

### Key Metrics

- **http_req_duration**: Response time for each request
- **http_req_failed**: Number of failed requests
- **vus**: Number of virtual users
- **iteration_duration**: Time for one complete iteration

### Performance Thresholds

Each test defines performance thresholds that must be met:

- **p(95)**, **p(99)**: Percentile response times
- **rate<0.x**: Maximum acceptable error rate

### Common Issues

1. **High Error Rates**: Check application logs for errors during test execution
2. **Slow Response Times**: Monitor database performance and server resources
3. **Failed Requests**: Verify authentication tokens and endpoint availability

## Test Data Considerations

- Tests create test users, projects, and bugs during execution
- Admin users are created automatically for privileged operations
- Tests assume certain default data exists (e.g., project ID 1, user ID 1)
- Consider running tests against a dedicated test database to avoid affecting production data

## CI/CD Integration

Add these commands to your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run Performance Tests
  run: |
    npm install -g k6
    k6 run __tests__/performance_testing/user.performance.test.ts
    k6 run __tests__/performance_testing/project.performance.test.ts
    k6 run __tests__/performance_testing/bug.performance.test.ts
```

## Best Practices

1. **Run tests regularly**: Include performance tests in your CI/CD pipeline
2. **Monitor trends**: Track performance metrics over time
3. **Test realistic scenarios**: Use the comprehensive load test for production-like conditions
4. **Scale gradually**: Start with lower user counts and increase based on system capacity
5. **Analyze bottlenecks**: Use K6's detailed reporting to identify performance bottlenecks

## Troubleshooting

### Database Connection Issues
Ensure your database can handle the test load. Consider using connection pooling.

### Memory Issues
Monitor server memory usage during tests. Increase server resources if needed.

### Rate Limiting
If your application has rate limiting, adjust test scenarios to avoid triggering limits.

### Authentication Tokens
Tests handle authentication automatically, but ensure JWT secrets are consistent between test runs.