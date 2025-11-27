/**
 * Testes de Criptografia de Credenciais
 * 
 * Cenários testados:
 * - Hash de senhas com bcrypt
 * - Verificação de senhas
 * - Senhas nunca armazenadas em texto claro
 * - Salt rounds adequados
 */

import { describe, it, expect, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import { PasswordTestHelper, TEST_CONFIG } from '../setup/test-env';

describe('Criptografia de Credenciais', () => {
  beforeEach(() => {
    // Limpar mocks antes de cada teste
  });

  describe('Hash de senhas', () => {
    it('deve gerar hash diferente para a mesma senha', async () => {
      const password = 'senha123';
      
      const hash1 = await PasswordTestHelper.hashPassword(password);
      const hash2 = await PasswordTestHelper.hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
      expect(hash1).not.toBe(password);
      expect(hash2).not.toBe(password);
    });

    it('deve gerar hash com salt rounds adequados', async () => {
      const password = 'senha123';
      const hash = await PasswordTestHelper.hashPassword(password);
      
      // Verificar se o hash contém o salt rounds correto
      const saltRounds = hash.split('$')[2];
      expect(parseInt(saltRounds)).toBeGreaterThanOrEqual(TEST_CONFIG.BCRYPT_SALT_ROUNDS);
    });

    it('deve gerar hash com formato bcrypt válido', async () => {
      const password = 'senha123';
      const hash = await PasswordTestHelper.hashPassword(password);
      
      // Verificar formato bcrypt: $2b$10$...
      expect(hash).toMatch(/^\$2[ab]\$\d{2}\$.{53}$/);
    });

    it('deve gerar hash de tamanho adequado', async () => {
      const password = 'senha123';
      const hash = await PasswordTestHelper.hashPassword(password);
      
      // Hash bcrypt deve ter 60 caracteres
      expect(hash.length).toBe(60);
    });
  });

  describe('Verificação de senhas', () => {
    it('deve verificar senha correta como válida', async () => {
      const password = 'senha123';
      const hash = await PasswordTestHelper.hashPassword(password);
      
      const isValid = await PasswordTestHelper.verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('deve verificar senha incorreta como inválida', async () => {
      const password = 'senha123';
      const wrongPassword = 'senha456';
      const hash = await PasswordTestHelper.hashPassword(password);
      
      const isValid = await PasswordTestHelper.verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it('deve verificar senha vazia como inválida', async () => {
      const password = 'senha123';
      const emptyPassword = '';
      const hash = await PasswordTestHelper.hashPassword(password);
      
      const isValid = await PasswordTestHelper.verifyPassword(emptyPassword, hash);
      expect(isValid).toBe(false);
    });

    it('deve verificar hash inválido como inválido', async () => {
      const password = 'senha123';
      const invalidHash = 'invalid-hash';
      
      const isValid = await PasswordTestHelper.verifyPassword(password, invalidHash);
      expect(isValid).toBe(false);
    });
  });

  describe('Segurança do hash', () => {
    it('deve usar salt rounds mínimo de 10', async () => {
      const password = 'senha123';
      const hash = await PasswordTestHelper.hashPassword(password);
      
      const saltRounds = parseInt(hash.split('$')[2]);
      expect(saltRounds).toBeGreaterThanOrEqual(10);
    });

    it('deve gerar salt único para cada hash', async () => {
      const password = 'senha123';
      
      const hash1 = await PasswordTestHelper.hashPassword(password);
      const hash2 = await PasswordTestHelper.hashPassword(password);
      
      // Extrair salt de cada hash
      const salt1 = hash1.substring(0, 29);
      const salt2 = hash2.substring(0, 29);
      
      expect(salt1).not.toBe(salt2);
    });

    it('deve resistir a ataques de timing', async () => {
      const password = 'senha123';
      const hash = await PasswordTestHelper.hashPassword(password);
      
      const startTime = Date.now();
      await PasswordTestHelper.verifyPassword('senha456', hash);
      const wrongPasswordTime = Date.now() - startTime;
      
      const startTime2 = Date.now();
      await PasswordTestHelper.verifyPassword('senha123', hash);
      const correctPasswordTime = Date.now() - startTime2;
      
      // Os tempos devem ser similares (diferença < 100ms)
      expect(Math.abs(wrongPasswordTime - correctPasswordTime)).toBeLessThan(100);
    });
  });

  describe('Dados de teste', () => {
    it('deve hash senhas de usuários de teste', async () => {
      const testPasswords = [
        'admin123',
        'user123',
        'password123',
        'senha@123',
        'MinhaSenh@123',
      ];

      for (const password of testPasswords) {
        const hash = await PasswordTestHelper.hashPassword(password);
        
        expect(hash).toBeDefined();
        expect(hash).not.toBe(password);
        expect(hash.length).toBe(60);
        
        // Verificar se a senha original é válida
        const isValid = await PasswordTestHelper.verifyPassword(password, hash);
        expect(isValid).toBe(true);
      }
    });

    it('deve verificar senhas de usuários de teste', async () => {
      const testCases = [
        { password: 'admin123', hash: '$2b$10$YCNEwdBIKz8DFpcBuiUeuOwYf1e9GRE3EjDLQrDCXGrhzdlSbVNoi' },
        { password: 'user123', hash: '$2b$10$0ZQQghb4Qn2LJky4pkqP.O6hzHHMbqufuRkAqGBqzJN6Nt2ds5EEu' },
      ];

      for (const testCase of testCases) {
        const isValid = await PasswordTestHelper.verifyPassword(testCase.password, testCase.hash);
        expect(isValid).toBe(true);
      }
    });
  });

  describe('Performance do hash', () => {
    it('deve gerar hash em tempo razoável', async () => {
      const password = 'senha123';
      
      const startTime = Date.now();
      await PasswordTestHelper.hashPassword(password);
      const hashTime = Date.now() - startTime;
      
      // Hash deve ser gerado em menos de 1 segundo
      expect(hashTime).toBeLessThan(1000);
    });

    it('deve verificar senha em tempo razoável', async () => {
      const password = 'senha123';
      const hash = await PasswordTestHelper.hashPassword(password);
      
      const startTime = Date.now();
      await PasswordTestHelper.verifyPassword(password, hash);
      const verifyTime = Date.now() - startTime;
      
      // Verificação deve ser feita em menos de 1 segundo
      expect(verifyTime).toBeLessThan(1000);
    });
  });

  describe('Compatibilidade', () => {
    it('deve ser compatível com bcrypt padrão', async () => {
      const password = 'senha123';
      const hash = await PasswordTestHelper.hashPassword(password);
      
      // Verificar se o hash é compatível com bcrypt nativo
      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);
    });

    it('deve aceitar hashes gerados por bcrypt nativo', async () => {
      const password = 'senha123';
      const nativeHash = await bcrypt.hash(password, TEST_CONFIG.BCRYPT_SALT_ROUNDS);
      
      const isValid = await PasswordTestHelper.verifyPassword(password, nativeHash);
      expect(isValid).toBe(true);
    });
  });

  describe('Casos extremos', () => {
    it('deve lidar com senhas muito longas', async () => {
      const longPassword = 'a'.repeat(1000);
      
      const hash = await PasswordTestHelper.hashPassword(longPassword);
      expect(hash).toBeDefined();
      expect(hash.length).toBe(60);
      
      const isValid = await PasswordTestHelper.verifyPassword(longPassword, hash);
      expect(isValid).toBe(true);
    });

    it('deve lidar com senhas com caracteres especiais', async () => {
      const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      
      const hash = await PasswordTestHelper.hashPassword(specialPassword);
      expect(hash).toBeDefined();
      
      const isValid = await PasswordTestHelper.verifyPassword(specialPassword, hash);
      expect(isValid).toBe(true);
    });

    it('deve lidar com senhas unicode', async () => {
      const unicodePassword = 'senha123çãéíóú';
      
      const hash = await PasswordTestHelper.hashPassword(unicodePassword);
      expect(hash).toBeDefined();
      
      const isValid = await PasswordTestHelper.verifyPassword(unicodePassword, hash);
      expect(isValid).toBe(true);
    });
  });
});

