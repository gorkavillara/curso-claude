import request from 'supertest';
import { createApp } from '../backend/src/app';
import { initDatabase, closeDatabase } from '../backend/src/db/connection';

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
    expect(Array.isArray(list.body.items)).toBe(true);
    expect(list.body.items.some((t: { id: number }) => t.id === created.body.id)).toBe(true);
  });

  it('filters tasks by completion status', async () => {
    await request(app)
      .post('/api/tasks')
      .send({ title: 'Pending one', completed: false })
      .expect(201);

    const pending = await request(app).get('/api/tasks?filter=pending').expect(200);
    expect(pending.body.items.every((t: { completed: boolean }) => t.completed === false)).toBe(
      true,
    );
  });

  it('rejects a task without title', async () => {
    const response = await request(app).post('/api/tasks').send({ description: 'No title' });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});
