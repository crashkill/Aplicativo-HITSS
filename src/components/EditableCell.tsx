import React, { useState, useEffect } from 'react';

interface EditableCellProps {
  initialValue: number;
  onSave: (newValue: number) => void;
  isEditable: boolean;
}

const EditableCell: React.FC<EditableCellProps> = ({ initialValue, onSave, isEditable }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleFocus = (e: React.MouseEvent<HTMLTableCellElement>) => {
    if (isEditable) {
      // Previne que múltiplos cliques rápidos causem comportamento estranho
      e.preventDefault();
      setIsEditing(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permite números negativos e decimais
    const newValue = e.target.value;
    if (newValue === '' || newValue === '-') {
      setValue(0); // Ou algum placeholder se preferir
    } else {
      setValue(parseFloat(newValue));
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    onSave(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur(); // Dispara o onBlur para salvar
    }
    if (e.key === 'Escape') {
      setValue(initialValue); // Reverte a edição
      setIsEditing(false);
    }
  };
  
  const formatValue = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Math.abs(val));
  };

  if (!isEditable) {
    return <td className="text-right py-2 px-3">{formatValue(initialValue)}</td>;
  }

  return (
    <td
      onClick={handleFocus}
      className={`text-right py-0 px-1 editable-cell ${isEditing ? 'editing' : ''}`}
      style={{ cursor: 'pointer' }}
    >
      {isEditing ? (
        <input
          type="number"
          step="0.01"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full text-right bg-blue-100 dark:bg-blue-900 border-none outline-none p-2 rounded"
        />
      ) : (
        <span className="py-2 px-2 d-block">{formatValue(value)}</span>
      )}
    </td>
  );
};

export default EditableCell; 