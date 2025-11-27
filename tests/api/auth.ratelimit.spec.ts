/**
 * Testes de Rate Limiting
 * 
 * Cenários testados:
 * - Limite de 5 requisições por minuto para /auth/login
 * - Retorno de 429 quando limite é excedido
 * - Retorno ao comportamento normal após janela de tempo
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../helpers/appFactory';
import { TEST_CONFIG } from '../setup/test-env';

describe('Rate Limiting - /auth/login', () => {
  let app: any;

  beforeEach(() => {
    app = createTestApp();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Limpar rate limit entre testes
    vi.clearAllMocks();
  });

  it('deve permitir até 5 tentativas de login por minuto', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    // Fazer 5 tentativas (limite permitido)
    for (let i = 0; i < 5; i++) {
      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.access_token).toBeDefined();
      expect(response.body.refresh_token).toBeDefined();
    }
  });

  it('deve retornar 429 na 6ª tentativa', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    // Fazer 5 tentativas (limite permitido)
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);
    }

    // 6ª tentativa deve retornar 429
    const response = await request(app)
      .post('/auth/login')
      .send(loginData)
      .expect(429);

    expect(response.body.error).toContain('Muitas tentativas de login');
  });

  it('deve incluir headers de rate limit nas respostas', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    const response = await request(app)
      .post('/auth/login')
      .send(loginData)
      .expect(200);

    // Verificar headers de rate limit
    expect(response.headers['x-ratelimit-limit']).toBeDefined();
    expect(response.headers['x-ratelimit-remaining']).toBeDefined();
    expect(response.headers['x-ratelimit-reset']).toBeDefined();
  });

  it('deve decrementar contador de tentativas restantes', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    // Primeira tentativa
    const response1 = await request(app)
      .post('/auth/login')
      .send(loginData)
      .expect(200);

    const remaining1 = parseInt(response1.headers['x-ratelimit-remaining']);

    // Segunda tentativa
    const response2 = await request(app)
      .post('/auth/login')
      .send(loginData)
      .expect(200);

    const remaining2 = parseInt(response2.headers['x-ratelimit-remaining']);

    expect(remaining2).toBe(remaining1 - 1);
  });

  it('deve aplicar rate limit por IP', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    // Simular diferentes IPs
    const ip1 = '192.168.1.1';
    const ip2 = '192.168.1.2';

    // IP1 faz 5 tentativas (limite)
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/auth/login')
        .set('X-Forwarded-For', ip1)
        .send(loginData)
        .expect(200);
    }

    // IP1 na 6ª tentativa deve retornar 429
    await request(app)
      .post('/auth/login')
      .set('X-Forwarded-For', ip1)
      .send(loginData)
      .expect(429);

    // IP2 deve conseguir fazer login normalmente
    await request(app)
      .post('/auth/login')
      .set('X-Forwarded-For', ip2)
      .send(loginData)
      .expect(200);
  });

  it('deve resetar contador após janela de tempo', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    // Fazer 5 tentativas (limite)
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);
    }

    // 6ª tentativa deve retornar 429
    await request(app)
      .post('/auth/login')
      .send(loginData)
      .expect(429);

    // Simular passagem do tempo (mock do Date.now)
    const originalNow = Date.now;
    vi.spyOn(Date, 'now').mockImplementation(() => originalNow() + TEST_CONFIG.RATE_LIMIT_WINDOW_MS + 1000);

    // Após janela de tempo, deve permitir login novamente
    const response = await request(app)
      .post('/auth/login')
      .send(loginData)
      .expect(200);

    expect(response.body.access_token).toBeDefined();

    // Restaurar Date.now
    vi.restoreAllMocks();
  });

  it('deve aplicar rate limit apenas em /auth/login', async () => {
    const token = 'valid-token';

    // Fazer muitas requisições para outras rotas
    for (let i = 0; i < 10; i++) {
      await request(app)
        .get('/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(401); // 401 porque token é inválido, mas não 429
    }

    // Rate limit não deve ser aplicado em outras rotas
    const response = await request(app)
      .get('/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);

    expect(response.status).toBe(401);
    expect(response.status).not.toBe(429);
  });

  it('deve incluir informações de retry-after no header 429', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    // Fazer 5 tentativas (limite)
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);
    }

    // 6ª tentativa deve retornar 429 com retry-after
    const response = await request(app)
      .post('/auth/login')
      .send(loginData)
      .expect(429);

    expect(response.headers['retry-after']).toBeDefined();
    expect(parseInt(response.headers['retry-after'])).toBeGreaterThan(0);
  });
});
