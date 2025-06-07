import React, { useState } from 'react';
import './SimpleDataGrid.css';

interface SimpleDataGridProps {
  dadosProjeto: any;
  meses: string[];
  selectedYear: number;
  lastDataMonth: number;
  onCellUpdate: (projeto: string, mes: number, campo: string, valor: number) => void;
  formatCurrency: (value: number) => string;
  formatPercent: (value: number) => string;
}

interface EditableCellProps {
  value: number;
  isEditable: boolean;
  isPercent?: boolean;
  onSave: (newValue: number) => void;
  color?: string;
}

const EditableCell: React.FC<EditableCellProps> = ({ 
  value, 
  isEditable, 
  isPercent = false, 
  onSave, 
  color = '#666' 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());

  const handleClick = () => {
    if (isEditable) {
      setIsEditing(true);
      setEditValue(Math.abs(value).toString());
    }
  };

  const handleSave = () => {
    let newValue = parseFloat(editValue) || 0;
    // Garante que valores sejam sempre positivos
    newValue = Math.abs(newValue);
    onSave(newValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(Math.abs(value).toString());
    }
  };

  const formatValue = (val: number) => {
    // Remove quebras de linha e garante formatação adequada
    const absoluteValue = Math.abs(val);
    if (isPercent) {
      return `${absoluteValue.toFixed(1)}%`.replace(/\s/g, '');
    }
    return `R$ ${absoluteValue.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`.replace(/\s/g, ' ');
  };

  return (
    <td 
      className={`simple-cell ${isEditable ? 'editable' : 'readonly'}`}
      style={{ color }}
      onClick={handleClick}
    >
      {isEditing ? (
        <input
          className="simple-input"
          type="number"
          min="0"
          step="0.01"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <span style={{ whiteSpace: 'nowrap' }}>{formatValue(value)}</span>
      )}
    </td>
  );
};

const SimpleDataGrid: React.FC<SimpleDataGridProps> = ({
  dadosProjeto,
  meses,
  selectedYear,
  lastDataMonth,
  onCellUpdate,
  formatCurrency,
  formatPercent
}) => {
  const items = [
    { key: 'receita', label: 'Receita', color: '#198754', editable: true },
    { key: 'desoneracao', label: 'Desoneração', color: '#0dcaf0', editable: false }, // Não editável
    { key: 'custo', label: 'Custo', color: '#dc3545', editable: true },
    { key: 'margem', label: 'Margem', color: '#666', editable: false }
  ];

  const handleCellChange = (mes: number, campo: string, novoValor: number) => {
    // Se for alteração na receita, recalcula desoneração automaticamente
    if (campo === 'receita') {
      const novaDesoneracao = novoValor * 0.0387;
      onCellUpdate(dadosProjeto.projeto, mes, 'desoneracao', novaDesoneracao);
    }
    onCellUpdate(dadosProjeto.projeto, mes, campo, novoValor);
  };

  return (
    <div className="simple-data-grid-container">
      <div className="simple-data-grid-header">
        <h5 className="simple-project-title">{dadosProjeto.projeto}</h5>
      </div>
      <div className="simple-data-grid-wrapper">
        <table className="simple-data-grid">
          <thead>
            <tr>
              <th className="simple-item-header">Item</th>
              {meses.map((mes, index) => (
                <React.Fragment key={mes}>
                  <th className="simple-month-header" colSpan={2}>
                    {mes}/{selectedYear.toString().slice(-2)}
                  </th>
                </React.Fragment>
              ))}
            </tr>
            <tr>
              <th></th>
              {meses.map(mes => (
                <React.Fragment key={mes}>
                  <th className="simple-sub-header">Mensal</th>
                  <th className="simple-sub-header">Acumulado</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.key}>
                <td className="simple-item-cell">{item.label}</td>
                {meses.map((_, index) => {
                  const mes = index + 1;
                  const dadosMes = dadosProjeto.dados[mes] || {
                    mensal: { receita: 0, desoneracao: 0, custo: 0, margem: 0 },
                    acumulado: { receita: 0, desoneracao: 0, custo: 0, margem: 0 }
                  };

                  const mensalValue = Math.abs(dadosMes.mensal[item.key] || 0);
                  const acumuladoValue = Math.abs(dadosMes.acumulado[item.key] || 0);
                  
                  const isEditable = item.editable && mes > lastDataMonth;
                  const isPercent = item.key === 'margem';
                  
                  // Cor especial para margem baseada no valor
                  let color = item.color;
                  if (item.key === 'margem') {
                    color = mensalValue >= 7 ? '#28a745' : '#dc3545';
                  }

                  return (
                    <React.Fragment key={mes}>
                      <EditableCell
                        value={mensalValue}
                        isEditable={isEditable}
                        isPercent={isPercent}
                        color={color}
                        onSave={(newValue) => 
                          handleCellChange(mes, item.key, newValue)
                        }
                      />
                      <td 
                        className="simple-cell readonly"
                        style={{ 
                          color: item.key === 'margem' && acumuladoValue >= 7 ? '#28a745' : item.key === 'margem' ? '#dc3545' : color,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {isPercent ? 
                          `${acumuladoValue.toFixed(1)}%`.replace(/\s/g, '') : 
                          `R$ ${acumuladoValue.toLocaleString('pt-BR', { 
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}`.replace(/\s/g, ' ')
                        }
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SimpleDataGrid; 