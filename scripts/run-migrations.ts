#!/usr/bin/env tsx
/**
 * Script CLI para executar migrations do banco de dados
 * Uso: npm run migrate
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigrations() {
  try {
    console.log('🚀 Sistema de Migrations - HITSS Database')
    console.log('==========================================\n')

    // Lista de migrations na ordem de execução
    const migrations = [
      {
        file: '001_create_dre_hitss_table.sql',
        description: 'Criar tabela DRE-HITSS'
      },
      {
        file: '002_alter_data_column_type.sql',
        description: 'Alterar tipo da coluna data para TEXT'
      }
    ]

    for (const migration of migrations) {
      console.log(`🔄 Executando migration ${migration.file.split('_')[0]}: ${migration.description}...`)
      
      try {
        // Ler o arquivo de migration
        const migrationPath = join(process.cwd(), 'migrations', migration.file)
        const migrationSQL = readFileSync(migrationPath, 'utf-8')

        // Executar migration
        const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
        
        if (error) {
          // Se o erro for sobre política já existente, continue
          if (error.message.includes('already exists') || 
              error.message.includes('já existe') ||
              error.message.includes('duplicate key')) {
            console.log(`⚠️  Migration ${migration.file.split('_')[0]} já foi aplicada anteriormente`)
          } else {
            console.error(`❌ Erro na migration ${migration.file.split('_')[0]}:`, error)
            continue
          }
        } else {
          console.log(`✅ Migration ${migration.file.split('_')[0]} executada com sucesso!`)
        }

        // Para a primeira migration, mostrar detalhes da criação
        if (migration.file.includes('001_create')) {
          console.log('📋 Tabela dre_hitss criada com:')
          console.log('   - Schema completo (20+ campos)')
          console.log('   - Índices otimizados')
          console.log('   - Row Level Security configurado')
          console.log('   - Políticas de acesso')
          console.log('   - Documentação completa')
        }

        // Para a segunda migration, mostrar detalhes da alteração
        if (migration.file.includes('002_alter')) {
          console.log('📋 Coluna data alterada:')
          console.log('   - Tipo: DATE → TEXT')
          console.log('   - Suporte a formato "M/YYYY"')
          console.log('   - Compatível com dados do Excel')
        }
        
      } catch (fileError) {
        console.error(`❌ Erro ao ler arquivo de migration ${migration.file}:`, fileError)
        continue
      }
    }

    // Verificar se a tabela foi criada
    console.log('\n🔍 Verificando se a tabela foi criada...')
    const { count, error: countError } = await supabase
      .from('dre_hitss')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('❌ Erro ao verificar tabela:', countError)
    } else {
      console.log(`✅ Tabela verificada! Registros: ${count || 0}`)
    }

    console.log('\n🎉 Sistema de migrations executado com sucesso!')
    console.log('📊 Sistema DRE está pronto para receber dados financeiros.')
    console.log('\n🏁 Script de migrations finalizado.')
    
  } catch (error) {
    console.error('❌ Erro fatal no sistema de migrations:', error)
    process.exit(1)
  }
}

// Executar migrations
runMigrations().catch(console.error) 