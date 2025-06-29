import React, { useState } from 'react';

export type RuleType = 'coRun' | 'slotRestriction' | 'loadLimit' | 'phaseWindow' | 'patternMatch' | 'precedenceOverride';

export interface Rule {
  id: string;
  type: RuleType;
  description: string;
  params: Record<string, any>;
}

interface RuleBuilderProps {
  rules: Rule[];
  onChange: (rules: Rule[]) => void;
  taskIDs: string[];
  clientGroups: string[];
  workerGroups: string[];
}

export default function RuleBuilder({ rules, onChange, taskIDs, clientGroups, workerGroups }: RuleBuilderProps) {
  const [type, setType] = useState<RuleType>('coRun');
  const [input, setInput] = useState('');

  function addRule() {
    if (!input.trim()) return;
    const newRule: Rule = {
      id: Math.random().toString(36).slice(2),
      type,
      description: input,
      params: {},
    };
    onChange([...rules, newRule]);
    setInput('');
  }

  function removeRule(id: string) {
    onChange(rules.filter(r => r.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2 items-center">
        <select
          className="border rounded px-2 py-1 text-sm"
          value={type}
          onChange={e => setType(e.target.value as RuleType)}
        >
          <option value="coRun">Co-run (tasks together)</option>
          <option value="slotRestriction">Slot Restriction</option>
          <option value="loadLimit">Load Limit</option>
          <option value="phaseWindow">Phase Window</option>
          <option value="patternMatch">Pattern Match</option>
          <option value="precedenceOverride">Precedence Override</option>
        </select>
        <input
          className="border rounded px-2 py-1 flex-1 text-sm"
          placeholder="Describe the rule (e.g. T1 and T2 must run together)"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addRule()}
        />
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
          onClick={addRule}
        >
          Add Rule
        </button>
      </div>
      <div>
        <h4 className="font-semibold mb-2 text-slate-700">Current Rules</h4>
        {rules.length === 0 ? (
          <div className="text-slate-400 italic">No rules defined yet.</div>
        ) : (
          <ul className="space-y-2">
            {rules.map(rule => (
              <li key={rule.id} className="flex items-center justify-between bg-slate-50 rounded px-3 py-2 border">
                <span className="text-slate-700 text-sm">{rule.description}</span>
                <button
                  className="ml-4 text-xs text-red-500 hover:underline"
                  onClick={() => removeRule(rule.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 