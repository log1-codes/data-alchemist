import React from 'react';

interface AiValidatorPanelProps {
  findings: string[];
  loading: boolean;
  error: string | null;
  open: boolean;
  onClose: () => void;
}

export default function AiValidatorPanel({ findings, loading, error, open, onClose }: AiValidatorPanelProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full relative animate-fade-in">
        <button
          className="absolute top-2 right-2 text-slate-400 hover:text-slate-700 text-xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h4 className="text-lg font-semibold mb-4 text-blue-600">AI Validator Findings</h4>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {loading && <div className="text-blue-600 mb-2">Running AI Validator...</div>}
        {!loading && !error && findings.length === 0 && (
          <div className="text-green-600">No issues found! Your data looks good.</div>
        )}
        {!loading && !error && findings.length > 0 && (
          <ul className="list-disc pl-5 space-y-2 text-slate-700 text-sm max-h-80 overflow-y-auto">
            {findings.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 