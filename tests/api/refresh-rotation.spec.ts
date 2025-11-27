/**
 * Testes de Refresh Rotation e Revogação
 * 
 * Cenários testados:
 * - Rotação de tokens de refresh
 * - Revogação de tokens antigos
 * - Blacklist de tokens revogados
 * - Invalidação por versão
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createTestApp } from '../helpers/appFactory';
import { JWTTestHelper, TEST_CONFIG, RedisTestHelper } from '../setup/test-env';

describe('Refresh Rotation e Revogação', () => {
  let app: any;

  beforeEach(() => {
    app = createTestApp();
    vi.clearAllMocks();
  });

  describe('Rotação de tokens de refresh', () => {
    it('deve gerar novo access token com refresh token válido', async () => {
      const refreshToken = JWTTestHelper.createRefreshToken({
        sub: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'user',
      });

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refresh_token: refreshToken })
        .expect(200);

      expect(response.body.access_token).toBeDefined();
      
      // Verificar se o novo token é válido
      const newToken = response.body.access_token;
      const decoded = jwt.verify(newToken, TEST_CONFIG.JWT_SECRET) as any;
      
      expect(decoded.sub).toBe(TEST_CONFIG.USER_ID_USER);
      expect(decoded.empresa_id).toBe(TEST_CONFIG.EMPRESA_ID_1);
      expect(decoded.role).toBe('user');
    });

    it('deve gerar novo jti para cada rotação', async () => {
      const refreshToken = JWTTestHelper.createRefreshToken({
        sub: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'user',
      });

      const response1 = await request(app)
        .post('/auth/refresh')
        .send({ refresh_token: refreshToken })
        .expect(200);

      const response2 = await request(app)
        .post('/auth/refresh')
        .send({ refresh_token: refreshToken })
        .expect(200);

      const token1 = response1.body.access_token;
      const token2 = response2.body.access_token;

      const decoded1 = jwt.verify(token1, TEST_CONFIG.JWT_SECRET) as any;
      const decoded2 = jwt.verify(token2, TEST_CONFIG.JWT_SECRET) as any;

      expect(decoded1.jti).not.toBe(decoded2.jti);
    });

    it('deve manter informações do usuário na rotação', async () => {
      const refreshToken = JWTTestHelper.createRefreshToken({
        sub: TEST_CONFIG.USER_ID_ADMIN,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'admin',
      });

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refresh_token: refreshToken })
        .expect(200);

      const newToken = response.body.access_token;
      const decoded = jwt.verify(newToken, TEST_CONFIG.JWT_SECRET) as any;
      
      expect(decoded.sub).toBe(TEST_CONFIG.USER_ID_ADMIN);
      expect(decoded.empresa_id).toBe(TEST_CONFIG.EMPRESA_ID_1);
      expect(decoded.role).toBe('admin');
    });
  });

  describe('Revogação de tokens antigos', () => {
    it('deve adicionar token à blacklist no logout', async () => {
      const jti = 'test-jti-' + Date.now();
      const token = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'user',
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
    });

    it('deve rejeitar token revogado após logout', async () => {
      const jti = 'test-jti-' + Date.now();
      const token = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'user',
        jti,
      });

      // Fazer logout
      await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Tentar usar token após logout
      const response = await request(app)
        .get('/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);

      expect(response.body.error).toBe('Token revogado');
    });

    it('deve revogar refresh token após rotação', async () => {
      const refreshJti = 'refresh-jti-' + Date.now();
      const refreshToken = JWTTestHelper.createRefreshToken({
        sub: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'user',
        jti: refreshJti,
      });

      // Fazer primeira rotação
      await request(app)
        .post('/auth/refresh')
        .send({ refresh_token: refreshToken })
        .expect(200);

      // Verificar se refresh token foi revogado
      const isBlacklisted = await RedisTestHelper.isBlacklisted(refreshJti);
      expect(isBlacklisted).toBe(true);
    });
  });

  describe('Blacklist de tokens revogados', () => {
    it('deve verificar blacklist antes de validar token', async () => {
      const jti = 'test-jti-' + Date.now();
      const token = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'user',
        jti,
      });

      // Adicionar token à blacklist manualmente
      await RedisTestHelper.addToBlacklist(jti, 900);

      // Tentar usar token blacklisted
      const response = await request(app)
        .get('/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);

      expect(response.body.error).toBe('Token revogado');
    });

    it('deve permitir token não blacklisted', async () => {
      const jti = 'test-jti-' + Date.now();
      const token = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'user',
        jti,
      });

      // Não adicionar à blacklist

      // Usar token normalmente
      const response = await request(app)
        .get('/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.user.sub).toBe(TEST_CONFIG.USER_ID_USER);
    });

    it('deve limpar blacklist automaticamente após expiração', async () => {
      const jti = 'test-jti-' + Date.now();
      const token = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'user',
        jti,
      });

      // Adicionar à blacklist com TTL curto
      await RedisTestHelper.addToBlacklist(jti, 1); // 1 segundo

      // Aguardar expiração
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Verificar se token não está mais blacklisted
      const isBlacklisted = await RedisTestHelper.isBlacklisted(jti);
      expect(isBlacklisted).toBe(false);
    });
  });

  describe('Invalidação por versão', () => {
    it('deve invalidar tokens de versão anterior', async () => {
      const oldVersionToken = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'user',
      });

      // Simular mudança de versão (novo JWT_SECRET)
      const originalSecret = process.env.JWT_SECRET;
      process.env.JWT_SECRET = 'new-secret-key-for-version-change';

      // Token da versão anterior deve ser inválido
      const response = await request(app)
        .get('/me')
        .set('Authorization', `Bearer ${oldVersionToken}`)
        .expect(401);

      expect(response.body.error).toBe('Token inválido');

      // Restaurar secret original
      process.env.JWT_SECRET = originalSecret;
    });

    it('deve aceitar tokens da versão atual', async () => {
      const currentVersionToken = JWTTestHelper.createAccessToken({
        sub: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'user',
      });

      // Token da versão atual deve ser válido
      const response = await request(app)
        .get('/me')
        .set('Authorization', `Bearer ${currentVersionToken}`)
        .expect(200);

      expect(response.body.user.sub).toBe(TEST_CONFIG.USER_ID_USER);
    });
  });

  describe('Ciclo completo de rotação', () => {
    it('deve completar ciclo de login -> refresh -> logout', async () => {
      // 1. Login
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200);

      const { access_token, refresh_token } = loginResponse.body;

      // 2. Usar access token
      await request(app)
        .get('/me')
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200);

      // 3. Renovar access token
      const refreshResponse = await request(app)
        .post('/auth/refresh')
        .send({ refresh_token })
        .expect(200);

      const newAccessToken = refreshResponse.body.access_token;

      // 4. Usar novo access token
      await request(app)
        .get('/me')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .expect(200);

      // 5. Logout
      await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .expect(200);

      // 6. Verificar que token foi revogado
      const response = await request(app)
        .get('/me')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .expect(401);

      expect(response.body.error).toBe('Token revogado');
    });

    it('deve invalidar refresh token após rotação', async () => {
      // 1. Login
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200);

      const { refresh_token } = loginResponse.body;

      // 2. Primeira rotação
      await request(app)
        .post('/auth/refresh')
        .send({ refresh_token })
        .expect(200);

      // 3. Tentar usar refresh token antigo
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refresh_token })
        .expect(401);

      expect(response.body.error).toBe('Refresh token inválido');
    });
  });

  describe('Segurança da rotação', () => {
    it('deve gerar jti único para cada token', async () => {
      const refreshToken = JWTTestHelper.createRefreshToken({
        sub: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'user',
      });

      const response1 = await request(app)
        .post('/auth/refresh')
        .send({ refresh_token: refreshToken })
        .expect(200);

      const response2 = await request(app)
        .post('/auth/refresh')
        .send({ refresh_token: refreshToken })
        .expect(200);

      const token1 = response1.body.access_token;
      const token2 = response2.body.access_token;

      const decoded1 = jwt.verify(token1, TEST_CONFIG.JWT_SECRET) as any;
      const decoded2 = jwt.verify(token2, TEST_CONFIG.JWT_SECRET) as any;

      expect(decoded1.jti).not.toBe(decoded2.jti);
      expect(decoded1.jti).toMatch(/^jti-/);
      expect(decoded2.jti).toMatch(/^jti-/);
    });

    it('deve manter segurança durante rotação', async () => {
      const refreshToken = JWTTestHelper.createRefreshToken({
        sub: TEST_CONFIG.USER_ID_USER,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'user',
      });

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refresh_token: refreshToken })
        .expect(200);

      const newToken = response.body.access_token;
      const decoded = jwt.verify(newToken, TEST_CONFIG.JWT_SECRET) as any;

      // Verificar que o token tem todas as informações de segurança
      expect(decoded.sub).toBeDefined();
      expect(decoded.empresa_id).toBeDefined();
      expect(decoded.role).toBeDefined();
      expect(decoded.jti).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });
  });
});

