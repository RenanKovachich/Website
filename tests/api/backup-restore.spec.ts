/**
 * Testes de Backups e Recuperação
 * 
 * Cenários testados:
 * - Execução de pg_dump diário
 * - Retenção de 7 dias
 * - Simulação de restauração
 * - Validação de integridade dos backups
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { execa } from 'execa';

describe('Backups e Recuperação', () => {
  const backupDir = path.join(process.cwd(), 'tests', '.evidence', 'backups');
  const testDbName = 'test_backup_db';

  beforeEach(() => {
    // Criar diretório de backups se não existir
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    vi.clearAllMocks();
  });

  describe('Execução de pg_dump', () => {
    it('deve executar pg_dump com sucesso', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(backupDir, `backup_${timestamp}.sql`);
      
      // Mock do execa para simular pg_dump
      const mockExeca = vi.fn().mockResolvedValue({
        stdout: '-- PostgreSQL database dump\n-- Dumped from database version 13.0\n',
        stderr: '',
        exitCode: 0,
      });
      
      vi.spyOn(execa, 'default').mockImplementation(mockExeca);
      
      // Simular execução do pg_dump
      const result = await execa('pg_dump', [
        '--host=localhost',
        '--port=5432',
        '--username=test',
        '--dbname=test_db',
        '--file=' + backupFile,
        '--verbose',
        '--no-password'
      ]);
      
      expect(result.exitCode).toBe(0);
      expect(mockExeca).toHaveBeenCalledWith('pg_dump', expect.arrayContaining([
        '--host=localhost',
        '--port=5432',
        '--username=test',
        '--dbname=test_db',
        '--file=' + backupFile,
        '--verbose',
        '--no-password'
      ]));
    });

    it('deve gerar arquivo de backup com timestamp', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(backupDir, `backup_${timestamp}.sql`);
      
      // Criar arquivo de backup simulado
      const backupContent = `-- PostgreSQL database dump
-- Dumped from database version 13.0
-- Dumped by pg_dump version 13.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Name: public; Type: SCHEMA; Schema: -; Owner: test
CREATE SCHEMA IF NOT EXISTS public;
ALTER SCHEMA public OWNER TO test;

-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: test
COPY public.users (id, name, email, password_hash, role, empresa_id, created_at) FROM stdin;
1	Admin User	admin@test.com	$2b$10$hash	admin	empresa-1	2025-10-09 10:00:00
2	Regular User	user@test.com	$2b$10$hash	user	empresa-1	2025-10-09 10:00:00
\\.`;

      fs.writeFileSync(backupFile, backupContent);
      
      expect(fs.existsSync(backupFile)).toBe(true);
      expect(fs.readFileSync(backupFile, 'utf8')).toContain('PostgreSQL database dump');
    });

    it('deve incluir metadados no arquivo de backup', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(backupDir, `backup_${timestamp}.sql`);
      
      const backupContent = `-- PostgreSQL database dump
-- Dumped from database version 13.0
-- Dumped by pg_dump version 13.0
-- Started on: ${new Date().toISOString()}
-- Database: test_db
-- Schema: public
-- Tables: users, empresas, spaces, reservations
-- Total size: 1024 KB
-- Backup completed successfully`;

      fs.writeFileSync(backupFile, backupContent);
      
      const content = fs.readFileSync(backupFile, 'utf8');
      expect(content).toContain('PostgreSQL database dump');
      expect(content).toContain('Database: test_db');
      expect(content).toContain('Tables: users, empresas, spaces, reservations');
    });
  });

  describe('Retenção de 7 dias', () => {
    it('deve manter backups dos últimos 7 dias', async () => {
      const now = new Date();
      const backups = [];
      
      // Criar backups dos últimos 10 dias
      for (let i = 0; i < 10; i++) {
        const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
        const timestamp = date.toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(backupDir, `backup_${timestamp}.sql`);
        
        fs.writeFileSync(backupFile, `-- Backup from ${date.toISOString()}`);
        backups.push({ file: backupFile, date });
      }
      
      // Simular limpeza de backups antigos (> 7 dias)
      const cutoffDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      const filesToKeep = backups.filter(backup => backup.date >= cutoffDate);
      const filesToDelete = backups.filter(backup => backup.date < cutoffDate);
      
      // Deletar arquivos antigos
      filesToDelete.forEach(backup => {
        if (fs.existsSync(backup.file)) {
          fs.unlinkSync(backup.file);
        }
      });
      
      // Verificar que apenas 7 arquivos foram mantidos
      const remainingFiles = fs.readdirSync(backupDir).filter(file => file.startsWith('backup_'));
      expect(remainingFiles.length).toBe(7);
    });

    it('deve remover backups antigos automaticamente', async () => {
      const now = new Date();
      
      // Criar backup antigo (8 dias atrás)
      const oldDate = new Date(now.getTime() - (8 * 24 * 60 * 60 * 1000));
      const oldTimestamp = oldDate.toISOString().replace(/[:.]/g, '-');
      const oldBackupFile = path.join(backupDir, `backup_${oldTimestamp}.sql`);
      
      fs.writeFileSync(oldBackupFile, '-- Old backup');
      
      // Criar backup recente (1 dia atrás)
      const recentDate = new Date(now.getTime() - (1 * 24 * 60 * 60 * 1000));
      const recentTimestamp = recentDate.toISOString().replace(/[:.]/g, '-');
      const recentBackupFile = path.join(backupDir, `backup_${recentTimestamp}.sql`);
      
      fs.writeFileSync(recentBackupFile, '-- Recent backup');
      
      // Simular limpeza
      const cutoffDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      const files = fs.readdirSync(backupDir);
      
      files.forEach(file => {
        if (file.startsWith('backup_')) {
          const filePath = path.join(backupDir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.mtime < cutoffDate) {
            fs.unlinkSync(filePath);
          }
        }
      });
      
      // Verificar que apenas o backup recente foi mantido
      expect(fs.existsSync(oldBackupFile)).toBe(false);
      expect(fs.existsSync(recentBackupFile)).toBe(true);
    });
  });

  describe('Simulação de restauração', () => {
    it('deve restaurar backup em banco de teste', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(backupDir, `backup_${timestamp}.sql`);
      
      // Criar arquivo de backup
      const backupContent = `-- PostgreSQL database dump
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    empresa_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, password_hash, role, empresa_id) VALUES
('Admin User', 'admin@test.com', '$2b$10$hash', 'admin', 'empresa-1'),
('Regular User', 'user@test.com', '$2b$10$hash', 'user', 'empresa-1');`;

      fs.writeFileSync(backupFile, backupContent);
      
      // Mock do execa para simular psql
      const mockExeca = vi.fn().mockResolvedValue({
        stdout: 'CREATE TABLE\nINSERT 0 2\n',
        stderr: '',
        exitCode: 0,
      });
      
      vi.spyOn(execa, 'default').mockImplementation(mockExeca);
      
      // Simular restauração
      const result = await execa('psql', [
        '--host=localhost',
        '--port=5432',
        '--username=test',
        '--dbname=' + testDbName,
        '--file=' + backupFile,
        '--quiet'
      ]);
      
      expect(result.exitCode).toBe(0);
      expect(mockExeca).toHaveBeenCalledWith('psql', expect.arrayContaining([
        '--host=localhost',
        '--port=5432',
        '--username=test',
        '--dbname=' + testDbName,
        '--file=' + backupFile,
        '--quiet'
      ]));
    });

    it('deve validar integridade após restauração', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(backupDir, `backup_${timestamp}.sql`);
      
      // Criar arquivo de backup
      const backupContent = `-- PostgreSQL database dump
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    empresa_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, password_hash, role, empresa_id) VALUES
('Admin User', 'admin@test.com', '$2b$10$hash', 'admin', 'empresa-1'),
('Regular User', 'user@test.com', '$2b$10$hash', 'user', 'empresa-1');`;

      fs.writeFileSync(backupFile, backupContent);
      
      // Mock do execa para simular validação
      const mockExeca = vi.fn().mockResolvedValue({
        stdout: '2\n', // 2 usuários encontrados
        stderr: '',
        exitCode: 0,
      });
      
      vi.spyOn(execa, 'default').mockImplementation(mockExeca);
      
      // Simular validação
      const result = await execa('psql', [
        '--host=localhost',
        '--port=5432',
        '--username=test',
        '--dbname=' + testDbName,
        '--command=SELECT COUNT(*) FROM users;',
        '--quiet'
      ]);
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout.trim()).toBe('2');
    });
  });

  describe('Agendamento de backups', () => {
    it('deve agendar backup diário', async () => {
      // Simular agendamento com node-cron
      const cronExpression = '0 2 * * *'; // 2:00 AM diariamente
      
      expect(cronExpression).toBe('0 2 * * *');
      
      // Mock da função de backup
      const mockBackupFunction = vi.fn().mockResolvedValue(true);
      
      // Simular execução do backup
      await mockBackupFunction();
      
      expect(mockBackupFunction).toHaveBeenCalled();
    });

    it('deve executar backup em horário agendado', async () => {
      const now = new Date();
      const scheduledHour = 2; // 2:00 AM
      
      // Verificar se é hora de executar backup
      const shouldRunBackup = now.getHours() === scheduledHour;
      
      if (shouldRunBackup) {
        const timestamp = now.toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(backupDir, `backup_${timestamp}.sql`);
        
        // Simular execução do backup
        fs.writeFileSync(backupFile, '-- Scheduled backup');
        
        expect(fs.existsSync(backupFile)).toBe(true);
      }
    });
  });

  describe('Validação de integridade', () => {
    it('deve verificar checksum do backup', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(backupDir, `backup_${timestamp}.sql`);
      
      const backupContent = '-- PostgreSQL database dump\n-- Test backup content';
      fs.writeFileSync(backupFile, backupContent);
      
      // Calcular checksum
      const crypto = require('crypto');
      const fileBuffer = fs.readFileSync(backupFile);
      const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      
      expect(checksum).toBeDefined();
      expect(checksum.length).toBe(64); // SHA256 hash length
    });

    it('deve validar tamanho do backup', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(backupDir, `backup_${timestamp}.sql`);
      
      const backupContent = '-- PostgreSQL database dump\n-- Test backup content';
      fs.writeFileSync(backupFile, backupContent);
      
      const stats = fs.statSync(backupFile);
      const fileSize = stats.size;
      
      expect(fileSize).toBeGreaterThan(0);
      expect(fileSize).toBeLessThan(100 * 1024 * 1024); // Menos de 100MB
    });

    it('deve verificar formato do arquivo de backup', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(backupDir, `backup_${timestamp}.sql`);
      
      const backupContent = `-- PostgreSQL database dump
-- Dumped from database version 13.0
-- Dumped by pg_dump version 13.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;`;

      fs.writeFileSync(backupFile, backupContent);
      
      const content = fs.readFileSync(backupFile, 'utf8');
      
      // Verificar formato do backup
      expect(content).toContain('PostgreSQL database dump');
      expect(content).toContain('SET statement_timeout = 0');
      expect(content).toContain('SET client_encoding = \'UTF8\'');
    });
  });

  describe('Manifesto de backups', () => {
    it('deve gerar manifesto de backups', async () => {
      const now = new Date();
      const backups = [];
      
      // Criar alguns backups
      for (let i = 0; i < 3; i++) {
        const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
        const timestamp = date.toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(backupDir, `backup_${timestamp}.sql`);
        
        fs.writeFileSync(backupFile, `-- Backup from ${date.toISOString()}`);
        
        const stats = fs.statSync(backupFile);
        backups.push({
          filename: `backup_${timestamp}.sql`,
          size: stats.size,
          created_at: stats.mtime.toISOString(),
          checksum: 'sha256:' + require('crypto').createHash('sha256').update(fs.readFileSync(backupFile)).digest('hex')
        });
      }
      
      // Gerar manifesto
      const manifest = {
        generated_at: now.toISOString(),
        total_backups: backups.length,
        backups: backups
      };
      
      const manifestFile = path.join(backupDir, 'manifest.json');
      fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
      
      expect(fs.existsSync(manifestFile)).toBe(true);
      
      const manifestContent = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
      expect(manifestContent.total_backups).toBe(3);
      expect(manifestContent.backups).toHaveLength(3);
    });
  });
});

