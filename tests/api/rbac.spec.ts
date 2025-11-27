/**
 * Testes de RBAC (Role-Based Access Control)
 * 
 * Cenários testados:
 * - Usuário comum não pode acessar rotas admin
 * - Admin pode acessar rotas admin
 * - Admin pode acessar rotas de usuário comum
 * - Usuário comum pode acessar suas próprias rotas
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../helpers/appFactory';
import { JWTTestHelper, TEST_CONFIG } from '../setup/test-env';

describe('RBAC - Controle de Acesso Baseado em Roles', () => {
  let app: any;

  beforeEach(() => {
    app = createTestApp();
    vi.clearAllMocks();
  });

  describe('Acesso a rotas administrativas', () => {
    it('deve negar acesso a usuário comum para /admin/dashboard', async () => {
      const userToken = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'user',
      });

      const response = await request(app)
        .get('/admin/dashboard')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.error).toBe('Acesso negado');
    });

    it('deve permitir acesso a admin para /admin/dashboard', async () => {
      const adminToken = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_ADMIN,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'admin',
      });

      const response = await request(app)
        .get('/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('Dashboard administrativo');
    });

    it('deve negar acesso sem autenticação para /admin/dashboard', async () => {
      const response = await request(app)
        .get('/admin/dashboard')
        .expect(401);

      expect(response.body.error).toBe('Token de acesso requerido');
    });
  });

  describe('Acesso a rotas de usuário comum', () => {
    it('deve permitir acesso a usuário comum para /me', async () => {
      const userToken = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'user',
      });

      const response = await request(app)
        .get('/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.user.sub).toBe(TEST_CONFIG.USER_ID_USER);
      expect(response.body.user.role).toBe('user');
    });

    it('deve permitir acesso a admin para /me', async () => {
      const adminToken = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_ADMIN,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'admin',
      });

      const response = await request(app)
        .get('/me')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.user.sub).toBe(TEST_CONFIG.USER_ID_ADMIN);
      expect(response.body.user.role).toBe('admin');
    });
  });

  describe('Hierarquia de roles', () => {
    it('deve permitir que admin acesse rotas de usuário comum', async () => {
      const adminToken = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_ADMIN,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'admin',
      });

      // Admin pode acessar rota que requer role 'user'
      const response = await request(app)
        .get('/me')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.user.role).toBe('admin');
    });

    it('deve negar que usuário comum acesse rotas que requerem admin', async () => {
      const userToken = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'user',
      });

      // Usuário comum não pode acessar rota que requer role 'admin'
      const response = await request(app)
        .get('/admin/dashboard')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.error).toBe('Acesso negado');
    });
  });

  describe('Validação de roles', () => {
    it('deve rejeitar token com role inválido', async () => {
      // Criar token com role inválido
      const invalidRoleToken = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'invalid_role' as any,
      });

      const response = await request(app)
        .get('/admin/dashboard')
        .set('Authorization', `Bearer ${invalidRoleToken}`)
        .expect(403);

      expect(response.body.error).toBe('Acesso negado');
    });

    it('deve rejeitar token sem role', async () => {
      // Criar token sem role
      const tokenWithoutRole = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: undefined as any,
      });

      const response = await request(app)
        .get('/admin/dashboard')
        .set('Authorization', `Bearer ${tokenWithoutRole}`)
        .expect(403);

      expect(response.body.error).toBe('Acesso negado');
    });
  });

  describe('Middleware de autorização', () => {
    it('deve funcionar com múltiplos middlewares de autorização', async () => {
      const adminToken = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_ADMIN,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'admin',
      });

      // Rota que requer autenticação + role admin
      const response = await request(app)
        .get('/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('Dashboard administrativo');
    });

    it('deve rejeitar requisição sem token em rota protegida', async () => {
      const response = await request(app)
        .get('/admin/dashboard')
        .expect(401);

      expect(response.body.error).toBe('Token de acesso requerido');
    });

    it('deve rejeitar token inválido em rota protegida', async () => {
      const response = await request(app)
        .get('/admin/dashboard')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error).toBe('Token inválido');
    });
  });

  describe('Logs de auditoria para RBAC', () => {
    it('deve registrar tentativa de acesso negado', async () => {
      const userToken = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'user',
      });

      // Mock do logger para capturar logs
      const loggerSpy = vi.spyOn(console, 'log');

      await request(app)
        .get('/admin/dashboard')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      // Verificar se log foi gerado (implementação específica pode variar)
      expect(loggerSpy).toHaveBeenCalled();
    });
  });
});

