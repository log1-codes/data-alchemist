import React, { useState } from 'react';

interface ValidationSummaryProps {
  errors: { rowIndex: number; column: string; message: string }[];
  entity: string;
  data: any[];
  onApplyFix: (fixed: any[]) => void;
}

export default function ValidationSummary({ errors, entity, data, onApplyFix }: ValidationSummaryProps) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiFix, setAiFix] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleAIFix() {
    setLoading(true);
    setError(null);
    setShowModal(true);
    setSuccess(null);
    try {
      const res = await fetch('/api/aiErrorCorrection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity, data, errors }),
      });
      const result = await res.json();
      setAiFix(result.fixed);
    } catch (e: any) {
      setError(e.message || 'Failed to get AI fix');
    } finally {
      setLoading(false);
    }
  }

  function handleApplyFix() {
    if (aiFix) {
      onApplyFix(aiFix);
      setShowModal(false);
      setSuccess('AI fix applied!');
      setTimeout(() => setSuccess(null), 2000);
    }
  }

  return (
    <div className="mb-2">
      {errors.length === 0 ? (
        <div className="text-green-600 text-xs font-medium flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500" /> All good! No errors found.
        </div>
      ) : (
        <div className="text-red-600 text-xs font-medium flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
          {errors.length} error{errors.length > 1 ? 's' : ''} found
          <button
            className="ml-2 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
            onClick={handleAIFix}
            disabled={loading}
          >
            {loading ? 'Suggesting...' : 'Suggest AI Fixes'}
          </button>
        </div>
      )}
      {success && <div className="text-green-600 text-xs mt-1">{success}</div>}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full relative animate-fade-in">
            <button
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-700 text-xl font-bold"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h4 className="text-lg font-semibold mb-4 text-blue-600">AI Error Correction Suggestions</h4>
            {error && <div className="text-red-600 mb-2">{error}</div>}
            {loading && <div className="text-blue-600 mb-2">Loading suggestions...</div>}
            {aiFix && (
              <>
                <div className="mb-2 text-xs text-slate-700">AI suggests the following corrections. You can apply them or ignore.</div>
                <div className="overflow-x-auto max-h-64 mb-4 border rounded">
                  <table className="min-w-full text-xs">
                    <thead className="bg-slate-50">
                      <tr>
                        {Object.keys(aiFix[0] || {}).map((k) => (
                          <th key={k} className="px-2 py-1 border-b text-left font-medium text-slate-600">{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {aiFix.slice(0, 5).map((row, i) => (
                        <tr key={i} className="even:bg-slate-50">
                          {Object.keys(aiFix[0] || {}).map((k) => (
                            <td key={k} className="px-2 py-1 border-b text-slate-700">{typeof row[k] === 'object' ? JSON.stringify(row[k]) : String(row[k])}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {aiFix.length > 5 && <div className="text-xs text-slate-500 px-2 py-1">Showing first 5 of {aiFix.length} rows</div>}
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                    onClick={handleApplyFix}
                  >
                    Apply Fix
                  </button>
                  <button
                    className="bg-slate-200 text-slate-700 px-3 py-1 rounded hover:bg-slate-300 text-sm"
                    onClick={() => setShowModal(false)}
                  >
                    Ignore
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 