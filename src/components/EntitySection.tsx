import React, { useState } from 'react';
import EditableDataGrid from './EditableDataGrid';
import ValidationSummary from './ValidationSummary';
import { normalizeClient, normalizeWorker, normalizeTask } from '@/lib/parsing';

export default function EntitySection<T extends Record<string, any>>({
  title,
  data,
  setData,
  errors,
  errorSummary,
  entity,
}: {
  title: string;
  data: T[];
  setData: (d: T[]) => void;
  errors: { rowIndex: number; column: string; message: string }[];
  errorSummary: { rowIndex: number; column: string; message: string }[];
  entity: string;
}) {
  const [mode, setMode] = useState<'preview' | 'edit'>('preview');
  if (!data.length) return <div className="text-slate-400 italic">No data uploaded.</div>;
  const columns = Object.keys(data[0]);

  // Normalization handler for AI fixes
  function handleApplyFix(fixed: any[]) {
    if (entity === 'clients') setData(fixed.map(normalizeClient) as unknown as T[]);
    else if (entity === 'workers') setData(fixed.map(normalizeWorker) as unknown as T[]);
    else if (entity === 'tasks') setData(fixed.map(normalizeTask) as unknown as T[]);
    else setData(fixed as T[]);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3 min-h-[38px]">
        <h3 className="font-semibold text-slate-700 text-lg m-0 p-0 leading-tight">{title}</h3>
        <button
          className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition"
          onClick={() => setMode(mode === 'preview' ? 'edit' : 'preview')}
        >
          {mode === 'preview' ? 'Edit' : 'Preview'}
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <ValidationSummary
          errors={errorSummary}
          entity={entity}
          data={data}
          onApplyFix={handleApplyFix}
        />
        {mode === 'preview' ? (
          <EntityPreview data={data} />
        ) : (
          <EditableDataGrid columns={columns} data={data} errors={errors} onChange={setData} />
        )}
      </div>
    </div>
  );
}

function EntityPreview({ data }: { data: any[] }) {
  const [showAll, setShowAll] = useState(false);
  if (!data.length) return <div className="text-slate-400 italic">No data uploaded.</div>;
  const keys = Object.keys(data[0]);
  const displayData = showAll ? data : data.slice(0, 5);
  return (
    <div>
      <div className="flex items-center justify-between mb-2 min-h-[32px]">
        <span className="font-semibold text-slate-700 text-lg">Preview</span>
        {data.length > 5 && (
          <button
            className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition"
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? `Show First 5` : `Show All (${data.length})`}
          </button>
        )}
      </div>
      <div className={showAll ? "overflow-x-auto overflow-y-auto rounded border border-slate-200 max-h-96" : "overflow-x-auto rounded border border-slate-200"}>
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {keys.map((k) => (
                <th key={k} className="px-3 py-2 border-b text-left font-medium text-slate-600">{k}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, i) => (
              <tr key={i} className="even:bg-slate-50">
                {keys.map((k) => (
                  <td key={k} className="px-3 py-2 border-b text-slate-700">
                    {typeof row[k] === 'object' ? JSON.stringify(row[k]) : String(row[k])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!showAll && data.length > 5 && (
          <div className="text-xs text-slate-500 px-2 py-1">Showing first 5 of {data.length} rows</div>
        )}
      </div>
    </div>
  );
} 