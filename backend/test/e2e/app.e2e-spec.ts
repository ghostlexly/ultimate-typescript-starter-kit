import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from '../../src/app.module.js';
import { AppRepository } from '../../src/modules/app/app.repository.js';
import { AppService } from '../../src/modules/app/app.service.js';
import { setupApp } from '../../src/app.setup.js';
import { Fixtures } from './supports/fixtures.js';

describe('AppController (e2e)', () => {
  let app: NestExpressApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();

    // Same configuration as production (global prefix, express settings, ...)
    setupApp(app);

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/api/test (GET)', () => {
    it("returns expected 'Hello World!'", async () => {
      const response = await request(app.getHttpServer())
        .get('/api/test')
        .expect(200);

      // The service suffixes the greeting with the cluster id (Primary / Worker Id: n)
      expect(response.body?.message).toMatch(/^Hello World! : /);
    });

    it("returns service's modified hello world", async () => {
      const service = app.get(AppService);
      const getHelloSpy = vi
        .spyOn(service, 'getHello')
        .mockImplementation(() => 'Hello :D');

      const response = await request(app.getHttpServer())
        .get('/api/test')
        .expect(200);

      expect(getHelloSpy).toHaveBeenCalledOnce();
      expect(response.body?.message).toBe('Hello :D');
    });
  });

  describe('/api/test/db (GET)', () => {
    it('returns the app configs stored in the database', async () => {
      const insertedConfig = await Fixtures.givenAppConfig();

      const response = await request(app.getHttpServer())
        .get('/api/test/db')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toEqual({
        id: insertedConfig.id,
        key: insertedConfig.key,
        value: insertedConfig.value,
        // Dates travel as ISO strings over JSON
        createdAt: insertedConfig.createdAt.toISOString(),
        updatedAt: insertedConfig.updatedAt.toISOString(),
      });
    });

    it('returns the fake data provided by a mocked repository', async () => {
      const repository = app.get(AppRepository);
      const now = new Date('2026-01-01T00:00:00.000Z');
      const fakeConfigs = [
        {
          id: '11111111-1111-4111-8111-111111111111',
          key: 'theme',
          value: 'dark',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: '22222222-2222-4222-8222-222222222222',
          key: 'locale',
          value: 'fr',
          createdAt: now,
          updatedAt: now,
        },
      ];
      const findAllSpy = vi
        .spyOn(repository, 'findAll')
        .mockResolvedValue(fakeConfigs);

      const response = await request(app.getHttpServer())
        .get('/api/test/db')
        .expect(200);

      expect(findAllSpy).toHaveBeenCalledOnce();
      expect(response.body).toEqual(
        fakeConfigs.map((config) => ({
          ...config,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        })),
      );
    });
  });
});
