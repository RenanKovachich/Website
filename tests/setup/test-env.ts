import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Redis } from 'ioredis';
import RedisMock from 'ioredis-mock';

// Mock do Redis para testes
const redisMock = new RedisMock();

// Configurações de teste
export const TEST_CONFIG = {
  JWT_SECRET: 'test-secret-key-for-security-tests',
  JWT_ACCESS_EXPIRES_IN: '15m',
  JWT_REFRESH_EXPIRES_IN: '7d',
  BCRYPT_SALT_ROUNDS: 10,
  RATE_LIMIT_WINDOW_MS: 60000, // 1 minuto
  RATE_LIMIT_MAX_REQUESTS: 5,
  EMPRESA_ID_1: 'empresa-1',
  EMPRESA_ID_2: 'empresa-2',
  USER_ID_ADMIN: 'user-admin-1',
  USER_ID_USER: 'user-normal-1',
};

// Helpers para criação de tokens JWT
export class JWTTestHelper {
  static createAccessToken(payload: {
    sub: string;
    empresa_id: string;
    role: 'admin' | 'user';
    jti?: string;
  }): string {
    const jti = payload.jti || uuidv4();
    return jwt.sign(
      {
        sub: payload.sub,
        empresa_id: payload.empresa_id,
        role: payload.role,
        jti,
        iat: Math.floor(Date.now() / 1000),
      },
      TEST_CONFIG.JWT_SECRET,
      { expiresIn: TEST_CONFIG.JWT_ACCESS_EXPIRES_IN }
    );
  }

  static createRefreshToken(payload: {
    sub: string;
    empresa_id: string;
    role: 'admin' | 'user';
    jti?: string;
  }): string {
    const jti = payload.jti || uuidv4();
    return jwt.sign(
      {
        sub: payload.sub,
        empresa_id: payload.empresa_id,
        role: payload.role,
        jti,
        iat: Math.floor(Date.now() / 1000),
      },
      TEST_CONFIG.JWT_SECRET,
      { expiresIn: TEST_CONFIG.JWT_REFRESH_EXPIRES_IN }
    );
  }

  static createExpiredToken(payload: {
    sub: string;
    empresa_id: string;
    role: 'admin' | 'user';
    jti?: string;
  }): string {
    const jti = payload.jti || uuidv4();
    return jwt.sign(
      {
        sub: payload.sub,
        empresa_id: payload.empresa_id,
        role: payload.role,
        jti,
        iat: Math.floor(Date.now() / 1000) - 3600, // 1 hora atrás
        exp: Math.floor(Date.now() / 1000) - 1800, // 30 minutos atrás
      },
      TEST_CONFIG.JWT_SECRET
    );
  }
}

// Helper para hash de senhas
export class PasswordTestHelper {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, TEST_CONFIG.BCRYPT_SALT_ROUNDS);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

// Helper para Redis (blacklist)
export class RedisTestHelper {
  static async addToBlacklist(jti: string, expiresIn: number): Promise<void> {
    await redisMock.setex(`blacklist:${jti}`, expiresIn, '1');
  }

  static async isBlacklisted(jti: string): Promise<boolean> {
    const result = await redisMock.get(`blacklist:${jti}`);
    return result === '1';
  }

  static async clearBlacklist(): Promise<void> {
    const keys = await redisMock.keys('blacklist:*');
    if (keys.length > 0) {
      await redisMock.del(...keys);
    }
  }
}

// Dados de teste
export const TEST_DATA = {
  users: [
    {
      id: TEST_CONFIG.USER_ID_ADMIN,
      name: 'Admin Test',
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin' as const,
      empresa_id: TEST_CONFIG.EMPRESA_ID_1,
    },
    {
      id: TEST_CONFIG.USER_ID_USER,
      name: 'User Test',
      email: 'user@test.com',
      password: 'user123',
      role: 'user' as const,
      empresa_id: TEST_CONFIG.EMPRESA_ID_1,
    },
    {
      id: 'user-empresa-2',
      name: 'User Empresa 2',
      email: 'user2@test.com',
      password: 'user123',
      role: 'user' as const,
      empresa_id: TEST_CONFIG.EMPRESA_ID_2,
    },
  ],
  empresas: [
    {
      id: TEST_CONFIG.EMPRESA_ID_1,
      nome: 'Empresa Test 1',
      cnpj: '12.345.678/0001-90',
      email: 'contato@empresa1.com',
      telefone: '(11) 99999-9999',
    },
    {
      id: TEST_CONFIG.EMPRESA_ID_2,
      nome: 'Empresa Test 2',
      cnpj: '98.765.432/0001-10',
      email: 'contato@empresa2.com',
      telefone: '(11) 88888-8888',
    },
  ],
  spaces: [
    {
      id: 'space-1',
      name: 'Sala de Reunião 1',
      type: 'sala_reuniao' as const,
      capacity: 10,
      empresa_id: TEST_CONFIG.EMPRESA_ID_1,
    },
    {
      id: 'space-2',
      name: 'Auditório',
      type: 'auditorio' as const,
      capacity: 50,
      empresa_id: TEST_CONFIG.EMPRESA_ID_1,
    },
    {
      id: 'space-3',
      name: 'Sala Empresa 2',
      type: 'sala_reuniao' as const,
      capacity: 8,
      empresa_id: TEST_CONFIG.EMPRESA_ID_2,
    },
  ],
};

// Setup global dos testes
beforeAll(async () => {
  // Configurar variáveis de ambiente para testes
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = TEST_CONFIG.JWT_SECRET;
  process.env.JWT_ACCESS_EXPIRES_IN = TEST_CONFIG.JWT_ACCESS_EXPIRES_IN;
  process.env.JWT_REFRESH_EXPIRES_IN = TEST_CONFIG.JWT_REFRESH_EXPIRES_IN;
  process.env.REDIS_URL = 'redis://localhost:6379';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
  process.env.ALLOWED_ORIGINS = 'http://localhost:3000,https://yourdomain.com';
  
  // Limpar blacklist antes dos testes
  await RedisTestHelper.clearBlacklist();
});

beforeEach(async () => {
  // Limpar blacklist antes de cada teste
  await RedisTestHelper.clearBlacklist();
});

afterEach(async () => {
  // Limpar blacklist após cada teste
  await RedisTestHelper.clearBlacklist();
});

afterAll(async () => {
  // Limpar recursos
  await redisMock.quit();
});

// Exportar instância do Redis mock para uso nos testes
export { redisMock };
