import React, { useState } from 'react';

const CRITERIA = [
  { key: 'priority', label: 'Priority Level' },
  { key: 'fairness', label: 'Fairness' },
  { key: 'cost', label: 'Cost Efficiency' },
  { key: 'fulfillment', label: 'Task Fulfillment' },
  { key: 'workload', label: 'Minimize Workload' },
];

const PRESETS = [
  {
    name: 'Maximize Fulfillment',
    weights: { priority: 2, fairness: 1, cost: 1, fulfillment: 5, workload: 1 },
  },
  {
    name: 'Fair Distribution',
    weights: { priority: 1, fairness: 5, cost: 2, fulfillment: 2, workload: 2 },
  },
  {
    name: 'Minimize Workload',
    weights: { priority: 1, fairness: 2, cost: 2, fulfillment: 1, workload: 5 },
  },
];

export type Weights = Record<string, number>;

interface PrioritizationPanelProps {
  weights: Weights;
  onChange: (w: Weights) => void;
}

export default function PrioritizationPanel({ weights, onChange }: PrioritizationPanelProps) {
  const [order, setOrder] = useState(CRITERIA.map(c => c.key));
  const [dragged, setDragged] = useState<string | null>(null);

  function handleSlider(key: string, value: number) {
    onChange({ ...weights, [key]: value });
  }

  function handlePreset(preset: typeof PRESETS[0]) {
    onChange({ ...preset.weights });
  }

  function handleDragStart(key: string) {
    setDragged(key);
  }
  function handleDrop(key: string) {
    if (!dragged || dragged === key) return;
    const newOrder = [...order];
    const from = newOrder.indexOf(dragged);
    const to = newOrder.indexOf(key);
    newOrder.splice(from, 1);
    newOrder.splice(to, 0, dragged);
    setOrder(newOrder);
    setDragged(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-2">
        {PRESETS.map(preset => (
          <button
            key={preset.name}
            className="bg-slate-100 px-3 py-1 rounded text-xs font-medium hover:bg-slate-200 border"
            onClick={() => handlePreset(preset)}
          >
            {preset.name}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {order.map(key => {
          const { label } = CRITERIA.find(c => c.key === key)!;
          return (
            <div
              key={key}
              className="flex items-center gap-4 group"
              draggable
              onDragStart={() => handleDragStart(key)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(key)}
            >
              <span className="w-32 text-slate-700 text-sm cursor-move group-hover:font-semibold">{label}</span>
              <input
                type="range"
                min={1}
                max={5}
                value={weights[key] || 1}
                onChange={e => handleSlider(key, Number(e.target.value))}
                className="w-40 accent-blue-600"
              />
              <span className="w-8 text-center text-slate-600">{weights[key] || 1}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
} 