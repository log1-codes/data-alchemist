import React, { useState } from 'react';
import PrioritizationPanel, { Weights } from './PrioritizationPanel';

const DEFAULT_WEIGHTS: Weights = {
  priority: 3,
  fairness: 3,
  cost: 3,
  fulfillment: 3,
  workload: 3,
};

export default function PrioritizationSection({ weights, setWeights }: { weights: Weights; setWeights: (w: Weights) => void }) {
  return (
    <div className="space-y-4">
      <PrioritizationPanel weights={weights} onChange={setWeights} />
    </div>
  );
} 