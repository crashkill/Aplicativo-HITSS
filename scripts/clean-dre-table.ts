import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function cleanDRETable() {
  try {
    console.log('🧹 Limpando tabela DRE-HITSS...')
    
    const { error } = await supabase
      .from('dre_hitss')
      .delete()
      .neq('id', 0) // Delete all records
    
    if (error) {
      console.error('❌ Erro ao limpar tabela:', error)
      return
    }
    
    console.log('✅ Tabela DRE-HITSS limpa com sucesso!')
    console.log('📊 Pronta para receber novos dados!')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

cleanDRETable() 