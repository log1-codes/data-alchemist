import React, { useState } from 'react';
import RuleBuilder, { Rule } from './RuleBuilder';
import NLRuleInput from './NLRuleInput';

interface RuleSectionProps {
  rules: Rule[];
  setRules: (rules: Rule[]) => void;
  taskIDs: string[];
  clientGroups: string[];
  workerGroups: string[];
}

export default function RuleSection({ rules, setRules, taskIDs, clientGroups, workerGroups }: RuleSectionProps) {
  function handleAddRule(rule: Rule) {
    setRules([...rules, rule]);
  }

  return (
    <div className="space-y-6">
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