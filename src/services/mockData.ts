import { User, Space, Reservation } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Administrador',
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
    name: 'Usuário Teste',
    email: 'usuario@linkspace.com',
    password: 'usuario123',
    profile: 'usuario',
    empresaId: '1',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockSpaces: Space[] = [
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
];

export const mockReservations: Reservation[] = [
  {
    id: '1',
    spaceId: '1',
    userId: '2',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 3600000).toISOString(),
    participants: 5,
    description: 'Reunião de equipe',
    status: 'confirmada',
    empresaId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    space: mockSpaces[0],
    user: mockUsers[1],
  },
]; 