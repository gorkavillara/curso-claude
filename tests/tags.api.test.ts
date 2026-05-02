import request from 'supertest';
import { createApp } from '../backend/src/app';
import { initDatabase, closeDatabase, getDatabase } from '../backend/src/db/connection';

describe('Tasks API: tags', () => {
  const app = (() => {
    initDatabase(':memory:');
    return createApp();
  })();

  afterAll(() => {
    closeDatabase();
  });

  beforeEach(() => {
    const db = getDatabase();
    db.exec('DELETE FROM task_tags; DELETE FROM tags; DELETE FROM tasks;');
  });

  it('POST /tasks accepts and returns normalized tags', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'with tags', tags: ['Urgent', 'urgent', 'home'] })
      .expect(201);
    expect(res.body.tags).toEqual(['home', 'urgent']);
  });

  it('POST /tasks returns 400 when "tags" is not an array', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 't', tags: 'urgent' })
      .expect(400);
    expect(res.body.error).toMatch(/tags/);
  });

  it('POST /tasks returns 400 when a tag is invalid', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 't', tags: ['has space'] })
      .expect(400);
    expect(res.body.error).toMatch(/invalid|character/i);
  });

  it('PUT /tasks/:id replaces tags', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .send({ title: 't', tags: ['a', 'b'] });
    const updated = await request(app)
      .put(`/api/tasks/${created.body.id}`)
      .send({ tags: ['c'] })
      .expect(200);
    expect(updated.body.tags).toEqual(['c']);
  });

  it('GET /tasks?tag=foo filters by tag', async () => {
    await request(app).post('/api/tasks').send({ title: 'A', tags: ['urgent', 'home'] });
    await request(app).post('/api/tasks').send({ title: 'B', tags: ['home'] });
    await request(app).post('/api/tasks').send({ title: 'C' });

    const res = await request(app).get('/api/tasks?tag=urgent').expect(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('A');

    const home = await request(app).get('/api/tasks?tag=HOME').expect(200);
    expect(home.body.map((t: { title: string }) => t.title).sort()).toEqual(['A', 'B']);
  });

  it('GET /tasks?tag=missing returns []', async () => {
    await request(app).post('/api/tasks').send({ title: 'A', tags: ['x'] });
    const res = await request(app).get('/api/tasks?tag=nope').expect(200);
    expect(res.body).toEqual([]);
  });

  it('GET /tasks?tag=&tag=other returns 400', async () => {
    const res = await request(app).get('/api/tasks?tag=a&tag=b').expect(400);
    expect(res.body.error).toMatch(/tag/);
  });
});
