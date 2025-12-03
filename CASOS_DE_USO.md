# Casos de Uso - LinkSpace

## 1. Autenticação e Autorização

### UC-01: Realizar Login
**Ator:** Usuário (Admin ou Usuário)  
**Pré-condições:** Usuário possui conta cadastrada  
**Fluxo Principal:**
1. Usuário acessa a página de login
2. Sistema exibe formulário de login
3. Usuário informa email e senha
4. Sistema valida credenciais
5. Sistema verifica empresa do usuário
6. Sistema registra log de auditoria
7. Sistema redireciona para dashboard conforme perfil

**Fluxos Alternativos:**
- 3a. Credenciais inválidas: Sistema exibe mensagem de erro
- 3b. Usuário inativo: Sistema exibe mensagem de erro

**Pós-condições:** Usuário autenticado e contexto de empresa definido

---

### UC-02: Realizar Cadastro
**Ator:** Visitante  
**Pré-condições:** Visitante não possui conta  
**Fluxo Principal:**
1. Visitante acessa página de registro
2. Sistema exibe formulário de cadastro
3. Visitante informa nome, email, senha e seleciona empresa
4. Sistema valida se email já existe
5. Sistema valida se empresa existe
6. Sistema criptografa senha
7. Sistema cria usuário com perfil "usuario"
8. Sistema registra log de auditoria
9. Sistema redireciona para login

**Fluxos Alternativos:**
- 4a. Email já cadastrado: Sistema exibe mensagem de erro
- 5a. Empresa não encontrada: Sistema exibe mensagem de erro

**Pós-condições:** Novo usuário cadastrado na empresa selecionada

---

### UC-03: Realizar Logout
**Ator:** Usuário autenticado  
**Fluxo Principal:**
1. Usuário clica em "Sair"
2. Sistema limpa contexto de autenticação
3. Sistema redireciona para página inicial

**Pós-condições:** Usuário desautenticado

---

## 2. Gerenciamento de Empresas (Admin)

### UC-04: Listar Empresas
**Ator:** Administrador  
**Pré-condições:** Usuário autenticado como admin  
**Fluxo Principal:**
1. Admin acessa área de empresas
2. Sistema busca todas as empresas
3. Sistema exibe lista de empresas com informações básicas

**Pós-condições:** Lista de empresas exibida

---

### UC-05: Criar Empresa
**Ator:** Administrador  
**Pré-condições:** Usuário autenticado como admin  
**Fluxo Principal:**
1. Admin acessa formulário de criação de empresa
2. Sistema exibe formulário
3. Admin informa nome, CNPJ, email e telefone
4. Sistema valida dados
5. Sistema cria nova empresa
6. Sistema registra log de auditoria
7. Sistema exibe mensagem de sucesso

**Fluxos Alternativos:**
- 4a. Dados inválidos: Sistema exibe mensagens de erro

**Pós-condições:** Nova empresa criada

---

## 3. Gerenciamento de Usuários

### UC-06: Listar Usuários da Empresa
**Ator:** Administrador  
**Pré-condições:** Usuário autenticado como admin  
**Fluxo Principal:**
1. Admin acessa área de usuários
2. Sistema busca usuários da empresa do admin
3. Sistema filtra apenas usuários da mesma empresa
4. Sistema exibe lista de usuários com dados da empresa

**Pós-condições:** Lista de usuários da empresa exibida

---

### UC-07: Criar Usuário
**Ator:** Administrador  
**Pré-condições:** Usuário autenticado como admin  
**Fluxo Principal:**
1. Admin acessa formulário de criação de usuário
2. Sistema exibe formulário
3. Admin informa nome, email, senha e perfil
4. Sistema valida se email já existe
5. Sistema criptografa senha
6. Sistema cria usuário vinculado à empresa do admin
7. Sistema registra log de auditoria
8. Sistema exibe mensagem de sucesso

**Fluxos Alternativos:**
- 4a. Email já cadastrado: Sistema exibe mensagem de erro
- 3a. Usuário comum tenta criar: Sistema bloqueia acesso

**Pós-condições:** Novo usuário criado na empresa do admin

---

