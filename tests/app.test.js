const request = require('supertest');
const app = require('../src/index'); // Import the real app

// Mock the database to avoid actual db calls
jest.mock('../src/config/database', () => ({
  query: jest.fn().mockResolvedValue({ rows: [] }),
}));

describe('App Routes', () => {
  it('should respond with 302 for the root route', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toBe('/case/login');
  });

  it('should respond with 200 for the report route', async () => {
    const res = await request(app).get('/report');
    expect(res.statusCode).toEqual(200);
  });

  it('should respond with 200 for the case login route', async () => {
    const res = await request(app).get('/case/login');
    expect(res.statusCode).toEqual(200);
  });

  it('should redirect to login for the admin dashboard route when not authenticated', async () => {
    const res = await request(app).get('/admin/dashboard');
    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toBe('/admin/login');
  });

  it('should respond with 200 for the admin dashboard route when authenticated', async () => {
    const db = require('../src/config/database');
    const agent = request.agent(app);

    await agent
      .post('/admin/login')
      .send({ username: 'admin', password: 'password' });

    // Mock the specific query for fetching reports for the dashboard
    db.query.mockResolvedValue({ rows: [{id: 1, title: 'U5VYT09PVEVSUExBTg==', status: 'new', created_at: '2023-01-01'}] });
    const res = await agent.get('/admin/dashboard');
    expect(res.statusCode).toEqual(200);
  });
});
