import { writeFileSync } from 'fs';
import { join } from 'path';

// Dados sintéticos para popular o localStorage (Multi-tenant)
const seedData = {
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
    {
      id: '3',
      nome: 'Inovação Ltda',
      cnpj: '11.222.333/0001-44',
      email: 'contato@inovacao.com',
      telefone: '(11) 77777-7777',
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
    {
      id: '4',
      name: 'João Silva',
      email: 'joao@techcorp.com',
      password: 'joao123',
      profile: 'usuario',
      empresaId: '2',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '5',
      name: 'Maria Santos',
      email: 'maria@inovacao.com',
      password: 'maria123',
      profile: 'admin',
      empresaId: '3',
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
      description: 'Sala de reunião para pequenos grupos com projetor e quadro branco',
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
      description: 'Auditório para eventos e apresentações com sistema de som',
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
      description: 'Espaço colaborativo TechCorp com mesas compartilhadas',
      empresaId: '2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'Laboratório Inovação',
      type: 'escritorio',
      capacity: 15,
      status: 'active',
      description: 'Laboratório de inovação com equipamentos modernos',
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
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Amanhã
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // Amanhã + 2h
      participants: 5,
      description: 'Reunião de planejamento do projeto',
      status: 'confirmada',
      empresaId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      spaceId: '3',
      userId: '4',
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Depois de amanhã
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(), // Depois de amanhã + 3h
      participants: 15,
      description: 'Workshop de desenvolvimento',
      status: 'pendente',
      empresaId: '2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  notificacoes: [
    {
      id: '1',
      reservaId: '1',
      tipo: 'confirmacao',
      titulo: 'Reserva Confirmada',
      mensagem: 'Sua reserva para "Sala de Reunião 1" foi confirmada para amanhã às 10:00.',
      lida: false,
      empresaId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  auditLogs: [
    {
      id: '1',
      userId: '1',
      empresaId: '1',
      action: 'LOGIN',
      resource: 'USER',
      resourceId: '1',
      details: { ipAddress: '127.0.0.1' },
      createdAt: new Date().toISOString(),
    },
  ],
};

// Cria o arquivo de seed
const seedPath = join(__dirname, '..', 'src', 'data', 'seed.json');
writeFileSync(seedPath, JSON.stringify(seedData, null, 2));

console.log('✅ Dados de seed multi-tenant criados com sucesso!');
console.log(`📁 Arquivo salvo em: ${seedPath}`);
console.log('\n📊 Resumo dos dados:');
console.log(`🏢 Empresas: ${seedData.empresas.length}`);
console.log(`👥 Usuários: ${seedData.users.length}`);
console.log(`🏢 Espaços: ${seedData.spaces.length}`);
console.log(`📅 Reservas: ${seedData.reservations.length}`);
console.log(`🔔 Notificações: ${seedData.notificacoes.length}`);
console.log(`📋 Logs de Auditoria: ${seedData.auditLogs.length}`);
console.log('\n🔑 Credenciais de teste por empresa:');
console.log('\n🏢 LinkSpace (ID: 1):');
console.log('  Admin: admin@linkspace.com / admin123');
console.log('  Usuário: user@linkspace.com / user123');
console.log('\n🏢 TechCorp (ID: 2):');
console.log('  Admin: admin@techcorp.com / admin123');
console.log('  Usuário: joao@techcorp.com / joao123');
console.log('\n🏢 Inovação Ltda (ID: 3):');
console.log('  Admin: maria@inovacao.com / maria123');
console.log('\n🔒 Funcionalidades Multi-tenant:');
console.log('  ✅ Isolamento por empresa');
console.log('  ✅ RBAC por empresa');
console.log('  ✅ Auditoria com empresa_id');
console.log('  ✅ Validação cross-empresa');
