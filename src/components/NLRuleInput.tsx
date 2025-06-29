import React, { useState } from 'react';
import { RuleType, Rule } from './RuleBuilder';

interface NLRuleInputProps {
  onAddRule: (rule: Rule) => void;
}

export default function NLRuleInput({ onAddRule }: NLRuleInputProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/nlRule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      });
      if (!res.ok) throw new Error('Failed to parse rule');
      const data = await res.json();
      onAddRule(data.rule);
      setInput('');
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <input
          className="border rounded px-2 py-1 flex-1 text-sm"
          placeholder="Type a rule in plain English (e.g. T1 and T2 must run together)"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          disabled={loading}
        />
        <button
          className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 text-sm disabled:opacity-60"
          onClick={handleAdd}
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add via AI'}
        </button>
      </div>
      {error && <div className="text-xs text-red-500">{error}</div>}
    </div>
  );
} 