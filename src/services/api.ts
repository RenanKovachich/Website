import { 
  User, 
  Space, 
  Reservation, 
  Empresa, 
  NotificacaoReserva,
  LoginFormValues, 
  RegisterFormValues,
  EmpresaFormValues,
  CrossEmpresaError,
  AuditLog
} from '../types';
import bcrypt from 'bcryptjs';

// Simula um delay de rede
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Chave para localStorage
const STORAGE_KEY = '@LinkSpace:data';

// Função para gerar IDs sequenciais
function generateId(type: 'user' | 'space' | 'reservation' | 'notificacao' | 'audit' | 'empresa'): string {
  const data = getStoredData();
  let maxId = 0;
  
  switch (type) {
    case 'user':
      maxId = Math.max(0, ...data.users.map(u => parseInt(u.id) || 0));
      break;
    case 'space':
      maxId = Math.max(0, ...data.spaces.map(s => parseInt(s.id) || 0));
      break;
    case 'reservation':
      maxId = Math.max(0, ...data.reservations.map(r => parseInt(r.id) || 0));
      break;
    case 'notificacao':
      maxId = Math.max(0, ...data.notificacoes.map(n => parseInt(n.id) || 0));
      break;
    case 'audit':
      maxId = Math.max(0, ...data.auditLogs.map(a => parseInt(a.id) || 0));
      break;
    case 'empresa':
      maxId = Math.max(0, ...data.empresas.map(e => parseInt(e.id) || 0));
      break;
  }
  
  return String(maxId + 1);
}

// Interface para os dados armazenados
interface StoredData {
  empresas: Empresa[];
  users: User[];
  spaces: Space[];
  reservations: Reservation[];
  notificacoes: NotificacaoReserva[];
  auditLogs: AuditLog[];
}

// Contexto de empresa para validações
interface EmpresaContext {
  empresaId: string;
  userId: string;
  userProfile: 'admin' | 'usuario';
}

