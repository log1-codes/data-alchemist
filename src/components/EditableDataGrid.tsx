import React, { useState } from 'react';

interface EditableDataGridProps<T> {
  columns: string[];
  data: T[];
  errors: { rowIndex: number; column: string; message: string }[];
  onChange: (newData: T[]) => void;
}

export default function EditableDataGrid<T extends Record<string, any>>({ columns, data, errors, onChange }: EditableDataGridProps<T>) {
  const [editCell, setEditCell] = useState<{ row: number; col: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const getError = (row: number, col: string) => errors.find(e => e.rowIndex === row && e.column === col);

  const handleCellClick = (row: number, col: string, value: any) => {
    setEditCell({ row, col });
    setEditValue(String(value ?? ''));
  };

  const handleInputBlur = () => {
    if (editCell) {
      const { row, col } = editCell;
      const newData = [...data];
      newData[row] = { ...newData[row], [col]: editValue };
      onChange(newData);
      setEditCell(null);
      setEditValue('');
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    } else if (e.key === 'Escape') {
      setEditCell(null);
      setEditValue('');
    }
  };

  return (
    <div className="overflow-x-auto overflow-y-auto rounded border border-slate-200 max-h-[28rem]">
      <table className="min-w-full text-sm">
        
        <tbody>
          {data.map((row, rowIndex) => {
            // Check if any error exists in this row
            const rowHasError = errors.some(e => e.rowIndex === rowIndex);
            return (
              <tr key={rowIndex} className="even:bg-slate-50">
                <td className={`px-3 py-2 border-b text-slate-700 font-mono text-xs ${rowHasError ? 'border-2 border-red-400 bg-red-50 font-bold' : ''}`}>{rowIndex + 1}</td>
                {columns.map((col) => {
                  const isEditing = editCell && editCell.row === rowIndex && editCell.col === col;
                  const error = getError(rowIndex, col);
                  return (
                    <td
                      key={col}
                      className={`px-3 py-2 border-b text-slate-700 relative ${error ? 'border-2 border-red-400 bg-red-50' : ''}`}
                      onClick={() => !isEditing && handleCellClick(rowIndex, col, row[col])}
                    >
                      {isEditing ? (
                        <input
                          className="w-full px-1 py-0.5 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          value={editValue}
                          autoFocus
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={handleInputBlur}
                          onKeyDown={handleInputKeyDown}
                        />
                      ) : (
                        <span>{typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col] ?? '')}</span>
                      )}
                      {error && (
                        <span className="absolute left-0 top-full mt-1 text-xs text-red-500 bg-white border border-red-200 rounded px-2 py-1 shadow z-10">
                          {`Row ${rowIndex + 1}, Column ${col}: ${error.message}`}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
} 