import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

async function fixDataColumn() {
  try {
    console.log('🔧 Alterando tipo da coluna data para TEXT...')
    
    const projectId = 'pwksgdjjkryqryqrvyja'
    const accessToken = process.env.SUPABASE_ACCESS_TOKEN || ''

if (!accessToken) {
  console.error('❌ SUPABASE_ACCESS_TOKEN não encontrado nas variáveis de ambiente')
  process.exit(1)
}

    
    // SQL para alterar a coluna
    const sql = `ALTER TABLE dre_hitss ALTER COLUMN data TYPE TEXT USING data::TEXT;`
    
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectId}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    })
    
    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Erro ao alterar coluna:', error)
      return
    }
    
    const result = await response.json()
    console.log('✅ Coluna data alterada com sucesso!')
    console.log('📋 Tipo alterado: DATE → TEXT')
    console.log('✅ Agora suporta formato "M/YYYY"')
    console.log('📊 Pronto para testar o upload DRE!')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

fixDataColumn() 