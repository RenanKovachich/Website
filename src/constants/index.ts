export const APP_NAME = 'LinkSpace';

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  UNAUTHORIZED: '/unauthorized',
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    SPACES: '/admin/spaces',
    RESERVATIONS: '/admin/reservations',
  },
  USER: {
    DASHBOARD: '/usuario/dashboard',
    RESERVATIONS: '/usuario/reservations',
    PROFILE: '/usuario/profile',
  },
} as const;

export const USER_PROFILES = {
  ADMIN: 'admin',
  USER: 'usuario',
} as const;

export const SPACE_STATUS = {
  ACTIVE: 'ativo',
  INACTIVE: 'inativo',
} as const;

export const RESERVATION_STATUS = {
  PENDING: 'pendente',
  CONFIRMED: 'confirmada',
  CANCELLED: 'cancelada',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
  },
  USERS: '/users',
  SPACES: '/spaces',
  RESERVATIONS: '/reservations',
} as const;

export const STORAGE_KEYS = {
  TOKEN: '@LinkSpace:token',
  USER: '@LinkSpace:user',
} as const; 