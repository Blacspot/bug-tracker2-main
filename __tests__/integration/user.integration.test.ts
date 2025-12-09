import request from 'supertest';
import app from '../../src/index';

describe('User Routes Integration Tests', () => {
  let authToken: string;
  let userId: number;
  let uniqueEmail: string;

  beforeAll(async () => {
    // Register a test user with unique email
    uniqueEmail = `test${Date.now()}@example.com`;
    const registerResponse = await request(app)
      .post('/users/register')
      .send({
        username: 'testuser',
        email: uniqueEmail,
        password: 'password123',
        role: 'admin'
      });
    expect(registerResponse.status).toBe(201);
    userId = registerResponse.body.user.UserID;

    // Login to get token
    const loginResponse = await request(app)
      .post('/users/login')
      .send({
        email: uniqueEmail,
        password: 'password123'
      });
    expect(loginResponse.status).toBe(200);
    authToken = loginResponse.body.token;
  });

  it('should get all users', async () => {
    const response = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('users');
    expect(Array.isArray(response.body.users)).toBe(true);
  });

  it('should register a new user', async () => {
    const response = await request(app)
      .post('/users/register')
      .send({
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        role: 'user'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'User created successfully');
    expect(response.body).toHaveProperty('user');
  });

  it('should login user', async () => {
    const uniqueEmail = `test${Date.now()}@example.com`;
    const response = await request(app)
      .post('/users/login')
      .send({
        email: uniqueEmail,
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Login successful');
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
  });

  it('should get user profile', async () => {
    const response = await request(app)
      .get('/users/profile')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');
  });

  it('should update user profile', async () => {
    const response = await request(app)
      .put(`/users/profile/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        Username: 'updateduser',
        Email: 'updated@example.com',
        Role: 'user'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Profile updated successfully');
    expect(response.body).toHaveProperty('user');
  });

  it('should change user password', async () => {
    const response = await request(app)
      .put('/users/change-password')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currentPassword: 'password123',
        newPassword: 'newpassword123'
      });

    expect(response.status).toBe(200);
  });

  it('should delete user', async () => {
    const response = await request(app)
      .delete(`/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(204);
  });
});