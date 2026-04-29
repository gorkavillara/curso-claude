import request from 'supertest';
import { createApp } from '../backend/src/app';
import { initDatabase, closeDatabase, getDatabase } from '../backend/src/db/connection';

describe('Tasks API', () => {
  const app = (() => {
    initDatabase(':memory:');
    return createApp();
  })();

  afterAll(() => {
    closeDatabase();
  });

  it('creates and lists a task', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .send({ title: 'Write docs', description: 'Add README' })
      .expect(201);

    expect(created.body).toMatchObject({
      title: 'Write docs',
      description: 'Add README',
      completed: false,
    });
    expect(typeof created.body.id).toBe('number');

    const list = await request(app).get('/api/tasks').expect(200);
    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body.some((t: { id: number }) => t.id === created.body.id)).toBe(true);
  });

  it('rejects a task without title', async () => {
    const response = await request(app).post('/api/tasks').send({ description: 'No title' });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  describe('priority field', () => {
    it('defaults to medium when no priority is provided', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Default priority task' })
        .expect(201);
      expect(response.body.priority).toBe('medium');
    });

    it('accepts low, medium and high', async () => {
      for (const priority of ['low', 'medium', 'high'] as const) {
        const response = await request(app)
          .post('/api/tasks')
          .send({ title: `Task ${priority}`, priority })
          .expect(201);
        expect(response.body.priority).toBe(priority);
      }
    });

    it('rejects invalid priority values', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Bad priority', priority: 'urgent' });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('updates the priority of an existing task', async () => {
      const created = await request(app)
        .post('/api/tasks')
        .send({ title: 'Updatable' })
        .expect(201);
      expect(created.body.priority).toBe('medium');

      const updated = await request(app)
        .put(`/api/tasks/${created.body.id}`)
        .send({ priority: 'high' })
        .expect(200);
      expect(updated.body.priority).toBe('high');
    });
  });

  describe('GET /api/tasks/stats', () => {
    beforeEach(() => {
      getDatabase().exec('DELETE FROM tasks');
    });

    it('returns zeroes when there are no tasks', async () => {
      const response = await request(app).get('/api/tasks/stats').expect(200);
      expect(response.body).toEqual({ total: 0, completed: 0, pending: 0 });
    });

    it('counts completed and pending tasks', async () => {
      await request(app).post('/api/tasks').send({ title: 'A', completed: true }).expect(201);
      await request(app).post('/api/tasks').send({ title: 'B', completed: true }).expect(201);
      await request(app).post('/api/tasks').send({ title: 'C' }).expect(201);

      const response = await request(app).get('/api/tasks/stats').expect(200);
      expect(response.body).toEqual({ total: 3, completed: 2, pending: 1 });
    });
  });
});