### UC-08: Editar Usuário
**Ator:** Administrador ou Próprio Usuário  
**Pré-condições:** Usuário autenticado  
**Fluxo Principal:**
1. Usuário acessa edição de usuário
2. Sistema valida acesso (admin pode editar qualquer usuário da empresa, usuário só pode editar próprio perfil)
3. Sistema valida se usuário pertence à mesma empresa
4. Sistema exibe formulário com dados atuais
5. Usuário altera dados desejados
6. Sistema valida alterações
7. Se senha foi alterada, sistema criptografa nova senha
8. Sistema atualiza usuário
9. Sistema registra log de auditoria
10. Sistema exibe mensagem de sucesso

**Fluxos Alternativos:**
- 3a. Usuário de outra empresa: Sistema bloqueia acesso
- 2a. Usuário comum tentando editar outro: Sistema bloqueia acesso

**Pós-condições:** Dados do usuário atualizados

---

### UC-09: Visualizar Perfil
**Ator:** Usuário autenticado  
**Fluxo Principal:**
1. Usuário acessa página de perfil
2. Sistema busca dados do usuário e empresa
3. Sistema exibe informações do perfil

**Pós-condições:** Perfil exibido

---

## 4. Gerenciamento de Espaços

### UC-10: Listar Espaços da Empresa
**Ator:** Usuário autenticado  
**Pré-condições:** Usuário autenticado  
**Fluxo Principal:**
1. Usuário acessa área de espaços
2. Sistema busca espaços da empresa do usuário
3. Sistema filtra apenas espaços da mesma empresa
4. Sistema exibe lista de espaços disponíveis

**Pós-condições:** Lista de espaços da empresa exibida

---

### UC-11: Criar Espaço
**Ator:** Administrador  
**Pré-condições:** Usuário autenticado como admin  
**Fluxo Principal:**
1. Admin acessa formulário de criação de espaço
2. Sistema exibe formulário
3. Admin informa nome, tipo, capacidade, descrição e opcionalmente imagem e amenidades
4. Sistema valida dados
5. Sistema cria espaço vinculado à empresa do admin
6. Sistema registra log de auditoria
7. Sistema exibe mensagem de sucesso

**Fluxos Alternativos:**
- 4a. Dados inválidos: Sistema exibe mensagens de erro
- 1a. Usuário comum tenta criar: Sistema bloqueia acesso

**Pós-condições:** Novo espaço criado na empresa

---

### UC-12: Editar Espaço
**Ator:** Administrador  
**Pré-condições:** Usuário autenticado como admin  
**Fluxo Principal:**
1. Admin acessa edição de espaço
2. Sistema valida se espaço pertence à empresa do admin
3. Sistema exibe formulário com dados atuais
4. Admin altera dados desejados
5. Sistema valida alterações
6. Sistema atualiza espaço
7. Sistema registra log de auditoria
8. Sistema exibe mensagem de sucesso

**Fluxos Alternativos:**
- 2a. Espaço de outra empresa: Sistema bloqueia acesso
- 1a. Usuário comum tenta editar: Sistema bloqueia acesso

**Pós-condições:** Dados do espaço atualizados

---

### UC-13: Visualizar Detalhes do Espaço
**Ator:** Usuário autenticado  
**Fluxo Principal:**
1. Usuário seleciona um espaço
2. Sistema busca detalhes do espaço
3. Sistema valida se espaço pertence à empresa do usuário
4. Sistema exibe informações completas do espaço

**Fluxos Alternativos:**
- 3a. Espaço de outra empresa: Sistema bloqueia acesso

**Pós-condições:** Detalhes do espaço exibidos

---

## 5. Gerenciamento de Reservas

### UC-14: Listar Reservas
**Ator:** Usuário autenticado  
**Pré-condições:** Usuário autenticado  
**Fluxo Principal:**
1. Usuário acessa área de reservas
2. Sistema busca reservas da empresa do usuário
3. Sistema filtra apenas reservas da mesma empresa
4. Sistema exibe lista de reservas com dados do espaço e usuário

**Fluxos Alternativos:**
- 1a. Admin acessa: Sistema exibe todas as reservas da empresa
- 1b. Usuário comum acessa: Sistema pode filtrar apenas suas reservas

**Pós-condições:** Lista de reservas exibida

---

