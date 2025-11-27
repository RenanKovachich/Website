/**
 * Testes E2E - CORS
 * 
 * Cenários testados:
 * - Origin permitido
 * - Origin não permitido
 * - Preflight OPTIONS
 * - Headers CORS corretos
 * - Métodos permitidos
 */

import { test, expect } from '@playwright/test';

test.describe('CORS Configuration', () => {
  test('deve permitir origin da allowlist', async ({ page }) => {
    const response = await page.goto('http://localhost:3000');
    
    const headers = await response?.allHeaders();
    
    // Verificar headers CORS
    expect(headers?.['access-control-allow-origin']).toBeDefined();
    expect(headers?.['access-control-allow-credentials']).toBe('true');
  });

  test('deve incluir Access-Control-Allow-Methods', async ({ page }) => {
    const response = await page.goto('http://localhost:3000');
    
    const headers = await response?.allHeaders();
    
    expect(headers?.['access-control-allow-methods']).toBeDefined();
    expect(headers?.['access-control-allow-methods']).toContain('GET');
    expect(headers?.['access-control-allow-methods']).toContain('POST');
    expect(headers?.['access-control-allow-methods']).toContain('PUT');
    expect(headers?.['access-control-allow-methods']).toContain('DELETE');
    expect(headers?.['access-control-allow-methods']).toContain('OPTIONS');
  });

  test('deve incluir Access-Control-Allow-Headers', async ({ page }) => {
    const response = await page.goto('http://localhost:3000');
    
    const headers = await response?.allHeaders();
    
    expect(headers?.['access-control-allow-headers']).toBeDefined();
    expect(headers?.['access-control-allow-headers']).toContain('Content-Type');
    expect(headers?.['access-control-allow-headers']).toContain('Authorization');
  });

  test('deve incluir Access-Control-Max-Age', async ({ page }) => {
    const response = await page.goto('http://localhost:3000');
    
    const headers = await response?.allHeaders();
    
    expect(headers?.['access-control-max-age']).toBeDefined();
    expect(parseInt(headers?.['access-control-max-age'])).toBeGreaterThan(0);
  });

  test('deve responder a preflight OPTIONS', async ({ page }) => {
    const response = await page.request.options('http://localhost:3000/api/auth/login');
    
    expect(response.status()).toBe(200);
    
    const headers = await response.allHeaders();
    expect(headers?.['access-control-allow-origin']).toBeDefined();
    expect(headers?.['access-control-allow-methods']).toBeDefined();
    expect(headers?.['access-control-allow-headers']).toBeDefined();
  });

  test('deve bloquear origin não permitido', async ({ page }) => {
    // Simular requisição de origin não permitido
    const response = await page.request.get('http://localhost:3000', {
      headers: {
        'Origin': 'https://malicious-site.com'
      }
    });
    
    const headers = await response.allHeaders();
    
    // Origin não permitido não deve ter Access-Control-Allow-Origin
    expect(headers?.['access-control-allow-origin']).toBeUndefined();
  });

  test('deve permitir origin localhost', async ({ page }) => {
    const response = await page.request.get('http://localhost:3000', {
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });
    
    const headers = await response.allHeaders();
    
    expect(headers?.['access-control-allow-origin']).toBe('http://localhost:3000');
  });

  test('deve permitir origin de produção', async ({ page }) => {
    const response = await page.request.get('http://localhost:3000', {
      headers: {
        'Origin': 'https://yourdomain.com'
      }
    });
    
    const headers = await response.allHeaders();
    
    expect(headers?.['access-control-allow-origin']).toBe('https://yourdomain.com');
  });

  test('deve incluir Access-Control-Expose-Headers', async ({ page }) => {
    const response = await page.goto('http://localhost:3000');
    
    const headers = await response?.allHeaders();
    
    expect(headers?.['access-control-expose-headers']).toBeDefined();
    expect(headers?.['access-control-expose-headers']).toContain('X-Total-Count');
    expect(headers?.['access-control-expose-headers']).toContain('X-Page-Count');
  });

  test('deve validar CORS em requisições POST', async ({ page }) => {
    const response = await page.request.post('http://localhost:3000/api/auth/login', {
      data: {
        email: 'test@example.com',
        password: 'password123'
      },
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      }
    });
    
    const headers = await response.allHeaders();
    
    expect(headers?.['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(headers?.['access-control-allow-credentials']).toBe('true');
  });

  test('deve validar CORS em requisições PUT', async ({ page }) => {
    const response = await page.request.put('http://localhost:3000/api/reservas/1', {
      data: {
        description: 'Updated reservation'
      },
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
        'Authorization': 'Bearer test-token'
      }
    });
    
    const headers = await response.allHeaders();
    
    expect(headers?.['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(headers?.['access-control-allow-credentials']).toBe('true');
  });

  test('deve validar CORS em requisições DELETE', async ({ page }) => {
    const response = await page.request.delete('http://localhost:3000/api/reservas/1', {
      headers: {
        'Origin': 'http://localhost:3000',
        'Authorization': 'Bearer test-token'
      }
    });
    
    const headers = await response.allHeaders();
    
    expect(headers?.['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(headers?.['access-control-allow-credentials']).toBe('true');
  });

  test('deve capturar evidências de CORS', async ({ page }) => {
    const response = await page.goto('http://localhost:3000');
    
    const headers = await response?.allHeaders();
    
    // Salvar evidências
    const evidence = {
      timestamp: new Date().toISOString(),
      url: response?.url(),
      status: response?.status(),
      cors_headers: {
        'access-control-allow-origin': headers?.['access-control-allow-origin'],
        'access-control-allow-methods': headers?.['access-control-allow-methods'],
        'access-control-allow-headers': headers?.['access-control-allow-headers'],
        'access-control-allow-credentials': headers?.['access-control-allow-credentials'],
        'access-control-max-age': headers?.['access-control-max-age'],
        'access-control-expose-headers': headers?.['access-control-expose-headers']
      }
    };
    
    // Salvar em arquivo de evidências
    const fs = require('fs');
    const path = require('path');
    const evidenceDir = path.join(process.cwd(), 'tests', '.evidence', 'logs');
    
    if (!fs.existsSync(evidenceDir)) {
      fs.mkdirSync(evidenceDir, { recursive: true });
    }
    
    const evidenceFile = path.join(evidenceDir, 'cors-headers.json');
    fs.writeFileSync(evidenceFile, JSON.stringify(evidence, null, 2));
    
    expect(fs.existsSync(evidenceFile)).toBe(true);
  });

  test('deve validar todos os headers CORS obrigatórios', async ({ page }) => {
    const response = await page.goto('http://localhost:3000');
    
    const headers = await response?.allHeaders();
    
    // Lista de headers CORS obrigatórios
    const requiredCorsHeaders = [
      'access-control-allow-origin',
      'access-control-allow-methods',
      'access-control-allow-headers',
      'access-control-allow-credentials',
      'access-control-max-age',
      'access-control-expose-headers'
    ];
    
    // Verificar se todos os headers estão presentes
    requiredCorsHeaders.forEach(header => {
      expect(headers?.[header]).toBeDefined();
    });
  });

  test('deve validar valores corretos dos headers CORS', async ({ page }) => {
    const response = await page.goto('http://localhost:3000');
    
    const headers = await response?.allHeaders();
    
    // Verificar valores específicos
    expect(headers?.['access-control-allow-credentials']).toBe('true');
    expect(headers?.['access-control-allow-methods']).toContain('GET');
    expect(headers?.['access-control-allow-methods']).toContain('POST');
    expect(headers?.['access-control-allow-methods']).toContain('PUT');
    expect(headers?.['access-control-allow-methods']).toContain('DELETE');
    expect(headers?.['access-control-allow-methods']).toContain('OPTIONS');
    expect(headers?.['access-control-allow-headers']).toContain('Content-Type');
    expect(headers?.['access-control-allow-headers']).toContain('Authorization');
    expect(parseInt(headers?.['access-control-max-age'])).toBeGreaterThan(0);
  });

  test('deve capturar screenshot da página com CORS', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Capturar screenshot
    const screenshot = await page.screenshot({ fullPage: true });
    
    // Salvar screenshot
    const fs = require('fs');
    const path = require('path');
    const screenshotsDir = path.join(process.cwd(), 'tests', '.evidence', 'screenshots');
    
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    const screenshotFile = path.join(screenshotsDir, 'cors-test.png');
    fs.writeFileSync(screenshotFile, screenshot);
    
    expect(fs.existsSync(screenshotFile)).toBe(true);
  });
});

