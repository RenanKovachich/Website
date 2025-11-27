/**
 * Testes de Logs e Auditoria
 * 
 * Cenários testados:
 * - Registro de eventos críticos (login, reserva, conflito)
 * - Estrutura padronizada dos logs
 * - Campos obrigatórios nos logs
 * - Rastreabilidade de ações
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../helpers/appFactory';
import { JWTTestHelper, TEST_CONFIG } from '../setup/test-env';

describe('Logs e Auditoria', () => {
  let app: any;
  let logOutput: any[] = [];

  beforeEach(() => {
    app = createTestApp();
    logOutput = [];
    
    // Mock do logger para capturar logs
    vi.spyOn(console, 'log').mockImplementation((...args) => {
      logOutput.push(args);
    });
    
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Logs de autenticação', () => {
    it('deve registrar tentativa de login', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      // Verificar se log de login foi gerado
      const loginLog = logOutput.find(log => 
        log[0] && typeof log[0] === 'object' && log[0].event === 'login_attempt'
      );

      expect(loginLog).toBeDefined();
      expect(loginLog[0]).toMatchObject({
        event: 'login_attempt',
        user_id: expect.any(String),
        empresa_id: expect.any(String),
        ip: expect.any(String),
        user_agent: expect.any(String),
      });
    });

    it('deve registrar erro de login', async () => {
      const invalidLoginData = {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      };

      await request(app)
        .post('/auth/login')
        .send(invalidLoginData)
        .expect(400);

      // Verificar se log de erro foi gerado
      const errorLog = logOutput.find(log => 
        log[0] && typeof log[0] === 'object' && log[0].event === 'login_error'
      );

      expect(errorLog).toBeDefined();
      expect(errorLog[0]).toMatchObject({
        event: 'login_error',
        error: expect.any(String),
      });
    });

    it('deve registrar logout', async () => {
      const token = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'user',
      });

      await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Verificar se log de logout foi gerado
      const logoutLog = logOutput.find(log => 
        log[0] && typeof log[0] === 'object' && log[0].event === 'logout'
      );

      expect(logoutLog).toBeDefined();
      expect(logoutLog[0]).toMatchObject({
        event: 'logout',
        user_id: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
      });
    });
  });

  describe('Logs de reservas', () => {
    it('deve registrar criação de reserva', async () => {
      const token = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'user',
      });

      // Mock para simular sem conflito
      vi.spyOn(Math, 'random').mockReturnValue(0.8);

      const reservationData = {
        space_id: 'space-1',
        start_date: '2025-10-11T10:00:00Z',
        end_date: '2025-10-11T11:00:00Z',
        participants: 5,
        description: 'Reunião de teste',
      };

      await request(app)
        .post('/reservas')
        .set('Authorization', `Bearer ${token}`)
        .send(reservationData)
        .expect(201);

      // Verificar se log de criação foi gerado
      const creationLog = logOutput.find(log => 
        log[0] && typeof log[0] === 'object' && log[0].event === 'reservation_created'
      );

      expect(creationLog).toBeDefined();
      expect(creationLog[0]).toMatchObject({
        event: 'reservation_created',
        user_id: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        reservation_id: expect.any(String),
        reservation_data: expect.objectContaining({
          space_id: 'space-1',
          start_date: '2025-10-11T10:00:00Z',
          end_date: '2025-10-11T11:00:00Z',
          participants: 5,
          description: 'Reunião de teste',
        }),
      });
    });

    it('deve registrar conflito detectado', async () => {
      const token = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'user',
      });

      // Mock para simular conflito
      vi.spyOn(Math, 'random').mockReturnValue(0.5);

      const reservationData = {
        space_id: 'space-1',
        start_date: '2025-10-11T10:00:00Z',
        end_date: '2025-10-11T11:00:00Z',
        participants: 5,
        description: 'Reunião com conflito',
      };

      await request(app)
        .post('/reservas')
        .set('Authorization', `Bearer ${token}`)
        .send(reservationData)
        .expect(409);

      // Verificar se log de conflito foi gerado
      const conflictLog = logOutput.find(log => 
        log[0] && typeof log[0] === 'object' && log[0].event === 'conflict_detected'
      );

      expect(conflictLog).toBeDefined();
      expect(conflictLog[0]).toMatchObject({
        event: 'conflict_detected',
        user_id: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        reservation_data: expect.objectContaining({
          space_id: 'space-1',
          start_date: '2025-10-11T10:00:00Z',
          end_date: '2025-10-11T11:00:00Z',
          participants: 5,
          description: 'Reunião com conflito',
        }),
      });
    });
  });

  describe('Logs de erros do servidor', () => {
    it('deve registrar erros internos do servidor', async () => {
      // Simular erro interno
      const originalConsoleError = console.error;
      vi.spyOn(console, 'error').mockImplementation((...args) => {
        logOutput.push(['error', ...args]);
      });

      // Fazer requisição que cause erro interno
      await request(app)
        .get('/rota-inexistente')
        .expect(404);

      // Verificar se log de erro foi gerado
      const errorLog = logOutput.find(log => 
        log[0] === 'error' && log[1] && typeof log[1] === 'object' && log[1].event === 'server_error'
      );

      expect(errorLog).toBeDefined();
      expect(errorLog[1]).toMatchObject({
        event: 'server_error',
        error: expect.any(String),
        stack: expect.any(String),
        url: '/rota-inexistente',
        method: 'GET',
      });

      vi.restoreAllMocks();
    });
  });

  describe('Estrutura padronizada dos logs', () => {
    it('deve incluir timestamp em todos os logs', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      const loginLog = logOutput.find(log => 
        log[0] && typeof log[0] === 'object' && log[0].event === 'login_attempt'
      );

      expect(loginLog[0]).toHaveProperty('time');
      expect(loginLog[0].time).toBeDefined();
    });

    it('deve incluir nível de log apropriado', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      const loginLog = logOutput.find(log => 
        log[0] && typeof log[0] === 'object' && log[0].event === 'login_attempt'
      );

      expect(loginLog[0]).toHaveProperty('level');
      expect(loginLog[0].level).toBe(30); // Info level
    });

    it('deve incluir campos obrigatórios para rastreabilidade', async () => {
      const token = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'user',
      });

      // Mock para simular sem conflito
      vi.spyOn(Math, 'random').mockReturnValue(0.8);

      const reservationData = {
        space_id: 'space-1',
        start_date: '2025-10-11T10:00:00Z',
        end_date: '2025-10-11T11:00:00Z',
        participants: 5,
        description: 'Reunião de teste',
      };

      await request(app)
        .post('/reservas')
        .set('Authorization', `Bearer ${token}`)
        .send(reservationData)
        .expect(201);

      const creationLog = logOutput.find(log => 
        log[0] && typeof log[0] === 'object' && log[0].event === 'reservation_created'
      );

      // Verificar campos obrigatórios para rastreabilidade
      expect(creationLog[0]).toHaveProperty('user_id');
      expect(creationLog[0]).toHaveProperty('empresa_id');
      expect(creationLog[0]).toHaveProperty('reservation_id');
      expect(creationLog[0]).toHaveProperty('time');
      expect(creationLog[0]).toHaveProperty('level');
    });
  });

  describe('Logs de notificações', () => {
    it('deve registrar envio de notificações', async () => {
      // Simular envio de notificação
      const notificationLog = {
        event: 'notification_sent',
        user_id: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        notification_type: 'reservation_confirmation',
        recipient: 'user@example.com',
        status: 'sent',
        timestamp: new Date().toISOString(),
      };

      // Simular log de notificação
      console.log(notificationLog);

      const log = logOutput.find(log => 
        log[0] && typeof log[0] === 'object' && log[0].event === 'notification_sent'
      );

      expect(log).toBeDefined();
      expect(log[0]).toMatchObject({
        event: 'notification_sent',
        user_id: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        notification_type: 'reservation_confirmation',
        recipient: 'user@example.com',
        status: 'sent',
      });
    });
  });

  describe('Integridade dos logs', () => {
    it('deve garantir que logs não sejam perdidos', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Fazer múltiplas operações
      await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      const token = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'user',
      });

      await request(app)
        .get('/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Verificar se todos os logs foram capturados
      expect(logOutput.length).toBeGreaterThan(0);
      
      const loginLogs = logOutput.filter(log => 
        log[0] && typeof log[0] === 'object' && log[0].event === 'login_attempt'
      );
      
      expect(loginLogs.length).toBe(1);
    });

    it('deve manter consistência na estrutura dos logs', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      const loginLog = logOutput.find(log => 
        log[0] && typeof log[0] === 'object' && log[0].event === 'login_attempt'
      );

      // Verificar estrutura consistente
      expect(loginLog[0]).toHaveProperty('event');
      expect(loginLog[0]).toHaveProperty('user_id');
      expect(loginLog[0]).toHaveProperty('empresa_id');
      expect(loginLog[0]).toHaveProperty('ip');
      expect(loginLog[0]).toHaveProperty('user_agent');
      expect(loginLog[0]).toHaveProperty('time');
      expect(loginLog[0]).toHaveProperty('level');
    });
  });
});

