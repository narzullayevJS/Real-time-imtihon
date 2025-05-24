import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('PollResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let pollId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Register and login user to get token
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Poll Tester',
        email: 'polltester@example.com',
        password: 'password123',
      });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'polltester@example.com',
        password: 'password123',
      });

    accessToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a poll via admin REST API', async () => {
    const res = await request(app.getHttpServer())
      .post('/admin/polls')
      .send({
        question: 'Test question?',
        options: ['Option 1', 'Option 2'],
        createdById: '1', // This should be replaced with actual user id or mocked
      })
      .expect(201);

    pollId = res.body.id;
    expect(res.body).toHaveProperty('question', 'Test question?');
  });

  it('should fetch active polls via GraphQL', async () => {
    const query = `
      query {
        polls {
          id
          question
          options
          isActive
        }
      }
    `;

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect(200);

    expect(res.body.data.polls).toBeInstanceOf(Array);
  });

  it('should allow voting on a poll', async () => {
    const mutation = `
      mutation Vote($pollId: ID!, $option: String!) {
        vote(pollId: $pollId, option: $option)
      }
    `;

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        query: mutation,
        variables: { pollId, option: 'Option 1' },
      })
      .expect(200);

    expect(res.body.data.vote).toBe(true);
  });
});