// Dados iniciais padrão
const defaultData: StoredData = {
  empresas: [
    {
      id: '1',
      nome: 'LinkSpace',
      cnpj: '12.345.678/0001-90',
      email: 'contato@linkspace.com',
      telefone: '(11) 99999-9999',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      nome: 'TechCorp',
      cnpj: '98.765.432/0001-10',
      email: 'contato@techcorp.com',
      telefone: '(11) 88888-8888',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  users: [
    {
      id: '1',
      name: 'Administrador LinkSpace',
      email: 'admin@linkspace.com',
      password: 'admin123',
      profile: 'admin',
      empresaId: '1',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Usuário LinkSpace',
      email: 'user@linkspace.com',
      password: 'user123',
      profile: 'usuario',
      empresaId: '1',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Admin TechCorp',
      email: 'admin@techcorp.com',
      password: 'admin123',
      profile: 'admin',
      empresaId: '2',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  spaces: [
    {
      id: '1',
      name: 'Sala de Reunião 1',
      type: 'sala_reuniao',
      capacity: 10,
      status: 'active',
      description: 'Sala de reunião para pequenos grupos',
      empresaId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Auditório Principal',
      type: 'auditorio',
      capacity: 50,
      status: 'active',
      description: 'Auditório para eventos e apresentações',
      empresaId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Sala TechCorp',
      type: 'coworking',
      capacity: 20,
      status: 'active',
      description: 'Espaço colaborativo TechCorp',
      empresaId: '2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  reservations: [],
  notificacoes: [],
  auditLogs: [],
};

// Função para carregar dados de seed
function loadSeedData(): StoredData {
  // Dados de seed hardcoded para garantir que sempre funcionem
  return {
    empresas: [
      {
        id: '1',
        nome: 'LinkSpace',
        cnpj: '12.345.678/0001-90',
        email: 'contato@linkspace.com',
        telefone: '(11) 99999-9999',
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        nome: 'TechCorp',
        cnpj: '98.765.432/0001-10',
        email: 'contato@techcorp.com',
        telefone: '(11) 88888-8888',
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        nome: 'Inovação Ltda',
        cnpj: '11.222.333/0001-44',
        email: 'contato@inovacao.com',
        telefone: '(11) 77777-7777',
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    users: [
      {
        id: '1',
        name: 'Administrador LinkSpace',
        email: 'admin@linkspace.com',
        password: '$2b$10$YCNEwdBIKz8DFpcBuiUeuOwYf1e9GRE3EjDLQrDCXGrhzdlSbVNoi', // admin123
        profile: 'admin' as const,
        empresaId: '1',
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Usuário LinkSpace',
        email: 'user@linkspace.com',
        password: '$2b$10$0ZQQghb4Qn2LJky4pkqP.O6hzHHMbqufuRkAqGBqzJN6Nt2ds5EEu', // user123
        profile: 'usuario' as const,
        empresaId: '1',
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Admin TechCorp',
        email: 'admin@techcorp.com',
        password: '$2b$10$YCNEwdBIKz8DFpcBuiUeuOwYf1e9GRE3EjDLQrDCXGrhzdlSbVNoi', // admin123
        profile: 'admin' as const,
        empresaId: '2',
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '4',
        name: 'João Silva',
        email: 'joao@techcorp.com',
        password: '$2b$10$x8jQcGFoUwlx.N1gAPQCDeJ6acnNwJmSbDCidAAe9rWzwZn2S4Nfu', // joao123
        profile: 'usuario' as const,
        empresaId: '2',
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '5',
        name: 'Maria Santos',
        email: 'maria@inovacao.com',
        password: '$2b$10$t09Pg.0u57m8WW4RZumlHuqQ.Einsp4AJYl5OPkJnXUnUoemhEGlC', // maria123
        profile: 'admin' as const,
        empresaId: '3',
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    spaces: [
      {
        id: '1',
        name: 'Sala de Reunião 1',
        type: 'sala_reuniao' as const,
        capacity: 10,
        status: 'active' as const,
        description: 'Sala de reunião para pequenos grupos',
        empresaId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Auditório Principal',
        type: 'auditorio' as const,
        capacity: 50,
        status: 'active' as const,
        description: 'Auditório para eventos e apresentações',
        empresaId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Sala TechCorp',
        type: 'sala_reuniao' as const,
        capacity: 8,
        status: 'active' as const,
        description: 'Sala de reunião da TechCorp',
        empresaId: '2',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '4',
        name: 'Laboratório Inovação',
        type: 'escritorio' as const,
        capacity: 15,
        status: 'active' as const,
        description: 'Laboratório de inovação',
        empresaId: '3',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    reservations: [
      {
        id: '1',
        spaceId: '1',
        userId: '2',
        startDate: new Date(Date.now() + 86400000).toISOString(), // Amanhã
        endDate: new Date(Date.now() + 86400000 + 3600000).toISOString(), // Amanhã + 1 hora
        participants: 5,
        description: 'Reunião de planejamento do projeto',
        status: 'pendente' as const,
        empresaId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        spaceId: '2',
        userId: '2',
        startDate: new Date(Date.now() + 172800000).toISOString(), // Depois de amanhã
        endDate: new Date(Date.now() + 172800000 + 7200000).toISOString(), // Depois de amanhã + 2 horas
        participants: 20,
        description: 'Apresentação para clientes',
        status: 'confirmada' as const,
        empresaId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        spaceId: '1',
        userId: '2',
        startDate: new Date(Date.now() - 86400000).toISOString(), // Ontem
        endDate: new Date(Date.now() - 86400000 + 3600000).toISOString(), // Ontem + 1 hora
        participants: 3,
        description: 'Reunião cancelada',
        status: 'cancelada' as const,
        empresaId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    notificacoes: [],
    auditLogs: [],
  };
}

// Funções para gerenciar localStorage
function getStoredData(): StoredData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsedData = JSON.parse(stored);
      // Verificar se tem dados válidos (pelo menos uma empresa, um usuário e uma reserva)
      if (parsedData.empresas && parsedData.empresas.length > 0 && 
          parsedData.users && parsedData.users.length > 0 &&
          parsedData.reservations && parsedData.reservations.length > 0) {
        return parsedData;
      }
    }
  } catch (error) {
    console.error('Erro ao ler dados do localStorage:', error);
  }
  
  // Se não há dados válidos, carregar dados de seed
  const seedData = loadSeedData();
  setStoredData(seedData); // Salvar no localStorage para próxima vez
  return seedData;
}

function setStoredData(data: StoredData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao salvar dados no localStorage:', error);
  }
}

// Função para limpar localStorage e recarregar dados de seed
function clearAndReloadData(): StoredData {
  console.log('Limpando localStorage e recarregando dados de seed...');
  localStorage.removeItem(STORAGE_KEY);
  const seedData = loadSeedData();
  setStoredData(seedData);
  return seedData;
}

// Funções auxiliares para obter dados
function getEmpresas(): Empresa[] {
  return getStoredData().empresas;
}

function getUsers(): User[] {
  return getStoredData().users;
}

function getSpaces(): Space[] {
  return getStoredData().spaces;
}

function getReservations(): Reservation[] {
  return getStoredData().reservations;
}

function getNotificacoes(): NotificacaoReserva[] {
  return getStoredData().notificacoes;
}

function getAuditLogs(): AuditLog[] {
  return getStoredData().auditLogs;
}

// Funções de atualização
function updateEmpresas(empresas: Empresa[]): void {
  const data = getStoredData();
  data.empresas = empresas;
  setStoredData(data);
}

function updateUsers(users: User[]): void {
  const data = getStoredData();
  data.users = users;
  setStoredData(data);
}

function updateSpaces(spaces: Space[]): void {
  const data = getStoredData();
  data.spaces = spaces;
  setStoredData(data);
}

function updateReservations(reservations: Reservation[]): void {
  const data = getStoredData();
  data.reservations = reservations;
  setStoredData(data);
}

function updateNotificacoes(notificacoes: NotificacaoReserva[]): void {
  const data = getStoredData();
  data.notificacoes = notificacoes;
  setStoredData(data);
}

function updateAuditLogs(auditLogs: AuditLog[]): void {
  const data = getStoredData();
  data.auditLogs = auditLogs;
  setStoredData(data);
}

// Funções de validação multi-tenant
function validateEmpresaAccess(context: EmpresaContext, resourceEmpresaId: string): void {
  if (context.empresaId !== resourceEmpresaId) {
    const error: CrossEmpresaError = new Error('Acesso negado: recurso pertence a outra empresa') as CrossEmpresaError;
    error.code = 'CROSS_EMPRESA_ACCESS';
    error.empresaId = context.empresaId;
    error.resourceEmpresaId = resourceEmpresaId;
    throw error;
  }
}

function logAuditAction(
  userId: string, 
  empresaId: string, 
  action: string, 
  resource: string, 
  resourceId: string, 
  details?: Record<string, any>
): void {
  const auditLog: AuditLog = {
    id: generateId('audit'),
    userId,
    empresaId,
    action,
    resource,
    resourceId,
    details,
    createdAt: new Date().toISOString(),
  };
  
  const auditLogs = getAuditLogs();
  auditLogs.push(auditLog);
  updateAuditLogs(auditLogs);
}

class ApiService {
  // Contexto atual do usuário (será definido após login)
  private currentContext: EmpresaContext | null = null;

  // Método para definir contexto após login
  setContext(user: User): void {
    this.currentContext = {
      empresaId: user.empresaId,
      userId: user.id,
      userProfile: user.profile,
    };
  }

  // Método para obter contexto atual
  getContext(): EmpresaContext | null {
    return this.currentContext;
  }

  // Método para limpar contexto (logout)
  clearContext(): void {
    this.currentContext = null;
  }

  // Autenticação
  async login(data: LoginFormValues) {
    await wait(150); // Simula delay de rede
    const users = getUsers();
    const empresas = getEmpresas();
    
    const user = users.find((u) => u.email === data.email);
    
    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    // Verificar senha com bcrypt
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    // Buscar dados da empresa
    const empresa = empresas.find(e => e.id === user.empresaId);
    const userWithEmpresa = { ...user, empresa };

    // Definir contexto
    this.setContext(user);

    // Log de auditoria
    logAuditAction(user.id, user.empresaId, 'LOGIN', 'USER', user.id);

    return { data: userWithEmpresa };
  }

  async register(data: RegisterFormValues) {
    await wait(150);
    const users = getUsers();
    const empresas = getEmpresas();
    
    const existingUser = users.find((u) => u.email === data.email);
    if (existingUser) {
      throw new Error('E-mail já cadastrado');
    }

    // Validar se a empresa existe
    const empresa = empresas.find(e => e.id === data.empresaId);
    if (!empresa) {
      throw new Error('Empresa não encontrada');
    }

    // Hash da senha com bcrypt
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser: User = {
      id: generateId('user'),
      name: data.name,
      email: data.email,
      password: hashedPassword,
      profile: 'usuario',
      empresaId: data.empresaId,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    updateUsers(users);

    // Log de auditoria
    logAuditAction(newUser.id, newUser.empresaId, 'REGISTER', 'USER', newUser.id);

    return { data: { ...newUser, empresa } };
  }

  // Empresas
  async getEmpresas() {
    await wait(150);
    return getEmpresas();
  }

  async createEmpresa(data: EmpresaFormValues) {
    await wait(150);
    const empresas = getEmpresas();
    const newEmpresa: Empresa = {
      id: generateId('empresa'),
      ...data,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    empresas.push(newEmpresa);
    updateEmpresas(empresas);
    return newEmpresa;
  }

  // Usuários (com validação multi-tenant)
  async getUsers() {
    await wait(150);
    if (!this.currentContext) {
      throw new Error('Usuário não autenticado');
    }

    const users = getUsers();
    const empresas = getEmpresas();
    
    // Filtrar apenas usuários da mesma empresa
    const empresaUsers = users.filter(u => u.empresaId === this.currentContext!.empresaId);
    
    // Adicionar dados da empresa
    return empresaUsers.map(user => ({
      ...user,
      empresa: empresas.find(e => e.id === user.empresaId)
    }));
  }

  async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'empresaId'>) {
    await wait(150);
    if (!this.currentContext) {
      throw new Error('Usuário não autenticado');
    }

    // Apenas admins podem criar usuários
    if (this.currentContext.userProfile !== 'admin') {
      throw new Error('Apenas administradores podem criar usuários');
    }

    // Forçar empresa_id do contexto
    const userData = {
      ...data,
      empresaId: this.currentContext.empresaId,
    };

    const users = getUsers();
    const empresas = getEmpresas();
    
    // Hash da senha com bcrypt
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const newUser: User = {
      id: generateId('user'),
      ...userData,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    updateUsers(users);

    // Log de auditoria
    logAuditAction(
      this.currentContext.userId, 
      this.currentContext.empresaId, 
      'CREATE', 
      'USER', 
      newUser.id
    );

    return {
      ...newUser,
      empresa: empresas.find(e => e.id === newUser.empresaId)
    };
  }

  async updateUser(id: string, data: Partial<User>) {
    await wait(150);
    if (!this.currentContext) {
      throw new Error('Usuário não autenticado');
    }

    const users = getUsers();
    const empresas = getEmpresas();
    const userIndex = users.findIndex((u) => u.id === id);
    
    if (userIndex === -1) {
      throw new Error('Usuário não encontrado');
    }

    const user = users[userIndex];
    
    // Validar acesso à empresa
    validateEmpresaAccess(this.currentContext, user.empresaId);

    // Apenas admins podem editar outros usuários (exceto próprio perfil)
    if (this.currentContext.userProfile !== 'admin' && this.currentContext.userId !== id) {
      throw new Error('Apenas administradores podem editar outros usuários');
    }

    // Remover empresaId dos dados se presente (não pode ser alterado)
    const { empresaId, ...updateData } = data;

    // Hash da senha se ela for alterada
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    
    updateUsers(users);

    // Log de auditoria
    logAuditAction(
      this.currentContext.userId, 
      this.currentContext.empresaId, 
      'UPDATE', 
      'USER', 
      id,
      { changes: updateData }
    );

    return {
      ...users[userIndex],
      empresa: empresas.find(e => e.id === users[userIndex].empresaId)
    };
  }

  // Espaços (com validação multi-tenant)
  async getSpaces() {
    await wait(150);
    if (!this.currentContext) {
      throw new Error('Usuário não autenticado');
    }

    const spaces = getSpaces();
    const empresas = getEmpresas();
    
    // Filtrar apenas espaços da mesma empresa
    const empresaSpaces = spaces.filter(s => s.empresaId === this.currentContext!.empresaId);
    
    // Adicionar dados da empresa
    return empresaSpaces.map(space => ({
      ...space,
      empresa: empresas.find(e => e.id === space.empresaId)
    }));
  }

  async createSpace(data: Omit<Space, 'id' | 'createdAt' | 'updatedAt' | 'empresaId'>) {
    await wait(150);
    if (!this.currentContext) {
      throw new Error('Usuário não autenticado');
    }

    // Apenas admins podem criar espaços
    if (this.currentContext.userProfile !== 'admin') {
      throw new Error('Apenas administradores podem criar espaços');
    }

    // Forçar empresa_id do contexto
    const spaceData = {
      ...data,
      empresaId: this.currentContext.empresaId,
    };

    const spaces = getSpaces();
    const empresas = getEmpresas();
    
    const newSpace: Space = {
      id: generateId('space'),
      ...spaceData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    spaces.push(newSpace);
    updateSpaces(spaces);

    // Log de auditoria
    logAuditAction(
      this.currentContext.userId, 
      this.currentContext.empresaId, 
      'CREATE', 
      'SPACE', 
      newSpace.id
    );

    return {
      ...newSpace,
      empresa: empresas.find(e => e.id === newSpace.empresaId)
    };
  }

  async updateSpace(id: string, data: Partial<Space>) {
    await wait(150);
    if (!this.currentContext) {
      throw new Error('Usuário não autenticado');
    }

    // Apenas admins podem editar espaços
    if (this.currentContext.userProfile !== 'admin') {
      throw new Error('Apenas administradores podem editar espaços');
    }

    const spaces = getSpaces();
    const empresas = getEmpresas();
    const spaceIndex = spaces.findIndex((s) => s.id === id);
    
    if (spaceIndex === -1) {
      throw new Error('Espaço não encontrado');
    }

    const space = spaces[spaceIndex];
    
    // Validar acesso à empresa
    validateEmpresaAccess(this.currentContext, space.empresaId);

    // Remover empresaId dos dados se presente (não pode ser alterado)
    const { empresaId, ...updateData } = data;

    spaces[spaceIndex] = {
      ...spaces[spaceIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    
    updateSpaces(spaces);

    // Log de auditoria
    logAuditAction(
      this.currentContext.userId, 
      this.currentContext.empresaId, 
      'UPDATE', 
      'SPACE', 
      id,
      { changes: updateData }
    );

    return {
      ...spaces[spaceIndex],
      empresa: empresas.find(e => e.id === spaces[spaceIndex].empresaId)
    };
  }

  // Reservas (com validação multi-tenant)
  async getReservations() {
    await wait(150);
    if (!this.currentContext) {
      throw new Error('Usuário não autenticado');
    }

    const reservations = getReservations();
    const spaces = getSpaces();
    const users = getUsers();
    const empresas = getEmpresas();
    
    // Filtrar apenas reservas da mesma empresa
    const empresaReservations = reservations.filter(r => r.empresaId === this.currentContext!.empresaId);
    
    return empresaReservations.map((reservation) => ({
      ...reservation,
      space: spaces.find((s) => s.id === reservation.spaceId),
      user: users.find((u) => u.id === reservation.userId),
      empresa: empresas.find(e => e.id === reservation.empresaId),
    }));
  }

  async createReservation(data: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt' | 'space' | 'user' | 'empresa' | 'empresaId'>) {
    await wait(150);
    if (!this.currentContext) {
      throw new Error('Usuário não autenticado');
    }

    const reservations = getReservations();
    const spaces = getSpaces();
    const users = getUsers();
    const empresas = getEmpresas();
    
    // Validar se o espaço pertence à mesma empresa
    const space = spaces.find(s => s.id === data.spaceId);
    if (!space) {
      throw new Error('Espaço não encontrado');
    }
    
    validateEmpresaAccess(this.currentContext, space.empresaId);

    // Validar se o usuário pertence à mesma empresa
    const user = users.find(u => u.id === data.userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    
    validateEmpresaAccess(this.currentContext, user.empresaId);

    // Validar consistência: usuário e espaço devem ser da mesma empresa
    if (user.empresaId !== space.empresaId) {
      throw new Error('Usuário e espaço devem pertencer à mesma empresa');
    }

    // Validar conflito de horários
    const startDateTime = new Date(data.startDate);
    const endDateTime = new Date(data.endDate);
    
    const conflictingReservations = reservations.filter(r => 
      r.spaceId === data.spaceId && 
      r.status !== 'cancelada' // Ignorar reservas canceladas
    );

    for (const existingReservation of conflictingReservations) {
      const existingStart = new Date(existingReservation.startDate);
      const existingEnd = new Date(existingReservation.endDate);
      
      // Verificar se há sobreposição de horários
      if (
        (startDateTime >= existingStart && startDateTime < existingEnd) ||
        (endDateTime > existingStart && endDateTime <= existingEnd) ||
        (startDateTime <= existingStart && endDateTime >= existingEnd)
      ) {
        throw new Error(`Conflito de horário! O espaço já está reservado de ${existingStart.toLocaleDateString('pt-BR')} até ${existingEnd.toLocaleDateString('pt-BR')}`);
      }
    }
    
    const newReservation: Reservation = {
      id: generateId('reservation'),
      ...data,
      empresaId: this.currentContext.empresaId, // Forçar empresa_id do contexto
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      space,
      user,
      empresa: empresas.find(e => e.id === this.currentContext!.empresaId),
    };
    
    reservations.push(newReservation);
    updateReservations(reservations);

    // Log de auditoria
    logAuditAction(
      this.currentContext.userId, 
      this.currentContext.empresaId, 
      'CREATE', 
      'RESERVATION', 
      newReservation.id
    );

    return newReservation;
  }

  async updateReservation(id: string, data: Partial<Reservation>) {
    await wait(150);
    if (!this.currentContext) {
      throw new Error('Usuário não autenticado');
    }

    const reservations = getReservations();
    const empresas = getEmpresas();
    const reservationIndex = reservations.findIndex((r) => r.id === id);
    
    if (reservationIndex === -1) {
      throw new Error('Reserva não encontrada');
    }

    const reservation = reservations[reservationIndex];
    
    // Validar acesso à empresa
    validateEmpresaAccess(this.currentContext, reservation.empresaId);

    // Apenas o usuário da reserva ou admin podem editar
    if (this.currentContext.userProfile !== 'admin' && this.currentContext.userId !== reservation.userId) {
      throw new Error('Apenas o usuário da reserva ou administradores podem editá-la');
    }

    // Validar conflito de horários se as datas estão sendo alteradas
    if (data.startDate || data.endDate) {
      const startDateTime = new Date(data.startDate || reservation.startDate);
      const endDateTime = new Date(data.endDate || reservation.endDate);
      
      const conflictingReservations = reservations.filter(r => 
        r.spaceId === (data.spaceId || reservation.spaceId) && 
        r.status !== 'cancelada' && // Ignorar reservas canceladas
        r.id !== id // Ignorar a própria reserva
      );

      for (const existingReservation of conflictingReservations) {
        const existingStart = new Date(existingReservation.startDate);
        const existingEnd = new Date(existingReservation.endDate);
        
        // Verificar se há sobreposição de horários
        if (
          (startDateTime >= existingStart && startDateTime < existingEnd) ||
          (endDateTime > existingStart && endDateTime <= existingEnd) ||
          (startDateTime <= existingStart && endDateTime >= existingEnd)
        ) {
          throw new Error(`Conflito de horário! O espaço já está reservado de ${existingStart.toLocaleDateString('pt-BR')} até ${existingEnd.toLocaleDateString('pt-BR')}`);
        }
      }
    }

    // Remover campos que não podem ser alterados
    const { empresaId, userId, spaceId, ...updateData } = data;

    reservations[reservationIndex] = {
      ...reservations[reservationIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    
    updateReservations(reservations);

    // Log de auditoria
    logAuditAction(
      this.currentContext.userId, 
      this.currentContext.empresaId, 
      'UPDATE', 
      'RESERVATION', 
      id,
      { changes: updateData }
    );

    return {
      ...reservations[reservationIndex],
      empresa: empresas.find(e => e.id === reservations[reservationIndex].empresaId)
    };
  }

  // Aprovar reserva (admins podem aprovar qualquer reserva, usuários podem aprovar suas próprias reservas)
  async approveReservation(id: string) {
    await wait(150);
    if (!this.currentContext) {
      throw new Error('Usuário não autenticado');
    }

    const reservations = getReservations();
    const empresas = getEmpresas();
    const reservationIndex = reservations.findIndex((r) => r.id === id);
    
    if (reservationIndex === -1) {
      throw new Error('Reserva não encontrada');
    }

    const reservation = reservations[reservationIndex];
    
    // Validar acesso à empresa
    validateEmpresaAccess(this.currentContext, reservation.empresaId);

    // Administradores podem aprovar qualquer reserva, usuários podem aprovar apenas suas próprias
    if (this.currentContext.userProfile !== 'admin' && this.currentContext.userId !== reservation.userId) {
      throw new Error('Você só pode confirmar suas próprias reservas');
    }

    // Atualizar status para confirmada
    reservations[reservationIndex] = {
      ...reservations[reservationIndex],
      status: 'confirmada',
      updatedAt: new Date().toISOString(),
    };

    updateReservations(reservations);

    // Log de auditoria
    logAuditAction(
      this.currentContext.userId, 
      this.currentContext.empresaId, 
      'APPROVE', 
      'RESERVATION', 
      id
    );

    return {
      ...reservations[reservationIndex],
      empresa: empresas.find(e => e.id === reservations[reservationIndex].empresaId)
    };
  }

  // Cancelar reserva
  async cancelReservation(id: string) {
    await wait(150);
    if (!this.currentContext) {
      throw new Error('Usuário não autenticado');
    }

    const reservations = getReservations();
    const empresas = getEmpresas();
    const reservationIndex = reservations.findIndex((r) => r.id === id);
    
    if (reservationIndex === -1) {
      throw new Error('Reserva não encontrada');
    }

    const reservation = reservations[reservationIndex];
    
    // Validar acesso à empresa
    validateEmpresaAccess(this.currentContext, reservation.empresaId);

    // Apenas o usuário da reserva ou admin podem cancelar
    if (this.currentContext.userProfile !== 'admin' && this.currentContext.userId !== reservation.userId) {
      throw new Error('Apenas o usuário da reserva ou administradores podem cancelá-la');
    }

    // Atualizar status para cancelada
    reservations[reservationIndex] = {
      ...reservations[reservationIndex],
      status: 'cancelada',
      updatedAt: new Date().toISOString(),
    };

    updateReservations(reservations);

    // Log de auditoria
    logAuditAction(
      this.currentContext.userId, 
      this.currentContext.empresaId, 
      'CANCEL', 
      'RESERVATION', 
      id
    );

    return {
      ...reservations[reservationIndex],
      empresa: empresas.find(e => e.id === reservations[reservationIndex].empresaId)
    };
  }

  // Notificações
  async getNotificacoes() {
    await wait(150);
    if (!this.currentContext) {
      throw new Error('Usuário não autenticado');
    }

    const notificacoes = getNotificacoes();
    const empresas = getEmpresas();
    
    // Filtrar apenas notificações da mesma empresa
    const empresaNotificacoes = notificacoes.filter(n => n.empresaId === this.currentContext!.empresaId);
    
    return empresaNotificacoes.map(notificacao => ({
      ...notificacao,
      empresa: empresas.find(e => e.id === notificacao.empresaId)
    }));
  }

  // Logs de auditoria
  async getAuditLogs() {
    await wait(150);
    if (!this.currentContext) {
      throw new Error('Usuário não autenticado');
    }

    // Apenas admins podem ver logs de auditoria
    if (this.currentContext.userProfile !== 'admin') {
      throw new Error('Apenas administradores podem visualizar logs de auditoria');
    }

    const auditLogs = getAuditLogs();
    
    // Filtrar apenas logs da mesma empresa
    return auditLogs.filter(log => log.empresaId === this.currentContext!.empresaId);
  }
}

export const apiService = new ApiService(); 