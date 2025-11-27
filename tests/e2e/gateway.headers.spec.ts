/**
 * Testes E2E - Security Headers
 * 
 * Cenários testados:
 * - X-Content-Type-Options: nosniff
 * - X-Frame-Options: SAMEORIGIN
 * - Referrer-Policy: strict-origin-when-cross-origin
 * - Strict-Transport-Security (HTTPS)
 * - X-XSS-Protection
 * - Content-Security-Policy
 */

import { test, expect } from '@playwright/test';

test.describe('Security Headers', () => {
  test('deve incluir X-Content-Type-Options: nosniff', async ({ page }) => {
    const response = await page.goto('http://localhost:3000');
    
    const headers = await response?.allHeaders();
    expect(headers?.['x-content-type-options']).toBe('nosniff');
  });

  test('deve incluir X-Frame-Options: SAMEORIGIN', async ({ page }) => {
    const response = await page.goto('http://localhost:3000');
    
    const headers = await response?.allHeaders();
    expect(headers?.['x-frame-options']).toBe('SAMEORIGIN');
  });

  test('deve incluir Referrer-Policy: strict-origin-when-cross-origin', async ({ page }) => {
    const response = await page.goto('http://localhost:3000');
    
    const headers = await response?.allHeaders();
    expect(headers?.['referrer-policy']).toBe('strict-origin-when-cross-origin');
  });

  test('deve incluir X-XSS-Protection', async ({ page }) => {
    const response = await page.goto('http://localhost:3000');
    
    const headers = await response?.allHeaders();
    expect(headers?.['x-xss-protection']).toBe('1; mode=block');
  });

  test('deve incluir Content-Security-Policy', async ({ page }) => {
    const response = await page.goto('http://localhost:3000');
    
    const headers = await response?.allHeaders();
    expect(headers?.['content-security-policy']).toBeDefined();
    expect(headers?.['content-security-policy']).toContain('default-src');
  });

  test('deve incluir Strict-Transport-Security em HTTPS', async ({ page }) => {
    // Simular requisição HTTPS
    const response = await page.goto('https://localhost:3000');
    
    const headers = await response?.allHeaders();
    expect(headers?.['strict-transport-security']).toBeDefined();
    expect(headers?.['strict-transport-security']).toContain('max-age');
  });

  test('deve incluir X-Permitted-Cross-Domain-Policies', async ({ page }) => {
    const response = await page.goto('http://localhost:3000');
    
    const headers = await response?.allHeaders();
    expect(headers?.['x-permitted-cross-domain-policies']).toBe('none');
  });

  test('deve incluir X-Download-Options', async ({ page }) => {
    const response = await page.goto('http://localhost:3000');
    
    const headers = await response?.allHeaders();
    expect(headers?.['x-download-options']).toBe('noopen');
  });

  test('deve incluir X-DNS-Prefetch-Control', async ({ page }) => {
    const response = await page.goto('http://localhost:3000');
    
    const headers = await response?.allHeaders();
    expect(headers?.['x-dns-prefetch-control']).toBe('off');
  });

  test('deve incluir Expect-CT', async ({ page }) => {
    const response = await page.goto('http://localhost:3000');
    
    const headers = await response?.allHeaders();
    expect(headers?.['expect-ct']).toBeDefined();
  });

  test('deve capturar evidências dos headers', async ({ page }) => {
    const response = await page.goto('http://localhost:3000');
    
    const headers = await response?.allHeaders();
    
    // Salvar evidências
    const evidence = {
      timestamp: new Date().toISOString(),
      url: response?.url(),
      status: response?.status(),
      headers: headers
    };
    
    // Salvar em arquivo de evidências
    const fs = require('fs');
    const path = require('path');
    const evidenceDir = path.join(process.cwd(), 'tests', '.evidence', 'logs');
    
    if (!fs.existsSync(evidenceDir)) {
      fs.mkdirSync(evidenceDir, { recursive: true });
    }
    
    const evidenceFile = path.join(evidenceDir, 'security-headers.json');
    fs.writeFileSync(evidenceFile, JSON.stringify(evidence, null, 2));
    
    expect(fs.existsSync(evidenceFile)).toBe(true);
  });

  test('deve validar todos os headers de segurança', async ({ page }) => {
    const response = await page.goto('http://localhost:3000');
    
    const headers = await response?.allHeaders();
    
    // Lista de headers de segurança obrigatórios
    const requiredSecurityHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'referrer-policy',
      'x-xss-protection',
      'content-security-policy',
      'x-permitted-cross-domain-policies',
      'x-download-options',
      'x-dns-prefetch-control'
    ];
    
    // Verificar se todos os headers estão presentes
    requiredSecurityHeaders.forEach(header => {
      expect(headers?.[header]).toBeDefined();
    });
  });

  test('deve validar valores corretos dos headers', async ({ page }) => {
    const response = await page.goto('http://localhost:3000');
    
    const headers = await response?.allHeaders();
    
    // Verificar valores específicos
    expect(headers?.['x-content-type-options']).toBe('nosniff');
    expect(headers?.['x-frame-options']).toBe('SAMEORIGIN');
    expect(headers?.['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers?.['x-xss-protection']).toBe('1; mode=block');
    expect(headers?.['x-permitted-cross-domain-policies']).toBe('none');
    expect(headers?.['x-download-options']).toBe('noopen');
    expect(headers?.['x-dns-prefetch-control']).toBe('off');
  });

  test('deve validar Content-Security-Policy específico', async ({ page }) => {
    const response = await page.goto('http://localhost:3000');
    
    const headers = await response?.allHeaders();
    const csp = headers?.['content-security-policy'];
    
    expect(csp).toBeDefined();
    expect(csp).toContain('default-src');
    expect(csp).toContain('script-src');
    expect(csp).toContain('style-src');
    expect(csp).toContain('img-src');
    expect(csp).toContain('font-src');
  });

  test('deve validar Strict-Transport-Security em HTTPS', async ({ page }) => {
    // Simular requisição HTTPS
    const response = await page.goto('https://localhost:3000');
    
    const headers = await response?.allHeaders();
    const hsts = headers?.['strict-transport-security'];
    
    expect(hsts).toBeDefined();
    expect(hsts).toContain('max-age=');
    expect(hsts).toContain('includeSubDomains');
    expect(hsts).toContain('preload');
  });

  test('deve capturar screenshot da página', async ({ page }) => {
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
    
    const screenshotFile = path.join(screenshotsDir, 'security-headers-test.png');
    fs.writeFileSync(screenshotFile, screenshot);
    
    expect(fs.existsSync(screenshotFile)).toBe(true);
  });
});

