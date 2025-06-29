import React from 'react';
import { Rule } from './RuleBuilder';

interface RuleSuggestionsPanelProps {
  suggestions: Rule[];
  onAdd: (rule: Rule) => void;
  onIgnore: (rule: Rule) => void;
  loading: boolean;
  error: string | null;
}

export default function RuleSuggestionsPanel({ suggestions, onAdd, onIgnore, loading, error }: RuleSuggestionsPanelProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-slate-700 text-lg mb-2">AI Rule Suggestions</h4>
      {loading && <div className="text-blue-600">Loading suggestions...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && suggestions.length === 0 && (
        <div className="text-slate-400 italic">No suggestions at this time.</div>
      )}
      <ul className="space-y-2">
        {suggestions.map(rule => (
          <li key={rule.id} className="flex items-center justify-between bg-slate-50 rounded px-3 py-2 border">
            <span className="text-slate-700 text-sm">{rule.description}</span>
            <div className="flex gap-2">
              <button
                className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                onClick={() => onAdd(rule)}
              >
                Add
              </button>
              <button
                className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs hover:bg-slate-300"
                onClick={() => onIgnore(rule)}
              >
                Ignore
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 