import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiService } from '../api';
import { User, Empresa, Space, Reservation } from '../../types';

// Mock localStorage
let mockStorage: Record<string, string> = {};

const localStorageMock = {
  getItem: vi.fn((key: string) => mockStorage[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockStorage[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockStorage[key];
  }),
  clear: vi.fn(() => {
    mockStorage = {};
  }),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('API Service - Multi-tenant', () => {
  const mockEmpresa1: Empresa = {
    id: '1',
    nome: 'LinkSpace',
    cnpj: '12.345.678/0001-90',
    email: 'contato@linkspace.com',
    telefone: '(11) 99999-9999',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockEmpresa2: Empresa = {
    id: '2',
    nome: 'TechCorp',
    cnpj: '98.765.432/0001-10',
    email: 'contato@techcorp.com',
    telefone: '(11) 88888-8888',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockUser1: User = {
    id: '1',
    name: 'Admin LinkSpace',
    email: 'admin@linkspace.com',
    password: 'admin123',
    profile: 'admin',
    empresaId: '1',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockUser2: User = {
    id: '2',
    name: 'User TechCorp',
    email: 'user@techcorp.com',
    password: 'user123',
    profile: 'usuario',
    empresaId: '2',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockSpace1: Space = {
    id: '1',
    name: 'Sala LinkSpace',
    type: 'sala_reuniao',
    capacity: 10,
    status: 'active',
    description: 'Sala da empresa LinkSpace',
    empresaId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockSpace2: Space = {
    id: '2',
    name: 'Sala TechCorp',
    type: 'auditorio',
    capacity: 50,
    status: 'active',
    description: 'Sala da empresa TechCorp',
    empresaId: '2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    // Limpar contexto antes de cada teste
    apiService.clearContext();
    
    // Mock dos dados armazenados
    const mockStoredData = {
      empresas: [mockEmpresa1, mockEmpresa2],
      users: [mockUser1, mockUser2],
      spaces: [mockSpace1, mockSpace2],
      reservations: [],
      notificacoes: [],
      auditLogs: [],
    };

    // Limpar storage e definir dados iniciais
    mockStorage = {};
    mockStorage['@LinkSpace:data'] = JSON.stringify(mockStoredData);
  });

  describe('Autenticação Multi-tenant', () => {
    it('deve fazer login e definir contexto da empresa', async () => {
      const loginData = {
        email: 'admin@linkspace.com',
        password: 'admin123',
      };

      const result = await apiService.login(loginData);
      
      expect(result.data).toEqual({
        ...mockUser1,
        empresa: mockEmpresa1,
      });

      const context = apiService.getContext();
      expect(context).toEqual({
        empresaId: '1',
        userId: '1',
        userProfile: 'admin',
      });
    });

    it('deve falhar login com credenciais inválidas', async () => {
      const loginData = {
        email: 'admin@linkspace.com',
        password: 'senhaerrada',
      };

      await expect(apiService.login(loginData)).rejects.toThrow('Credenciais inválidas');
    });
  });

  describe('Isolamento por Empresa', () => {
    beforeEach(async () => {
      // Fazer login como admin da empresa 1
      await apiService.login({
        email: 'admin@linkspace.com',
        password: 'admin123',
      });
    });

    it('deve retornar apenas usuários da mesma empresa', async () => {
      const users = await apiService.getUsers();
      
      expect(users).toHaveLength(1);
      expect(users[0].empresaId).toBe('1');
      expect(users[0].name).toBe('Admin LinkSpace');
    });

    it('deve retornar apenas espaços da mesma empresa', async () => {
      const spaces = await apiService.getSpaces();
      
      expect(spaces).toHaveLength(1);
      expect(spaces[0].empresaId).toBe('1');
      expect(spaces[0].name).toBe('Sala LinkSpace');
    });

    it('deve criar usuário apenas na empresa do contexto', async () => {
      const newUserData = {
        name: 'Novo Usuário',
        email: 'novo@linkspace.com',
        password: 'novo123',
        profile: 'usuario' as const,
        status: 'active' as const,
      };

      const newUser = await apiService.createUser(newUserData);
      
      expect(newUser.empresaId).toBe('1');
      expect(newUser.name).toBe('Novo Usuário');
    });

    it('deve criar espaço apenas na empresa do contexto', async () => {
      const newSpaceData = {
        name: 'Nova Sala',
        type: 'coworking' as const,
        capacity: 15,
        status: 'active' as const,
        description: 'Nova sala de coworking',
      };

      const newSpace = await apiService.createSpace(newSpaceData);
      
      expect(newSpace.empresaId).toBe('1');
      expect(newSpace.name).toBe('Nova Sala');
    });
  });

  describe('Validação Cross-Empresa', () => {
    beforeEach(async () => {
      // Fazer login como admin da empresa 1
      await apiService.login({
        email: 'admin@linkspace.com',
        password: 'admin123',
      });
    });

    it('deve falhar ao tentar criar reserva com espaço de outra empresa', async () => {
      const reservationData = {
        spaceId: '2', // Espaço da empresa 2
        userId: '1', // Usuário da empresa 1
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        participants: 5,
        description: 'Reunião teste',
        status: 'pendente' as const,
      };

      await expect(apiService.createReservation(reservationData))
        .rejects.toThrow('Acesso negado: recurso pertence a outra empresa');
    });

    it('deve falhar ao tentar criar reserva com usuário de outra empresa', async () => {
      const reservationData = {
        spaceId: '1', // Espaço da empresa 1
        userId: '2', // Usuário da empresa 2
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        participants: 5,
        description: 'Reunião teste',
        status: 'pendente' as const,
      };

      await expect(apiService.createReservation(reservationData))
        .rejects.toThrow('Acesso negado: recurso pertence a outra empresa');
    });
  });

  describe('RBAC por Empresa', () => {
    it('deve permitir que admin crie usuários', async () => {
      await apiService.login({
        email: 'admin@linkspace.com',
        password: 'admin123',
      });

      const newUserData = {
        name: 'Novo Usuário',
        email: 'novo@linkspace.com',
        password: 'novo123',
        profile: 'usuario' as const,
        status: 'active' as const,
      };

      const newUser = await apiService.createUser(newUserData);
      expect(newUser).toBeDefined();
      expect(newUser.empresaId).toBe('1');
    });

    it('deve permitir que admin crie espaços', async () => {
      await apiService.login({
        email: 'admin@linkspace.com',
        password: 'admin123',
      });

      const newSpaceData = {
        name: 'Nova Sala',
        type: 'sala_reuniao' as const,
        capacity: 10,
        status: 'active' as const,
        description: 'Nova sala de reunião',
      };

      const newSpace = await apiService.createSpace(newSpaceData);
      expect(newSpace).toBeDefined();
      expect(newSpace.empresaId).toBe('1');
    });

    it('deve negar acesso a usuário comum para criar usuários', async () => {
      // Fazer login como usuário comum da empresa 2
      await apiService.login({
        email: 'user@techcorp.com',
        password: 'user123',
      });

      const newUserData = {
        name: 'Novo Usuário',
        email: 'novo@techcorp.com',
        password: 'novo123',
        profile: 'usuario' as const,
        status: 'active' as const,
      };

      await expect(apiService.createUser(newUserData))
        .rejects.toThrow('Apenas administradores podem criar usuários');
    });

    it('deve negar acesso a usuário comum para criar espaços', async () => {
      // Fazer login como usuário comum da empresa 2
      await apiService.login({
        email: 'user@techcorp.com',
        password: 'user123',
      });

      const newSpaceData = {
        name: 'Nova Sala',
        type: 'sala_reuniao' as const,
        capacity: 10,
        status: 'active' as const,
        description: 'Nova sala de reunião',
      };

      await expect(apiService.createSpace(newSpaceData))
        .rejects.toThrow('Apenas administradores podem criar espaços');
    });
  });

  describe('Auditoria', () => {
    it('deve registrar log de auditoria ao fazer login', async () => {
      await apiService.login({
        email: 'admin@linkspace.com',
        password: 'admin123',
      });

      const auditLogs = await apiService.getAuditLogs();
      
      expect(auditLogs).toHaveLength(1);
      expect(auditLogs[0].action).toBe('LOGIN');
      expect(auditLogs[0].empresaId).toBe('1');
      expect(auditLogs[0].userId).toBe('1');
    });

    it('deve registrar log de auditoria ao criar usuário', async () => {
      await apiService.login({
        email: 'admin@linkspace.com',
        password: 'admin123',
      });

      const newUserData = {
        name: 'Novo Usuário',
        email: 'novo@linkspace.com',
        password: 'novo123',
        profile: 'usuario' as const,
        status: 'active' as const,
      };

      await apiService.createUser(newUserData);

      const auditLogs = await apiService.getAuditLogs();
      const createLog = auditLogs.find(log => log.action === 'CREATE' && log.resource === 'USER');
      
      expect(createLog).toBeDefined();
      expect(createLog?.empresaId).toBe('1');
    });

    it('deve negar acesso a logs de auditoria para usuário comum', async () => {
      await apiService.login({
        email: 'user@techcorp.com',
        password: 'user123',
      });

      await expect(apiService.getAuditLogs())
        .rejects.toThrow('Apenas administradores podem visualizar logs de auditoria');
    });
  });

  describe('Contexto de Empresa', () => {
    it('deve limpar contexto ao fazer logout', () => {
      apiService.setContext(mockUser1);
      expect(apiService.getContext()).toBeDefined();

      apiService.clearContext();
      expect(apiService.getContext()).toBeNull();
    });

    it('deve definir contexto corretamente', () => {
      apiService.setContext(mockUser1);
      
      const context = apiService.getContext();
      expect(context).toEqual({
        empresaId: '1',
        userId: '1',
        userProfile: 'admin',
      });
    });
  });
});
