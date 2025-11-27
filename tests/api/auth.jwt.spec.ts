/**
 * Testes de Autenticação JWT
 * 
 * Cenários testados:
 * - Expiração de tokens de acesso (15 minutos)
 * - Renovação de tokens de refresh (7 dias)
 * - Rejeição de tokens expirados
 * - Revogação de tokens via blacklist
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createTestApp } from '../helpers/appFactory';
import { JWTTestHelper, TEST_CONFIG, RedisTestHelper } from '../setup/test-env';

describe('Autenticação JWT', () => {
  let app: any;

  beforeEach(() => {
    app = createTestApp();
    vi.clearAllMocks();
  });

  describe('Expiração de tokens de acesso', () => {
    it('deve rejeitar token de acesso expirado', async () => {
      // Criar token expirado
      const expiredToken = JWTTestHelper.createExpiredToken({
        sub: TEST_CONFIG.USER_ID_ADMIN,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'admin',
      });

      const response = await request(app)
        .get('/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.error).toBe('Token inválido');
    });

    it('deve aceitar token de acesso válido', async () => {
      const validToken = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_ADMIN,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'admin',
      });

      const response = await request(app)
        .get('/me')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.user.sub).toBe(TEST_CONFIG.USER_ID_ADMIN);
      expect(response.body.user.empresa_id).toBe(TEST_CONFIG.EMPRESA_ID_1);
      expect(response.body.user.role).toBe('admin');
    });

    it('deve rejeitar requisição sem token', async () => {
      const response = await request(app)
        .get('/me')
        .expect(401);

      expect(response.body.error).toBe('Token de acesso requerido');
    });
  });

  describe('Renovação de tokens de refresh', () => {
    it('deve renovar token de acesso com refresh token válido', async () => {
      const refreshToken = JWTTestHelper.createRefreshToken({
        sub: TEST_CONFIG.USER_ID_ADMIN,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'admin',
      });

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refresh_token: refreshToken })
        .expect(200);

      expect(response.body.access_token).toBeDefined();
      
      // Verificar se o novo token é válido
      const newToken = response.body.access_token;
      const decoded = jwt.verify(newToken, TEST_CONFIG.JWT_SECRET) as any;
      
      expect(decoded.sub).toBe(TEST_CONFIG.USER_ID_ADMIN);
      expect(decoded.empresa_id).toBe(TEST_CONFIG.EMPRESA_ID_1);
      expect(decoded.role).toBe('admin');
    });

    it('deve rejeitar refresh token expirado', async () => {
      const expiredRefreshToken = JWTTestHelper.createExpiredToken({
        sub: TEST_CONFIG.USER_ID_ADMIN,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'admin',
      });

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refresh_token: expiredRefreshToken })
        .expect(401);

      expect(response.body.error).toBe('Refresh token inválido');
    });

    it('deve rejeitar refresh token inválido', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refresh_token: 'invalid-token' })
        .expect(401);

      expect(response.body.error).toBe('Refresh token inválido');
    });
  });

  describe('Revogação de tokens via blacklist', () => {
    it('deve rejeitar token revogado na blacklist', async () => {
      const jti = 'test-jti-' + Date.now();
      const token = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_ADMIN,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'admin',
        jti,
      });

      // Adicionar token à blacklist
      await RedisTestHelper.addToBlacklist(jti, 900);

      const response = await request(app)
        .get('/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);

      expect(response.body.error).toBe('Token revogado');
    });

    it('deve aceitar token não revogado', async () => {
      const jti = 'test-jti-' + Date.now();
      const token = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_ADMIN,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'admin',
        jti,
      });

      // Não adicionar à blacklist

      const response = await request(app)
        .get('/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.user.sub).toBe(TEST_CONFIG.USER_ID_ADMIN);
    });

    it('deve adicionar token à blacklist no logout', async () => {
      const jti = 'test-jti-' + Date.now();
      const token = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_ADMIN,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'admin',
        jti,
      });

      // Fazer logout
      await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Verificar se token foi adicionado à blacklist
      const isBlacklisted = await RedisTestHelper.isBlacklisted(jti);
      expect(isBlacklisted).toBe(true);

      // Tentar usar token após logout
      const response = await request(app)
        .get('/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);

      expect(response.body.error).toBe('Token revogado');
    });
  });

  describe('Estrutura dos tokens', () => {
    it('deve incluir campos obrigatórios no token de acesso', async () => {
      const token = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_ADMIN,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'admin',
      });

      const decoded = jwt.verify(token, TEST_CONFIG.JWT_SECRET) as any;
      
      expect(decoded.sub).toBeDefined();
      expect(decoded.empresa_id).toBeDefined();
      expect(decoded.role).toBeDefined();
      expect(decoded.jti).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it('deve incluir campos obrigatórios no token de refresh', async () => {
      const token = JWTTestHelper.createRefreshToken({
        sub: TEST_CONFIG.USER_ID_ADMIN,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'admin',
      });

      const decoded = jwt.verify(token, TEST_CONFIG.JWT_SECRET) as any;
      
      expect(decoded.sub).toBeDefined();
      expect(decoded.empresa_id).toBeDefined();
      expect(decoded.role).toBeDefined();
      expect(decoded.jti).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });
  });
});

