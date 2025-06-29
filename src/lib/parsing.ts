import { Client, Worker, Task } from '@/types/data';

export async function mapHeadersWithAI(rawHeaders: string[], entity: 'client' | 'worker' | 'task'): Promise<Record<string, string>> {
  const res = await fetch('/api/mapHeaders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawHeaders, entity }),
  });
  if (!res.ok) throw new Error('Failed to map headers');
  const data = await res.json();
  return data.mapping;
}

export function normalizeClient(row: any): Client {
  return {
    ClientID: String(row.ClientID || row.clientid || ''),
    ClientName: String(row.ClientName || row.clientname || ''),
    PriorityLevel: Number(row.PriorityLevel || 1),
    RequestedTaskIDs: String(row.RequestedTaskIDs || '').split(',').map((s) => s.trim()).filter(Boolean),
    GroupTag: String(row.GroupTag || ''),
    AttributesJSON: parseJSON(row.AttributesJSON),
  };
}

export function normalizeWorker(row: any): Worker {
  return {
    WorkerID: String(row.WorkerID || row.workerid || ''),
    WorkerName: String(row.WorkerName || row.workername || ''),
    Skills: String(row.Skills || '').split(',').map((s) => s.trim()).filter(Boolean),
    AvailableSlots: parseNumberArray(row.AvailableSlots),
    MaxLoadPerPhase: Number(row.MaxLoadPerPhase || 1),
    WorkerGroup: String(row.WorkerGroup || ''),
    QualificationLevel: String(row.QualificationLevel || ''),
  };
}

export function normalizeTask(row: any): Task {
  return {
    TaskID: String(row.TaskID || row.taskid || ''),
    TaskName: String(row.TaskName || row.taskname || ''),
    Category: String(row.Category || ''),
    Duration: Number(row.Duration || 1),
    RequiredSkills: String(row.RequiredSkills || '').split(',').map((s) => s.trim()).filter(Boolean),
    PreferredPhases: parsePhaseList(row.PreferredPhases),
    MaxConcurrent: Number(row.MaxConcurrent || 1),
  };
}

function parseJSON(val: any): Record<string, any> {
  try {
    return typeof val === 'string' ? JSON.parse(val) : val || {};
  } catch {
    return {};
  }
}

function parseNumberArray(val: any): number[] {
  if (Array.isArray(val)) return val.map(Number);
  if (typeof val === 'string') {
    return val.replace(/\[|\]/g, '').split(',').map((s) => Number(s.trim())).filter((n) => !isNaN(n));
  }
  return [];
}

function parsePhaseList(val: any): number[] {
  if (typeof val === 'string') {
    if (/\d+-\d+/.test(val)) {
      const [start, end] = val.split('-').map(Number);
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
    return val.replace(/\[|\]/g, '').split(',').map((s) => Number(s.trim())).filter((n) => !isNaN(n));
  }
  if (Array.isArray(val)) return val.map(Number);
  return [];
} 