export const ERROR_MESSAGES = {
  AUTH: {
    INVALID_CREDENTIALS: 'E-mail ou senha inválidos',
    UNAUTHORIZED: 'Você não tem permissão para acessar esta página',
    SESSION_EXPIRED: 'Sua sessão expirou. Por favor, faça login novamente',
    REQUIRED_FIELDS: 'Preencha todos os campos obrigatórios',
  },
  VALIDATION: {
    REQUIRED: 'Campo obrigatório',
    INVALID_EMAIL: 'E-mail inválido',
    MIN_LENGTH: (field: string, length: number) =>
      `${field} deve ter no mínimo ${length} caracteres`,
    MAX_LENGTH: (field: string, length: number) =>
      `${field} deve ter no máximo ${length} caracteres`,
    MIN_VALUE: (field: string, value: number) =>
      `${field} deve ser maior que ${value}`,
    MAX_VALUE: (field: string, value: number) =>
      `${field} deve ser menor que ${value}`,
    INVALID_DATE: 'Data inválida',
    PAST_DATE: 'Data não pode ser no passado',
    FUTURE_DATE: 'Data deve ser no futuro',
    INVALID_TIME: 'Horário inválido',
    INVALID_PHONE: 'Telefone inválido',
    INVALID_CPF: 'CPF inválido',
    INVALID_CNPJ: 'CNPJ inválido',
    INVALID_CEP: 'CEP inválido',
    INVALID_PASSWORD: 'Senha inválida',
    PASSWORDS_DONT_MATCH: 'As senhas não conferem',
  },
  API: {
    NETWORK_ERROR: 'Erro de conexão. Verifique sua internet',
    SERVER_ERROR: 'Erro no servidor. Tente novamente mais tarde',
    NOT_FOUND: 'Recurso não encontrado',
    CONFLICT: 'Já existe um registro com estes dados',
    BAD_REQUEST: 'Dados inválidos',
  },
  RESERVATION: {
    SPACE_UNAVAILABLE: 'Espaço não está disponível neste horário',
    MAX_PARTICIPANTS: 'Número máximo de participantes excedido',
    MIN_PARTICIPANTS: 'Número mínimo de participantes não atingido',
    INVALID_DATES: 'Datas inválidas',
    INVALID_STATUS: 'Status inválido',
  },
  SPACE: {
    ALREADY_EXISTS: 'Já existe um espaço com este nome',
    NOT_FOUND: 'Espaço não encontrado',
    INVALID_STATUS: 'Status inválido',
  },
  USER: {
    ALREADY_EXISTS: 'Já existe um usuário com este e-mail',
    NOT_FOUND: 'Usuário não encontrado',
    INVALID_PROFILE: 'Perfil inválido',
  },
} as const; 