### UC-15: Criar Reserva
**Ator:** Usuário autenticado  
**Pré-condições:** Usuário autenticado  
**Fluxo Principal:**
1. Usuário acessa formulário de criação de reserva
2. Sistema busca espaços disponíveis da empresa
3. Sistema exibe formulário com lista de espaços
4. Usuário seleciona espaço, data/hora inicial, data/hora final, número de participantes e descrição
5. Sistema valida se espaço pertence à empresa do usuário
6. Sistema valida se usuário pertence à mesma empresa do espaço
7. Sistema verifica conflitos de horário
8. Sistema cria reserva com status "pendente"
9. Sistema registra log de auditoria
10. Sistema exibe mensagem de sucesso

**Fluxos Alternativos:**
- 5a. Espaço de outra empresa: Sistema bloqueia acesso
- 6a. Usuário de outra empresa: Sistema bloqueia acesso
- 7a. Conflito de horário: Sistema exibe mensagem de erro com detalhes do conflito

**Pós-condições:** Nova reserva criada com status pendente

---

### UC-16: Confirmar Reserva
**Ator:** Administrador ou Próprio Usuário  
**Pré-condições:** Reserva existe e está pendente  
**Fluxo Principal:**
1. Usuário acessa detalhes da reserva
2. Sistema valida acesso (admin pode confirmar qualquer reserva da empresa, usuário só pode confirmar próprias reservas)
3. Sistema valida se reserva pertence à empresa do usuário
4. Usuário confirma reserva
5. Sistema atualiza status para "confirmada"
6. Sistema registra log de auditoria
7. Sistema exibe mensagem de sucesso

**Fluxos Alternativos:**
- 3a. Reserva de outra empresa: Sistema bloqueia acesso
- 2a. Usuário comum tentando confirmar reserva de outro: Sistema bloqueia acesso

**Pós-condições:** Reserva confirmada

---

### UC-17: Cancelar Reserva
**Ator:** Administrador ou Próprio Usuário  
**Pré-condições:** Reserva existe  
**Fluxo Principal:**
1. Usuário acessa detalhes da reserva
2. Sistema valida acesso (admin pode cancelar qualquer reserva da empresa, usuário só pode cancelar próprias reservas)
3. Sistema valida se reserva pertence à empresa do usuário
4. Usuário cancela reserva
5. Sistema atualiza status para "cancelada"
6. Sistema registra log de auditoria
7. Sistema exibe mensagem de sucesso

**Fluxos Alternativos:**
- 3a. Reserva de outra empresa: Sistema bloqueia acesso
- 2a. Usuário comum tentando cancelar reserva de outro: Sistema bloqueia acesso

**Pós-condições:** Reserva cancelada

---

### UC-18: Editar Reserva
**Ator:** Administrador ou Próprio Usuário  
**Pré-condições:** Reserva existe  
**Fluxo Principal:**
1. Usuário acessa edição de reserva
2. Sistema valida acesso (admin pode editar qualquer reserva da empresa, usuário só pode editar próprias reservas)
3. Sistema valida se reserva pertence à empresa do usuário
4. Sistema exibe formulário com dados atuais
5. Usuário altera dados desejados (exceto espaço e usuário)
6. Se datas foram alteradas, sistema verifica conflitos de horário
7. Sistema valida alterações
8. Sistema atualiza reserva
9. Sistema registra log de auditoria
10. Sistema exibe mensagem de sucesso

**Fluxos Alternativos:**
- 3a. Reserva de outra empresa: Sistema bloqueia acesso
- 2a. Usuário comum tentando editar reserva de outro: Sistema bloqueia acesso
- 6a. Conflito de horário: Sistema exibe mensagem de erro

**Pós-condições:** Dados da reserva atualizados

---

## 6. Notificações

### UC-19: Listar Notificações
**Ator:** Usuário autenticado  
**Pré-condições:** Usuário autenticado  
**Fluxo Principal:**
1. Usuário acessa área de notificações
2. Sistema busca notificações da empresa do usuário
3. Sistema filtra apenas notificações da mesma empresa
4. Sistema exibe lista de notificações

**Pós-condições:** Lista de notificações exibida

---

## 7. Auditoria

### UC-20: Visualizar Logs de Auditoria
**Ator:** Administrador  
**Pré-condições:** Usuário autenticado como admin  
**Fluxo Principal:**
1. Admin acessa área de auditoria
2. Sistema busca logs de auditoria da empresa do admin
3. Sistema filtra apenas logs da mesma empresa
4. Sistema exibe lista de logs com ações, recursos e detalhes

**Fluxos Alternativos:**
- 1a. Usuário comum tenta acessar: Sistema bloqueia acesso

