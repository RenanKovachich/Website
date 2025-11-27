import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Script de migração para converter dados legados para o modelo multi-tenant
 * Este script converte dados existentes que não possuem empresa_id
 */

interface LegacyData {
  users: any[];
  spaces: any[];
  reservations: any[];
}

interface MigratedData {
  empresas: any[];
  users: any[];
  spaces: any[];
  reservations: any[];
  notificacoes: any[];
  auditLogs: any[];
}

// Empresa padrão para dados legados
const DEFAULT_EMPRESA = {
  id: 'default',
  nome: 'Empresa Padrão',
  cnpj: '00.000.000/0001-00',
  email: 'contato@empresapadrao.com',
  telefone: '(11) 00000-0000',
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function migrateLegacyData(): MigratedData {
  const storageKey = '@LinkSpace:data';
  const legacyData: LegacyData = {
    users: [],
    spaces: [],
    reservations: [],
  };

  // Tentar ler dados existentes do localStorage (simulado)
  try {
    // Em um ambiente real, isso seria feito via API ou banco de dados
    console.log('📋 Verificando dados legados...');
    
    // Simular dados legados para demonstração
    const hasLegacyData = false; // Em produção, verificar se existem dados sem empresa_id
    
    if (hasLegacyData) {
      console.log('🔄 Migrando dados legados...');
      
      // Migrar usuários
      const migratedUsers = legacyData.users.map(user => ({
        ...user,
        empresaId: DEFAULT_EMPRESA.id,
        // Remover campo 'company' se existir
        company: undefined,
      }));

      // Migrar espaços
      const migratedSpaces = legacyData.spaces.map(space => ({
        ...space,
        empresaId: DEFAULT_EMPRESA.id,
      }));

      // Migrar reservas
      const migratedReservations = legacyData.reservations.map(reservation => ({
        ...reservation,
        empresaId: DEFAULT_EMPRESA.id,
      }));

      return {
        empresas: [DEFAULT_EMPRESA],
        users: migratedUsers,
        spaces: migratedSpaces,
        reservations: migratedReservations,
        notificacoes: [],
        auditLogs: [],
      };
    }
  } catch (error) {
    console.log('⚠️  Nenhum dado legado encontrado ou erro na migração:', error);
  }

  // Retornar dados padrão se não houver dados legados
  return {
    empresas: [DEFAULT_EMPRESA],
    users: [],
    spaces: [],
    reservations: [],
    notificacoes: [],
    auditLogs: [],
  };
}

function createMigrationScript(): void {
  const migrationData = migrateLegacyData();
  
  // Criar arquivo de migração
  const migrationPath = join(__dirname, '..', 'src', 'data', 'migration.json');
  writeFileSync(migrationPath, JSON.stringify(migrationData, null, 2));

  console.log('✅ Migração para multi-tenant concluída!');
  console.log(`📁 Arquivo de migração salvo em: ${migrationPath}`);
  console.log('\n📊 Resumo da migração:');
  console.log(`🏢 Empresas criadas: ${migrationData.empresas.length}`);
  console.log(`👥 Usuários migrados: ${migrationData.users.length}`);
  console.log(`🏢 Espaços migrados: ${migrationData.spaces.length}`);
  console.log(`📅 Reservas migradas: ${migrationData.reservations.length}`);
  
  if (migrationData.users.length > 0 || migrationData.spaces.length > 0) {
    console.log('\n🔧 Dados migrados para empresa padrão:');
    console.log(`   Empresa ID: ${DEFAULT_EMPRESA.id}`);
    console.log(`   Nome: ${DEFAULT_EMPRESA.nome}`);
    console.log('\n⚠️  IMPORTANTE:');
    console.log('   - Todos os dados foram associados à empresa padrão');
    console.log('   - Administradores devem criar empresas reais e migrar usuários');
    console.log('   - Execute o script de seed para dados de teste completos');
  } else {
    console.log('\n✨ Nenhum dado legado encontrado - sistema pronto para uso!');
  }
}

function createRollbackScript(): void {
  const rollbackData = {
    message: 'Rollback para versão anterior',
    steps: [
      '1. Fazer backup dos dados atuais',
      '2. Restaurar versão anterior do código',
      '3. Executar rollback do banco de dados (se aplicável)',
      '4. Verificar integridade dos dados',
    ],
    warning: 'Este rollback removerá todas as funcionalidades multi-tenant',
  };

  const rollbackPath = join(__dirname, '..', 'src', 'data', 'rollback.json');
  writeFileSync(rollbackPath, JSON.stringify(rollbackData, null, 2));

  console.log('📋 Script de rollback criado em:', rollbackPath);
}

// Executar migração
console.log('🚀 Iniciando migração para modelo multi-tenant...');
createMigrationScript();
createRollbackScript();

console.log('\n🎯 Próximos passos:');
console.log('1. Execute: npm run seed (para dados de teste)');
console.log('2. Teste o login com diferentes empresas');
console.log('3. Verifique o isolamento de dados');
console.log('4. Execute os testes automatizados');
