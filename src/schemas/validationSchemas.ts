import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('E-mail inválido')
    .required('E-mail é obrigatório'),
  password: yup
    .string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .required('Senha é obrigatória'),
});

export const registerSchema = yup.object().shape({
  name: yup
    .string()
    .required('Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: yup
    .string()
    .email('E-mail inválido')
    .required('E-mail é obrigatório'),
  password: yup
    .string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .required('Senha é obrigatória'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'As senhas não conferem')
    .required('Confirmação de senha é obrigatória'),
  companyName: yup
    .string()
    .required('Nome da empresa é obrigatório'),
  phone: yup
    .string()
    .required('Telefone é obrigatório')
    .matches(/^\(\d{2}\) \d{5}-\d{4}$/, 'Formato inválido. Use (99) 99999-9999'),
});

export const spaceSchema = yup.object().shape({
  name: yup
    .string()
    .required('Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres'),
  description: yup
    .string()
    .required('Descrição é obrigatória')
    .min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  capacity: yup
    .number()
    .required('Capacidade é obrigatória')
    .min(1, 'Capacidade deve ser maior que 0'),
  location: yup
    .string()
    .required('Localização é obrigatória'),
  status: yup
    .string()
    .oneOf(['ativo', 'inativo'], 'Status inválido')
    .required('Status é obrigatório'),
});

export const reservationSchema = yup.object().shape({
  spaceId: yup
    .string()
    .required('Espaço é obrigatório'),
  startDate: yup
    .date()
    .required('Data de início é obrigatória')
    .min(new Date(), 'Data de início deve ser maior que a data atual'),
  endDate: yup
    .date()
    .required('Data de término é obrigatória')
    .min(yup.ref('startDate'), 'Data de término deve ser maior que a data de início'),
  participants: yup
    .number()
    .required('Número de participantes é obrigatório')
    .min(1, 'Número de participantes deve ser maior que 0'),
  description: yup
    .string()
    .required('Descrição é obrigatória')
    .min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  status: yup
    .string()
    .oneOf(['pendente', 'confirmada', 'cancelada'], 'Status inválido')
    .required('Status é obrigatório'),
});

export const userSchema = yup.object().shape({
  name: yup
    .string()
    .required('Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: yup
    .string()
    .email('E-mail inválido')
    .required('E-mail é obrigatório'),
  profile: yup
    .string()
    .oneOf(['admin', 'usuario'], 'Perfil inválido')
    .required('Perfil é obrigatório'),
  role: yup
    .string()
    .required('Cargo é obrigatório'),
  department: yup
    .string()
    .required('Departamento é obrigatório'),
}); 