**Pós-condições:** Lista de logs de auditoria exibida

---

## 8. Dashboard

### UC-21: Visualizar Dashboard Admin
**Ator:** Administrador  
**Pré-condições:** Usuário autenticado como admin  
**Fluxo Principal:**
1. Admin acessa dashboard
2. Sistema busca estatísticas da empresa:
   - Total de espaços
   - Total de usuários
   - Total de reservas
   - Reservas pendentes/confirmadas/canceladas
3. Sistema exibe dashboard com gráficos e métricas

**Pós-condições:** Dashboard exibido com estatísticas da empresa

---

### UC-22: Visualizar Dashboard Usuário
**Ator:** Usuário comum  
**Pré-condições:** Usuário autenticado  
**Fluxo Principal:**
1. Usuário acessa dashboard
2. Sistema busca estatísticas do usuário:
   - Minhas reservas
   - Reservas pendentes
   - Espaços disponíveis
3. Sistema exibe dashboard personalizado

**Pós-condições:** Dashboard exibido com estatísticas do usuário

---

## Regras de Negócio

### RN-01: Isolamento Multi-tenant
- Todos os recursos (usuários, espaços, reservas) são isolados por empresa
- Usuários só podem acessar recursos da sua empresa
- Validação cross-empresa em todas as operações

### RN-02: RBAC (Role-Based Access Control)
- **Admin**: Pode gerenciar espaços, usuários e todas as reservas da empresa
- **Usuário**: Pode visualizar espaços e gerenciar apenas suas próprias reservas

### RN-03: Validação de Conflitos
- Não é permitido criar reservas com sobreposição de horários no mesmo espaço
- Reservas canceladas não são consideradas em validações de conflito

### RN-04: Auditoria
- Todas as ações importantes são registradas em logs de auditoria
- Logs incluem empresa_id para rastreabilidade
- Apenas admins podem visualizar logs de auditoria

### RN-05: Segurança
- Senhas são criptografadas com bcrypt
- Validação de acesso em todas as operações CRUD
- Prevenção de acesso cross-empresa

---

## Diagrama de Atores

```
┌─────────────┐
│  Visitante  │
└──────┬──────┘
       │
       │ (UC-02)
       ▼
┌─────────────┐
│   Usuário   │◄─────────┐
│  (Comum)    │          │
└──────┬──────┘          │
       │                 │
       │ (UC-01)         │
       │                 │
       ▼                 │
┌─────────────┐          │
│  Autenticado│          │
└──────┬──────┘          │
       │                 │
       ├─────────────────┤
       │                 │
       ▼                 │
┌─────────────┐          │
│  Admin      │          │
└─────────────┘          │
                         │
       (Herança)         │
                         │
       └─────────────────┘
```

---

## Matriz de Casos de Uso por Ator

| Caso de Uso | Visitante | Usuário | Admin |
|------------|-----------|---------|-------|
| UC-01: Login | ✓ | ✓ | ✓ |
| UC-02: Cadastro | ✓ | - | - |
| UC-03: Logout | - | ✓ | ✓ |
| UC-04: Listar Empresas | - | - | ✓ |
| UC-05: Criar Empresa | - | - | ✓ |
| UC-06: Listar Usuários | - | - | ✓ |
| UC-07: Criar Usuário | - | - | ✓ |
| UC-08: Editar Usuário | - | ✓* | ✓ |
| UC-09: Visualizar Perfil | - | ✓ | ✓ |
| UC-10: Listar Espaços | - | ✓ | ✓ |
| UC-11: Criar Espaço | - | - | ✓ |
| UC-12: Editar Espaço | - | - | ✓ |
| UC-13: Visualizar Espaço | - | ✓ | ✓ |
| UC-14: Listar Reservas | - | ✓ | ✓ |
| UC-15: Criar Reserva | - | ✓ | ✓ |
| UC-16: Confirmar Reserva | - | ✓* | ✓ |
| UC-17: Cancelar Reserva | - | ✓* | ✓ |
| UC-18: Editar Reserva | - | ✓* | ✓ |
| UC-19: Listar Notificações | - | ✓ | ✓ |
| UC-20: Visualizar Auditoria | - | - | ✓ |
| UC-21: Dashboard Admin | - | - | ✓ |
| UC-22: Dashboard Usuário | - | ✓ | - |

*Usuário comum só pode realizar ação em seus próprios recursos

