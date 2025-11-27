# LinkSpace - Gestão de Espaços Compartilhados (Multi-tenant)

O LinkSpace é uma plataforma web **multi-tenant** para gestão e reservas de espaços compartilhados, desenvolvida com React, TypeScript e Material-UI.

## Funcionalidades Principais

### 🏢 Multi-tenant (Multi-empresa)
- **Isolamento por empresa**: Cada empresa possui seus próprios usuários, espaços e reservas
- **RBAC por empresa**: Administradores gerenciam apenas recursos da sua empresa
- **Validação cross-empresa**: Prevenção de acesso a dados de outras empresas
- **Auditoria com empresa_id**: Logs de auditoria isolados por empresa

### 👥 Gestão de Usuários e Espaços
- Gestão de espaços compartilhados (Admin)
- Sistema de reservas (Usuário)
- Autenticação e autorização com perfis por empresa
- Persistência de dados em localStorage
- Interface responsiva com Material-UI
- Testes automatizados (Unit, E2E, Lighthouse)

## Requisitos

- Node.js 16.x ou superior
- npm 8.x ou superior

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/linkspace.git
cd linkspace
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Credenciais de Teste (Multi-tenant)

### 🏢 LinkSpace (Empresa ID: 1)
- **Admin:** admin@linkspace.com / admin123
- **Usuário:** user@linkspace.com / user123
- **Espaços:** Sala de Reunião 1, Auditório Principal

### 🏢 TechCorp (Empresa ID: 2)
- **Admin:** admin@techcorp.com / admin123
- **Usuário:** joao@techcorp.com / joao123
- **Espaços:** Sala TechCorp

### 🏢 Inovação Ltda (Empresa ID: 3)
- **Admin:** maria@inovacao.com / maria123
- **Espaços:** Laboratório Inovação

> **Nota:** Cada empresa possui isolamento completo de dados. Usuários só veem recursos da sua empresa.

## Executando Testes

### Testes Unitários e Integração
```bash
# Executar todos os testes unitários
npm run test

# Executar testes em modo watch
npm run test:watch

# Executar testes com interface
npm run test:ui
```

### Testes E2E (Cypress)
```bash
# Abrir interface do Cypress
npm run cypress:open

# Executar testes E2E em modo headless
npm run cypress:run
```

### Lighthouse (Performance e Acessibilidade)
```bash
# Executar análise Lighthouse
npm run lighthouse
```

### Executar Todos os Testes
```bash
# Executa testes unitários + E2E
npm run test:all
```

### Popular Dados de Teste
```bash
# Criar dados sintéticos para testes (multi-tenant)
npm run seed

# Migrar dados legados para multi-tenant
npm run migrate

# Executar migração + seed completo
npm run seed:multi-tenant
```

## Relatórios de Teste

Os relatórios são salvos em `docs/test-reports/`:

- **Unitários:** `docs/test-reports/unit/`
- **E2E:** `docs/test-reports/e2e/`
- **Lighthouse:** `docs/test-reports/lighthouse/`
- **Screenshots:** `docs/test-reports/screens/`
- **Rastreabilidade:** `docs/test-reports/traceability.md`

## Cobertura de Testes

- **Utils:** ≥70% (datetime, reservations)
- **Multi-tenant:** 100% dos cenários de isolamento
- **Componentes:** Testes de integração
- **E2E:** 100% dos fluxos principais + multi-tenant
- **Lighthouse:** Acessibilidade ≥90

### Testes Multi-tenant
- ✅ Isolamento por empresa
- ✅ Validação cross-empresa
- ✅ RBAC por empresa
- ✅ Auditoria com empresa_id
- ✅ Migração de dados legados

## Estrutura do Projeto

```
src/
  ├── components/     # Componentes reutilizáveis
  ├── pages/         # Páginas da aplicação
  ├── services/      # Serviços e integrações
  ├── hooks/         # Hooks personalizados
  ├── contexts/      # Contextos do React
  ├── utils/         # Funções utilitárias
  ├── types/         # Definições de tipos TypeScript
  ├── assets/        # Recursos estáticos
  └── theme/         # Configuração do tema
```

## Scripts Disponíveis

- `npm start`: Inicia o servidor de desenvolvimento
- `npm build`: Gera a build de produção
- `npm test`: Executa os testes
- `npm run lint`: Executa o linter
- `npm run format`: Formata o código

## Tecnologias Utilizadas

### Frontend
- **React** 18.2.0 + **TypeScript** 4.9.5
- **Material-UI** 5.15.14 (Interface responsiva)
- **React Router** 6.21.3 (Navegação)
- **React Hook Form** 7.57.0 + **Yup** 1.3.3 (Formulários)
- **TanStack React Query** 5.67.3 (Gerenciamento de estado)
- **Framer Motion** 12.16.0 (Animações)

### Multi-tenant
- **Isolamento por empresa_id** (FK obrigatória)
- **RBAC por empresa** (admin/user por empresa)
- **Validação cross-empresa** (prevenção de vazamento)
- **Auditoria com empresa_id** (logs isolados)

### Testes
- **Vitest** 1.2.2 (Unitários)
- **Cypress** 13.6.3 (E2E)
- **Lighthouse** 11.7.1 (Performance)
- **Testing Library** (Componentes)

## Arquitetura Multi-tenant

### Modelo de Dados
```
Empresa (1) ←→ (N) Usuário
Empresa (1) ←→ (N) Espaço
Usuário (1) ←→ (N) Reserva
Espaço (1) ←→ (N) Reserva
Reserva (1) ←→ (N) NotificaçãoReserva
```

### Isolamento de Dados
- **empresa_id** é FK obrigatória em todas as entidades
- Todas as consultas filtram automaticamente por empresa_id
- Validação cross-empresa em todas as operações CRUD
- Logs de auditoria incluem empresa_id para rastreabilidade

### RBAC por Empresa
- **Admin**: CRUD de espaços e usuários da sua empresa
- **Usuário**: Visualizar espaços e gerenciar suas reservas
- Perfis são definidos por empresa (não globalmente)

### Segurança
- Validação de empresa_id em todas as requisições
- Prevenção de acesso cross-empresa (403/404)
- Auditoria completa com empresa_id
- Contexto de empresa propagado via JWT

## Contribuição

1. Faça o fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes. 