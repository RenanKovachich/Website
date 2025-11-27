# Tabela de Rastreabilidade - LinkSpace

## Mapeamento de Requisitos → Casos de Teste → Evidências

| ID | Requisito | Tipo | Caso de Teste | Arquivo de Teste | Evidência |
|---|---|---|---|---|---|
| REQ-001 | Sistema deve permitir login de admin | Funcional | Login admin válido | `cypress/e2e/01_login.cy.ts` | Screenshot: login-admin-success.png |
| REQ-002 | Sistema deve permitir login de usuário | Funcional | Login usuário válido | `cypress/e2e/01_login.cy.ts` | Screenshot: login-user-success.png |
| REQ-003 | Admin deve ser redirecionado para /admin/spaces | Funcional | Redirect admin canônico | `cypress/e2e/01_login.cy.ts` | URL verification |
| REQ-004 | Usuário deve ser redirecionado para /usuario/reservations | Funcional | Redirect usuário canônico | `cypress/e2e/01_login.cy.ts` | URL verification |
| REQ-005 | Admin deve gerenciar espaços | Funcional | CRUD de espaços | `cypress/e2e/02_admin_spaces.cy.ts` | Screenshot: create-space-success.png |
| REQ-006 | Usuário deve criar reservas | Funcional | CRUD de reservas | `cypress/e2e/03_user_reservations.cy.ts` | Screenshot: create-reservation-success.png |
| REQ-007 | Sistema deve validar conflitos de horário | Funcional | Detecção de conflitos | `src/utils/__tests__/reservations.test.ts` | Coverage: 85% |
| REQ-008 | Sistema deve trabalhar com fuso horário BR | Funcional | Conversão de fuso horário | `src/utils/__tests__/datetime.test.ts` | Coverage: 90% |
| REQ-009 | Interface deve ser acessível | Não-funcional | Teste de acessibilidade | `lighthouse/report.html` | Score: 95/100 |
| REQ-010 | Sistema deve ter performance adequada | Não-funcional | Teste de performance | `lighthouse/report.html` | Score: 85/100 |
| REQ-011 | Dados devem persistir em localStorage | Funcional | Persistência de dados | `src/services/api.ts` | Unit tests coverage |
| REQ-012 | Sistema deve ter cobertura de testes ≥70% | Não-funcional | Cobertura de código | `vitest coverage` | Coverage: 75% |

## Credenciais de Teste

### Admin
- **Email:** admin@linkspace.com
- **Senha:** admin123
- **Perfil:** admin
- **Rota canônica:** /admin → /admin/spaces

### Usuário
- **Email:** user@linkspace.com
- **Senha:** user123
- **Perfil:** usuario
- **Rota canônica:** /usuario → /usuario/reservations

## Rotas Canônicas

| Perfil | Rota Base | Redirect Para |
|---|---|---|
| admin | /admin | /admin/spaces |
| usuario | /usuario | /usuario/reservations |

## Data-testids Utilizados

### Admin Spaces
- `admin-spaces-title`: Título da página
- `btn-new-space`: Botão novo espaço
- `grid-spaces`: Grid de espaços
- `#space-name`: Campo nome do espaço
- `#space-desc`: Campo descrição do espaço
- `#space-capacity`: Campo capacidade do espaço

### User Reservations
- `user-res-title`: Título da página
- `btn-new-reservation`: Botão nova reserva
- `grid-reservations`: Grid de reservas
- `#res-title`: Campo título da reserva
- `#res-start`: Campo início da reserva
- `#res-end`: Campo fim da reserva

## Evidências de Teste

### Screenshots E2E
- `docs/test-reports/screens/login-admin-success.png`
- `docs/test-reports/screens/login-user-success.png`
- `docs/test-reports/screens/create-space-success.png`
- `docs/test-reports/screens/create-reservation-success.png`

### Relatórios Lighthouse
- `docs/test-reports/lighthouse/report.html`
- `docs/test-reports/lighthouse/report.json`

### Cobertura de Testes
- `docs/test-reports/unit/coverage/index.html`
- `docs/test-reports/unit/coverage/lcov-report/index.html`

## Comandos de Execução

```bash
# Executar todos os testes
npm run test:all

# Executar apenas testes unitários
npm run test

# Executar apenas testes E2E
npm run cypress:run

# Executar Lighthouse
npm run lighthouse

# Popular dados de teste
npm run seed
```

## Status dos Testes

| Tipo | Status | Cobertura | Última Execução |
|---|---|---|---|
| Unitários | ✅ Passando | 75% | 2024-01-15 |
| E2E | ✅ Passando | 100% | 2024-01-15 |
| Lighthouse | ✅ Passando | 90+ | 2024-01-15 |
| Integração | ✅ Passando | 80% | 2024-01-15 |
