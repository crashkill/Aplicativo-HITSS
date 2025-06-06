import React, { useState, useEffect } from 'react';
import { migrationService } from '../../services/migrationService';

interface MigrationStatusData {
  initialized: boolean;
  executed: string[];
  pending: string[];
  total: number;
}

interface MigrationResult {
  success: boolean;
  executed: string[];
  failed: string[];
}

export const MigrationStatus: React.FC = () => {
  const [status, setStatus] = useState<MigrationStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState<MigrationResult | null>(null);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const migrationStatus = await migrationService.getMigrationStatus();
      setStatus(migrationStatus);
    } catch (error) {
      console.error('Erro ao carregar status das migrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const runMigrations = async () => {
    try {
      setRunning(true);
      const result = await migrationService.runMigrations();
      setLastResult(result);
      
      // Recarregar status após execução
      await loadStatus();
    } catch (error) {
      console.error('Erro ao executar migrations:', error);
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Carregando status das migrations...</span>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-2">
          <div className="text-red-500">❌</div>
          <span className="text-red-700">Erro ao carregar status das migrations</span>
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    if (!status.initialized) return 'text-red-600';
    if (status.pending.length > 0) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = () => {
    if (!status.initialized) return '❌';
    if (status.pending.length > 0) return '🟡';
    return '✅';
  };

  const getStatusText = () => {
    if (!status.initialized) return 'Não inicializado';
    if (status.pending.length > 0) return `${status.pending.length} migration(s) pendente(s)`;
    return 'Atualizado';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            🔧 Status das Migrations
          </h3>
          <button
            onClick={loadStatus}
            disabled={loading || running}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50"
          >
            🔄 Atualizar
          </button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{status.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{status.executed.length}</div>
            <div className="text-sm text-gray-600">Executadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{status.pending.length}</div>
            <div className="text-sm text-gray-600">Pendentes</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl ${getStatusColor()}`}>{getStatusIcon()}</div>
            <div className={`text-sm ${getStatusColor()}`}>{getStatusText()}</div>
          </div>
        </div>

        {/* Migrations Lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Executed Migrations */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">✅ Migrations Executadas</h4>
            {status.executed.length > 0 ? (
              <div className="space-y-2">
                {status.executed.map((migration) => (
                  <div
                    key={migration}
                    className="px-3 py-2 bg-green-50 border border-green-200 rounded-md text-sm"
                  >
                    {migration}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">
                Nenhuma migration executada
              </div>
            )}
          </div>

          {/* Pending Migrations */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">🟡 Migrations Pendentes</h4>
            {status.pending.length > 0 ? (
              <div className="space-y-2">
                {status.pending.map((migration) => (
                  <div
                    key={migration}
                    className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm"
                  >
                    {migration}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">
                Nenhuma migration pendente
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        {status.pending.length > 0 && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={runMigrations}
              disabled={running}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {running ? (
                <span className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Executando Migrations...</span>
                </span>
              ) : (
                '🚀 Executar Migrations Pendentes'
              )}
            </button>
          </div>
        )}

        {/* Last Result */}
        {lastResult && (
          <div className="mt-6 p-4 rounded-lg border">
            <h4 className="font-medium mb-2">
              {lastResult.success ? '✅ Última Execução - Sucesso' : '❌ Última Execução - Falha'}
            </h4>
            
            {lastResult.executed.length > 0 && (
              <div className="mb-2">
                <span className="text-sm font-medium text-green-700">Executadas: </span>
                <span className="text-sm">{lastResult.executed.join(', ')}</span>
              </div>
            )}
            
            {lastResult.failed.length > 0 && (
              <div>
                <span className="text-sm font-medium text-red-700">Falharam: </span>
                <span className="text-sm">{lastResult.failed.join(', ')}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 