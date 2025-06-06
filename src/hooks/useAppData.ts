// Hook unificado para dados da aplicação
import { useState, useEffect, useCallback } from 'react'
import { dataCache } from '../services/dataCache'
import type { DRERecord } from '../services/dreSupabaseService'

interface UseAppDataOptions {
  autoLoad?: boolean
  filters?: {
    year?: number
    projects?: string[]
    type?: 'receita' | 'despesa'
  }
}

interface AppDataState {
  // Dados principais
  allRecords: DRERecord[]
  filteredRecords: DRERecord[]
  
  // Metadados
  projects: string[]
  years: number[]
  
  // Estados de carregamento
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  
  // Informações do cache
  lastUpdated: Date | null
  cacheStatus: 'fresh' | 'cached' | 'stale'
}

export const useAppData = (options: UseAppDataOptions = {}) => {
  const { autoLoad = true, filters } = options
  
  const [state, setState] = useState<AppDataState>({
    allRecords: [],
    filteredRecords: [],
    projects: [],
    years: [],
    isLoading: false,
    isRefreshing: false,
    error: null,
    lastUpdated: null,
    cacheStatus: 'stale'
  })
  
  /**
   * Carrega dados básicos (projetos e anos)
   */
  const loadMetadata = useCallback(async () => {
    try {
      const [projects, years] = await Promise.all([
        dataCache.getUniqueProjects(),
        dataCache.getUniqueYears()
      ])
      
      setState(prev => ({
        ...prev,
        projects,
        years,
        error: null
      }))
      
      return { projects, years }
    } catch (error) {
      console.error('Erro ao carregar metadados:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }))
      throw error
    }
  }, [])
  
  /**
   * Carrega todos os dados
   */
  const loadAllData = useCallback(async (forceRefresh = false) => {
    setState(prev => ({ 
      ...prev, 
      isLoading: !prev.allRecords.length, 
      isRefreshing: !!prev.allRecords.length 
    }))
    
    try {
      const records = await dataCache.getAllRecords(forceRefresh)
      
      setState(prev => ({
        ...prev,
        allRecords: records,
        isLoading: false,
        isRefreshing: false,
        error: null,
        lastUpdated: new Date(),
        cacheStatus: forceRefresh ? 'fresh' : 'cached'
      }))
      
      return records
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar dados'
      }))
      throw error
    }
  }, [])
  
  /**
   * Carrega dados filtrados
   */
  const loadFilteredData = useCallback(async (filterOptions = filters) => {
    if (!filterOptions) {
      setState(prev => ({ ...prev, filteredRecords: prev.allRecords }))
      return state.allRecords
    }
    
    try {
      const filtered = await dataCache.getFilteredRecords(filterOptions)
      
      setState(prev => ({
        ...prev,
        filteredRecords: filtered,
        error: null
      }))
      
      return filtered
    } catch (error) {
      console.error('Erro ao filtrar dados:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao filtrar dados'
      }))
      throw error
    }
  }, [filters])
  
  /**
   * Recarrega todos os dados
   */
  const refresh = useCallback(async () => {
    await Promise.all([
      loadAllData(true),
      loadMetadata()
    ])
    
    if (filters) {
      await loadFilteredData()
    }
  }, [loadAllData, loadMetadata, loadFilteredData, filters])
  
  /**
   * Limpa cache e recarrega
   */
  const clearCacheAndReload = useCallback(async () => {
    dataCache.clearCache()
    await refresh()
  }, [refresh])
  
  // Carregamento inicial
  useEffect(() => {
    if (!autoLoad) return
    
    const initializeData = async () => {
      try {
        await loadMetadata()
        await loadAllData()
        
        if (filters) {
          await loadFilteredData()
        }
      } catch (error) {
        console.error('Erro na inicialização:', error)
      }
    }
    
    initializeData()
  }, [autoLoad, loadMetadata, loadAllData, loadFilteredData])
  
  // Atualiza filtros quando mudam
  useEffect(() => {
    if (filters && state.allRecords.length > 0) {
      loadFilteredData()
    }
  }, [filters?.year, filters?.projects?.join(','), filters?.type, loadFilteredData])
  
  return {
    // Estado
    ...state,
    
    // Dados computados
    totalRecords: state.allRecords.length,
    filteredCount: state.filteredRecords.length,
    
    // Ações
    refresh,
    clearCacheAndReload,
    loadMetadata,
    loadAllData,
    loadFilteredData,
    
    // Utilitários
    isDataStale: state.cacheStatus === 'stale',
    hasData: state.allRecords.length > 0,
    isEmpty: !state.isLoading && state.allRecords.length === 0
  }
} 