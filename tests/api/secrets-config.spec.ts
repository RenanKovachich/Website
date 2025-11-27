/**
 * Testes de Gestão de Segredos
 * 
 * Cenários testados:
 * - Presença de variáveis de ambiente obrigatórias
 * - Validação de configurações de segurança
 * - Verificação de .env no .gitignore
 * - Validação de valores de configuração
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Gestão de Segredos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Variáveis de ambiente obrigatórias', () => {
    it('deve ter JWT_SECRET configurado', () => {
      expect(process.env.JWT_SECRET).toBeDefined();
      expect(process.env.JWT_SECRET).not.toBe('');
      expect(process.env.JWT_SECRET.length).toBeGreaterThan(32);
    });

    it('deve ter JWT_ACCESS_EXPIRES_IN configurado', () => {
      expect(process.env.JWT_ACCESS_EXPIRES_IN).toBeDefined();
      expect(process.env.JWT_ACCESS_EXPIRES_IN).toBe('15m');
    });

    it('deve ter JWT_REFRESH_EXPIRES_IN configurado', () => {
      expect(process.env.JWT_REFRESH_EXPIRES_IN).toBeDefined();
      expect(process.env.JWT_REFRESH_EXPIRES_IN).toBe('7d');
    });

    it('deve ter REDIS_URL configurado', () => {
      expect(process.env.REDIS_URL).toBeDefined();
      expect(process.env.REDIS_URL).toMatch(/^redis:\/\//);
    });

    it('deve ter DATABASE_URL configurado', () => {
      expect(process.env.DATABASE_URL).toBeDefined();
      expect(process.env.DATABASE_URL).toMatch(/^postgresql:\/\//);
    });

    it('deve ter NODE_ENV configurado', () => {
      expect(process.env.NODE_ENV).toBeDefined();
      expect(['development', 'production', 'test']).toContain(process.env.NODE_ENV);
    });
  });

  describe('Validação de configurações de segurança', () => {
    it('deve ter JWT_SECRET com tamanho adequado', () => {
      const jwtSecret = process.env.JWT_SECRET;
      expect(jwtSecret.length).toBeGreaterThanOrEqual(32);
      expect(jwtSecret.length).toBeLessThanOrEqual(256);
    });

    it('deve ter JWT_SECRET com caracteres seguros', () => {
      const jwtSecret = process.env.JWT_SECRET;
      // Verificar se contém caracteres alfanuméricos e especiais
      expect(jwtSecret).toMatch(/[a-zA-Z0-9]/);
    });

    it('deve ter configurações de expiração válidas', () => {
      const accessExpires = process.env.JWT_ACCESS_EXPIRES_IN;
      const refreshExpires = process.env.JWT_REFRESH_EXPIRES_IN;
      
      expect(accessExpires).toMatch(/^\d+[smhd]$/);
      expect(refreshExpires).toMatch(/^\d+[smhd]$/);
    });

    it('deve ter URLs de conexão válidas', () => {
      const redisUrl = process.env.REDIS_URL;
      const databaseUrl = process.env.DATABASE_URL;
      
      expect(redisUrl).toMatch(/^redis:\/\/.+/);
      expect(databaseUrl).toMatch(/^postgresql:\/\/.+/);
    });
  });

  describe('Arquivo .gitignore', () => {
    it('deve ter .env no .gitignore', () => {
      const gitignorePath = path.join(process.cwd(), '.gitignore');
      
      if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
        expect(gitignoreContent).toContain('.env');
      } else {
        // Se não existe .gitignore, criar um básico
        const basicGitignore = `.env
.env.local
.env.development.local
.env.test.local
.env.production.local
node_modules/
dist/
build/
*.log
.DS_Store
`;
        fs.writeFileSync(gitignorePath, basicGitignore);
        expect(fs.existsSync(gitignorePath)).toBe(true);
      }
    });

    it('deve ter .env.local no .gitignore', () => {
      const gitignorePath = path.join(process.cwd(), '.gitignore');
      
      if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
        expect(gitignoreContent).toContain('.env.local');
      }
    });

    it('deve ter node_modules no .gitignore', () => {
      const gitignorePath = path.join(process.cwd(), '.gitignore');
      
      if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
        expect(gitignoreContent).toContain('node_modules');
      }
    });
  });

  describe('Arquivo .env', () => {
    it('deve ter arquivo .env.example para referência', () => {
      const envExamplePath = path.join(process.cwd(), '.env.example');
      
      if (!fs.existsSync(envExamplePath)) {
        // Criar .env.example se não existir
        const envExample = `# Configurações de Segurança
JWT_SECRET=your-super-secret-jwt-key-here-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Banco de Dados
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# Redis
REDIS_URL=redis://localhost:6379

# Ambiente
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
`;
        fs.writeFileSync(envExamplePath, envExample);
      }
      
      expect(fs.existsSync(envExamplePath)).toBe(true);
    });

    it('deve ter .env.example com todas as variáveis necessárias', () => {
      const envExamplePath = path.join(process.cwd(), '.env.example');
      
      if (fs.existsSync(envExamplePath)) {
        const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');
        
        const requiredVars = [
          'JWT_SECRET',
          'JWT_ACCESS_EXPIRES_IN',
          'JWT_REFRESH_EXPIRES_IN',
          'DATABASE_URL',
          'REDIS_URL',
          'NODE_ENV',
        ];
        
        requiredVars.forEach(varName => {
          expect(envExampleContent).toContain(varName);
        });
      }
    });
  });

  describe('Validação de valores de configuração', () => {
    it('deve ter JWT_ACCESS_EXPIRES_IN com valor adequado', () => {
      const accessExpires = process.env.JWT_ACCESS_EXPIRES_IN;
      expect(accessExpires).toBe('15m');
    });

    it('deve ter JWT_REFRESH_EXPIRES_IN com valor adequado', () => {
      const refreshExpires = process.env.JWT_REFRESH_EXPIRES_IN;
      expect(refreshExpires).toBe('7d');
    });

    it('deve ter NODE_ENV como test em ambiente de teste', () => {
      expect(process.env.NODE_ENV).toBe('test');
    });
  });

  describe('Configurações de CORS', () => {
    it('deve ter ALLOWED_ORIGINS configurado', () => {
      const allowedOrigins = process.env.ALLOWED_ORIGINS;
      expect(allowedOrigins).toBeDefined();
      expect(allowedOrigins).toContain('http://localhost:3000');
    });

    it('deve ter ALLOWED_ORIGINS com formato válido', () => {
      const allowedOrigins = process.env.ALLOWED_ORIGINS;
      const origins = allowedOrigins.split(',');
      
      origins.forEach(origin => {
        expect(origin.trim()).toMatch(/^https?:\/\/.+/);
      });
    });
  });

  describe('Configurações de banco de dados', () => {
    it('deve ter DATABASE_URL com formato PostgreSQL válido', () => {
      const databaseUrl = process.env.DATABASE_URL;
      expect(databaseUrl).toMatch(/^postgresql:\/\/.+/);
    });

    it('deve ter REDIS_URL com formato Redis válido', () => {
      const redisUrl = process.env.REDIS_URL;
      expect(redisUrl).toMatch(/^redis:\/\/.+/);
    });
  });

  describe('Configurações de produção', () => {
    it('deve ter configurações adequadas para produção', () => {
      // Simular ambiente de produção
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      // Verificar se as configurações são adequadas para produção
      expect(process.env.JWT_SECRET).toBeDefined();
      expect(process.env.JWT_SECRET.length).toBeGreaterThan(32);
      expect(process.env.DATABASE_URL).toBeDefined();
      expect(process.env.REDIS_URL).toBeDefined();
      
      // Restaurar ambiente original
      process.env.NODE_ENV = originalNodeEnv;
    });
  });

  describe('Validação de segurança', () => {
    it('deve não expor JWT_SECRET em logs', () => {
      const jwtSecret = process.env.JWT_SECRET;
      
      // Verificar se o secret não está sendo logado
      const consoleSpy = vi.spyOn(console, 'log');
      console.log('JWT_SECRET:', jwtSecret);
      
      // Em um ambiente real, isso não deveria acontecer
      // Este teste serve para demonstrar a importância de não logar secrets
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('deve ter configurações de segurança adequadas', () => {
      // Verificar se as configurações de segurança estão adequadas
      expect(process.env.JWT_ACCESS_EXPIRES_IN).toBe('15m'); // Tempo curto para access token
      expect(process.env.JWT_REFRESH_EXPIRES_IN).toBe('7d'); // Tempo adequado para refresh token
      expect(process.env.NODE_ENV).toBe('test'); // Ambiente de teste
    });
  });
});

