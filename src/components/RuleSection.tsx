import React, { useState } from 'react';
import RuleBuilder, { Rule } from './RuleBuilder';
import NLRuleInput from './NLRuleInput';
import RuleSuggestionsPanel from './RuleSuggestionsPanel';

interface RuleSectionProps {
  rules: Rule[];
  setRules: (rules: Rule[]) => void;
  taskIDs: string[];
  clientGroups: string[];
  workerGroups: string[];
  clients?: any[];
  workers?: any[];
  tasks?: any[];
}

export default function RuleSection({ rules, setRules, taskIDs, clientGroups, workerGroups, clients = [], workers = [], tasks = [] }: RuleSectionProps) {
  const [suggestions, setSuggestions] = useState<Rule[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleAddRule(rule: Rule) {
    setRules([...rules, rule]);
  }

  async function getSuggestions() {
    setLoading(true);
    setError(null);
    setShowModal(true);
    try {
      const res = await fetch('/api/ruleSuggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clients, workers, tasks, rules }),
      });
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (e: any) {
      setError(e.message || 'Failed to get suggestions');
    } finally {
      setLoading(false);
    }
  }

  function handleAddSuggestion(rule: Rule) {
    setRules([...rules, rule]);
    setSuggestions(suggestions.filter(r => r.id !== rule.id));
  }
  function handleIgnoreSuggestion(rule: Rule) {
    setSuggestions(suggestions.filter(r => r.id !== rule.id));
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-2">
        <button
          className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 text-sm"
          onClick={getSuggestions}
          disabled={loading}
        >
          {loading ? 'Getting Suggestions...' : 'Get AI Rule Suggestions'}
        </button>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative animate-fade-in">
            <button
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-700 text-xl font-bold"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <RuleSuggestionsPanel
              suggestions={suggestions}
              onAdd={handleAddSuggestion}
              onIgnore={handleIgnoreSuggestion}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      )}
      <NLRuleInput onAddRule={handleAddRule} />
      <RuleBuilder
        rules={rules}
        onChange={setRules}
        taskIDs={taskIDs}
        clientGroups={clientGroups}
        workerGroups={workerGroups}
      />
    </div>
  );
} 