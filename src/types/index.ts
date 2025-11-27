// Entidade Empresa (Multi-tenant)
export interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  profile: 'admin' | 'usuario';
  empresaId: string; // FK para Empresa
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  empresa?: Empresa; // Relacionamento opcional
}

export interface Space {
  id: string;
  name: string;
  type: 'sala_reuniao' | 'auditorio' | 'escritorio' | 'coworking';
  capacity: number;
  status: 'active' | 'inactive';
  description: string;
  image?: string;
  amenities?: string[];
  empresaId: string; // FK para Empresa
  createdAt: string;
  updatedAt: string;
  empresa?: Empresa; // Relacionamento opcional
}

export interface Reservation {
  id: string;
  spaceId: string;
  userId: string;
  startDate: string;
  endDate: string;
  participants: number;
  description: string;
  status: 'pendente' | 'confirmada' | 'cancelada';
  empresaId: string; // FK para Empresa (derivado do usuário/espaço)
  createdAt: string;
  updatedAt: string;
  space?: Space;
  user?: User;
  empresa?: Empresa; // Relacionamento opcional
}

// Entidade Notificação de Reserva
export interface NotificacaoReserva {
  id: string;
  reservaId: string;
  tipo: 'confirmacao' | 'lembrete' | 'cancelamento' | 'alteracao';
  titulo: string;
  mensagem: string;
  lida: boolean;
  empresaId: string; // FK para Empresa
  createdAt: string;
  updatedAt: string;
  reserva?: Reservation; // Relacionamento opcional
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  empresaId: string; // ID da empresa (selecionada ou criada)
}

export interface EmpresaFormValues {
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
}

export interface SpaceFormValues {
  name: string;
  type: Space['type'];
  capacity: number;
  description: string;
}

export interface ReservationFormValues {
  spaceId: string;
  startDate: string;
  endDate: string;
  participants: number;
  description: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
}

// Contexto de autenticação com empresa
export interface AuthContext {
  user: User | null;
  empresa: Empresa | null;
  empresaId: string | null;
  isAdmin: boolean;
  isUser: boolean;
}

// Tipos para validação de acesso cross-empresa
export interface CrossEmpresaError extends Error {
  code: 'CROSS_EMPRESA_ACCESS';
  empresaId: string;
  resourceEmpresaId: string;
}

// Tipos para auditoria
export interface AuditLog {
  id: string;
  userId: string;
  empresaId: string;
  action: string;
  resource: string;
  resourceId: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
} 