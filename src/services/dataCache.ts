// Cache Service para otimização de carregamento de dados
import { dreSupabaseService, type DRERecord } from './dreSupabaseService'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live em milliseconds
}

class DataCacheService {
  private cache = new Map<string, CacheEntry<any>>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutos
  
  // Cache dos dados principais
  private allRecordsCache: DRERecord[] | null = null
  private lastFetchTime = 0
  private isFetching = false
  
  /**
   * Busca todos os registros com cache inteligente
   */
  async getAllRecords(forceRefresh = false): Promise<DRERecord[]> {
    const now = Date.now()
    const cacheAge = now - this.lastFetchTime
    
    // Se tem cache válido e não é refresh forçado
    if (!forceRefresh && this.allRecordsCache && cacheAge < this.DEFAULT_TTL) {
      console.log('📦 Usando dados do cache', { 
        records: this.allRecordsCache.length,
        ageMinutes: Math.floor(cacheAge / 60000)
      })
      return this.allRecordsCache
    }
    
    // Se já está buscando, aguarda
    if (this.isFetching) {
      console.log('⏳ Aguardando fetch em progresso...')
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!this.isFetching && this.allRecordsCache) {
            clearInterval(checkInterval)
            resolve(this.allRecordsCache)
          }
        }, 100)
      })
    }
    
    // Buscar dados frescos
    this.isFetching = true
    console.log('🔄 Carregando dados frescos do Supabase...')
    
    try {
      const records = await dreSupabaseService.getAllRecords()
      this.allRecordsCache = records
      this.lastFetchTime = now
      
      console.log('✅ Cache atualizado', { 
        records: records.length,
        timestamp: new Date(now).toLocaleTimeString()
      })
      
      return records
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
      // Retorna cache antigo se existir
      return this.allRecordsCache || []
    } finally {
      this.isFetching = false
    }
  }
  
  /**
   * Busca dados filtrados com cache
   */
  async getFilteredRecords(filters: {
    year?: number
    projects?: string[]
    type?: 'receita' | 'despesa'
  }): Promise<DRERecord[]> {
    const cacheKey = JSON.stringify(filters)
    const cached = this.get<DRERecord[]>(cacheKey)
    
    if (cached) {
      console.log('📦 Dados filtrados do cache:', filters)
      return cached
    }
    
    const allRecords = await this.getAllRecords()
    const filtered = allRecords.filter(record => {
      // Filtro por ano
      if (filters.year) {
        const [, recordYear] = (record.periodo || '').split('/')
        if (parseInt(recordYear) !== filters.year) return false
      }
      
      // Filtro por projetos
      if (filters.projects && filters.projects.length > 0) {
        const projectName = record.projeto || record.descricao || 'Sem Projeto'
        if (!filters.projects.includes(projectName)) return false
      }
      
      // Filtro por tipo
      if (filters.type && record.tipo !== filters.type) return false
      
      return true
    })
    
    this.set(cacheKey, filtered, this.DEFAULT_TTL)
    console.log('💾 Cache filtrado salvo:', { filters, count: filtered.length })
    
    return filtered
  }
  
  /**
   * Busca projetos únicos com cache
   */
  async getUniqueProjects(): Promise<string[]> {
    const cached = this.get<string[]>('unique-projects')
    if (cached) return cached
    
    const records = await this.getAllRecords()
    const projects = Array.from(new Set(
      records.map(r => r.projeto || r.descricao || 'Sem Projeto')
    )).sort()
    
    this.set('unique-projects', projects, this.DEFAULT_TTL)
    return projects
  }
  
  /**
   * Busca anos únicos com cache
   */
  async getUniqueYears(): Promise<number[]> {
    const cached = this.get<number[]>('unique-years')
    if (cached) return cached
    
    const records = await this.getAllRecords()
    const years = Array.from(new Set(
      records.map(r => {
        const [, year] = (r.periodo || '').split('/')
        return parseInt(year)
      }).filter(y => !isNaN(y))
    )).sort((a, b) => b - a)
    
    this.set('unique-years', years, this.DEFAULT_TTL)
    return years
  }
  
  /**
   * Cache genérico
   */
  private set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }
  
  private get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    const age = Date.now() - entry.timestamp
    if (age > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data as T
  }
  
  /**
   * Limpa todo o cache
   */
  clearCache(): void {
    this.cache.clear()
    this.allRecordsCache = null
    this.lastFetchTime = 0
    console.log('🗑️ Cache limpo')
  }
  
  /**
   * Força refresh do cache principal
   */
  async refreshCache(): Promise<void> {
    await this.getAllRecords(true)
  }
}

// Instância singleton
export const dataCache = new DataCacheService() 