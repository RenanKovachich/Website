/**
 * Testes de Isolamento Multi-tenant
 * 
 * Cenários testados:
 * - Usuário da empresa A não pode acessar recursos da empresa B
 * - Usuário da empresa A pode acessar recursos da empresa A
 * - Validação de empresa_id em claims do token
 * - Filtro automático por empresa_id nas consultas
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../helpers/appFactory';
import { JWTTestHelper, TEST_CONFIG } from '../setup/test-env';

describe('Isolamento Multi-tenant', () => {
  let app: any;

  beforeEach(() => {
    app = createTestApp();
    vi.clearAllMocks();
  });

  describe('Acesso cruzado entre empresas', () => {
    it('deve negar acesso a usuário da empresa A para recursos da empresa B', async () => {
      const empresaAToken = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'user',
      });

      const response = await request(app)
        .get(`/empresas/${TEST_CONFIG.EMPRESA_ID_2}/reservas`)
        .set('Authorization', `Bearer ${empresaAToken}`)
        .expect(403);

      expect(response.body.error).toBe('Acesso negado: recurso pertence a outra empresa');
    });

    it('deve permitir acesso a usuário da empresa A para recursos da empresa A', async () => {
      const empresaAToken = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'user',
      });

      const response = await request(app)
        .get(`/empresas/${TEST_CONFIG.EMPRESA_ID_1}/reservas`)
        .set('Authorization', `Bearer ${empresaAToken}`)
        .expect(200);

      expect(response.body.empresa_id).toBe(TEST_CONFIG.EMPRESA_ID_1);
      expect(response.body.user_empresa_id).toBe(TEST_CONFIG.EMPRESA_ID_1);
    });

    it('deve negar acesso a admin da empresa A para recursos da empresa B', async () => {
      const empresaAAdminToken = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_ADMIN,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'admin',
      });

      const response = await request(app)
        .get(`/empresas/${TEST_CONFIG.EMPRESA_ID_2}/reservas`)
        .set('Authorization', `Bearer ${empresaAAdminToken}`)
        .expect(403);

      expect(response.body.error).toBe('Acesso negado: recurso pertence a outra empresa');
    });
  });

  describe('Validação de empresa_id em tokens', () => {
    it('deve rejeitar token sem empresa_id', async () => {
      // Criar token sem empresa_id
      const tokenWithoutEmpresa = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_USER,
        empresa_id: undefined as any,
        role: 'user',
      });

      const response = await request(app)
        .get(`/empresas/${TEST_CONFIG.EMPRESA_ID_1}/reservas`)
        .set('Authorization', `Bearer ${tokenWithoutEmpresa}`)
        .expect(403);

      expect(response.body.error).toBe('Acesso negado: recurso pertence a outra empresa');
    });

    it('deve rejeitar token com empresa_id inválido', async () => {
      const invalidEmpresaToken = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_USER,
        empresa_id: 'empresa-inexistente',
        role: 'user',
      });

      const response = await request(app)
        .get(`/empresas/${TEST_CONFIG.EMPRESA_ID_1}/reservas`)
        .set('Authorization', `Bearer ${invalidEmpresaToken}`)
        .expect(403);

      expect(response.body.error).toBe('Acesso negado: recurso pertence a outra empresa');
    });
  });

  describe('Filtro automático por empresa_id', () => {
    it('deve filtrar recursos automaticamente por empresa_id do token', async () => {
      const empresaAToken = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'user',
      });

      const response = await request(app)
        .get(`/empresas/${TEST_CONFIG.EMPRESA_ID_1}/reservas`)
        .set('Authorization', `Bearer ${empresaAToken}`)
        .expect(200);

      // Verificar se o filtro foi aplicado corretamente
      expect(response.body.empresa_id).toBe(TEST_CONFIG.EMPRESA_ID_1);
      expect(response.body.user_empresa_id).toBe(TEST_CONFIG.EMPRESA_ID_1);
    });

    it('deve aplicar filtro mesmo quando empresa_id não é especificado na URL', async () => {
      const empresaAToken = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'user',
      });

      // Simular rota que usa empresa_id do token automaticamente
      const response = await request(app)
        .get('/me')
        .set('Authorization', `Bearer ${empresaAToken}`)
        .expect(200);

      expect(response.body.user.empresa_id).toBe(TEST_CONFIG.EMPRESA_ID_1);
    });
  });

  describe('Validação em criação de recursos', () => {
    it('deve validar empresa_id ao criar reserva', async () => {
      const empresaAToken = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'user',
      });

      const reservationData = {
        space_id: 'space-1',
        start_date: '2025-10-11T10:00:00Z',
        end_date: '2025-10-11T11:00:00Z',
        participants: 5,
        description: 'Reunião de teste',
        empresa_id: TEST_CONFIG.EMPRESA_ID_2, // Tentar criar para empresa diferente
      };

      const response = await request(app)
        .post('/reservas')
        .set('Authorization', `Bearer ${empresaAToken}`)
        .send(reservationData)
        .expect(403);

      expect(response.body.error).toBe('Acesso negado: recurso pertence a outra empresa');
    });

    it('deve permitir criação de reserva para empresa do usuário', async () => {
      const empresaAToken = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'user',
      });

      const reservationData = {
        space_id: 'space-1',
        start_date: '2025-10-11T10:00:00Z',
        end_date: '2025-10-11T11:00:00Z',
        participants: 5,
        description: 'Reunião de teste',
        empresa_id: TEST_CONFIG.EMPRESA_ID_1, // Empresa do usuário
      };

      const response = await request(app)
        .post('/reservas')
        .set('Authorization', `Bearer ${empresaAToken}`)
        .send(reservationData)
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.status).toBe('confirmada');
    });
  });

  describe('Isolamento de dados', () => {
    it('deve garantir que dados de uma empresa não vazem para outra', async () => {
      const empresaAToken = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'user',
      });

      const empresaBToken = JWTTestHelper.createAccessToken({
        sub: 'user-empresa-2',
        empresa_id: TEST_CONFIG.EMPRESA_ID_2,
        role: 'user',
      });

      // Empresa A acessa seus recursos
      const responseA = await request(app)
        .get(`/empresas/${TEST_CONFIG.EMPRESA_ID_1}/reservas`)
        .set('Authorization', `Bearer ${empresaAToken}`)
        .expect(200);

      // Empresa B acessa seus recursos
      const responseB = await request(app)
        .get(`/empresas/${TEST_CONFIG.EMPRESA_ID_2}/reservas`)
        .set('Authorization', `Bearer ${empresaBToken}`)
        .expect(200);

      // Verificar que os dados são isolados
      expect(responseA.body.empresa_id).toBe(TEST_CONFIG.EMPRESA_ID_1);
      expect(responseB.body.empresa_id).toBe(TEST_CONFIG.EMPRESA_ID_2);
      expect(responseA.body.empresa_id).not.toBe(responseB.body.empresa_id);
    });
  });

  describe('Logs de auditoria multi-tenant', () => {
    it('deve registrar tentativas de acesso cruzado', async () => {
      const empresaAToken = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'user',
      });

      // Mock do logger para capturar logs
      const loggerSpy = vi.spyOn(console, 'log');

      await request(app)
        .get(`/empresas/${TEST_CONFIG.EMPRESA_ID_2}/reservas`)
        .set('Authorization', `Bearer ${empresaAToken}`)
        .expect(403);

      // Verificar se log foi gerado
      expect(loggerSpy).toHaveBeenCalled();
    });
  });
});

