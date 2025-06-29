import React from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Client, Worker, Task } from '@/types/data';
import { Rule } from './RuleBuilder';
import { Weights } from './PrioritizationPanel';

interface ExportPanelProps {
  clients: Client[];
  workers: Worker[];
  tasks: Task[];
  rules: Rule[];
  weights: Weights;
}

function exportCSV(data: any[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv' });
  saveAs(blob, filename);
}

function exportXLSX(data: any[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const xlsxData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([xlsxData], { type: 'application/octet-stream' });
  saveAs(blob, filename);
}

function exportRules(rules: Rule[], weights: Weights) {
  const blob = new Blob([
    JSON.stringify({ rules, weights }, null, 2)
  ], { type: 'application/json' });
  saveAs(blob, 'rules.json');
}

export default function ExportPanel({ clients, workers, tasks, rules, weights }: ExportPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          onClick={() => exportCSV(clients, 'clients.csv')}
        >
          Export Clients (CSV)
        </button>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          onClick={() => exportCSV(workers, 'workers.csv')}
        >
          Export Workers (CSV)
        </button>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          onClick={() => exportCSV(tasks, 'tasks.csv')}
        >
          Export Tasks (CSV)
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
          onClick={() => exportXLSX(clients, 'clients.xlsx')}
        >
          Export Clients (XLSX)
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
          onClick={() => exportXLSX(workers, 'workers.xlsx')}
        >
          Export Workers (XLSX)
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
          onClick={() => exportXLSX(tasks, 'tasks.xlsx')}
        >
          Export Tasks (XLSX)
        </button>
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
          onClick={() => exportRules(rules, weights)}
        >
          Export Rules & Weights (rules.json)
        </button>
      </div>
    </div>
  );
} 