import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { WebSocket } from 'ws';

describe('Real-time Poll Results (e2e)', () => {
  let app: INestApplication;
  let ws: WebSocket;
  let pollId: string;
  let accessToken: string;

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
        name: 'Realtime Tester',
        email: 'realtime@example.com',
        password: 'password123',
      });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'realtime@example.com',
        password: 'password123',
      });

    accessToken = loginRes.body.access_token;

    // Create a poll via admin REST API
    const pollRes = await request(app.getHttpServer())
      .post('/admin/polls')
      .send({
        question: 'Realtime test question?',
        options: ['Yes', 'No'],
        createdById: '1', // Adjust as needed
      });

    pollId = pollRes.body.id;
  });

  afterAll(async () => {
    if (ws) {
      ws.close();
    }
    await app.close();
  });

  it('should receive real-time poll results via WebSocket subscription', (done) => {
    ws = new WebSocket('ws://localhost:3000/graphql', 'graphql-ws');

    ws.on('open', () => {
      // Send connection init message
      ws.send(JSON.stringify({ type: 'connection_init', payload: {} }));

      // Subscribe to pollResults
      ws.send(JSON.stringify({
        id: '1',
        type: 'start',
        payload: {
          query: `
            subscription PollResults($pollId: ID!) {
              pollResults(pollId: $pollId) {
                pollId
                results
              }
            }
          `,
          variables: { pollId },
        },
      }));

      // Cast a vote to trigger update
      request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `
            mutation Vote($pollId: ID!, $option: String!) {
              vote(pollId: $pollId, option: $option)
            }
          `,
          variables: { pollId, option: 'Yes' },
        })
        .expect(200)
        .then(() => { /* vote cast */ });
    });

    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      if (message.type === 'data' && message.id === '1') {
        expect(message.payload.data.pollResults.pollId).toBe(pollId);
        expect(message.payload.data.pollResults.results).toHaveProperty('Yes');
        done();
      }
    });

    ws.on('error', (err) => {
      done(err);
    });
  });
});
