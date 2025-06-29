import { Client, Worker, Task, RowError } from '@/types/data';

export function validateClients(clients: Client[], allTaskIDs: string[]): RowError[] {
  const errors: RowError[] = [];
  const seenIDs = new Set<string>();
  clients.forEach((c, i) => {
    // Required columns
    if (!c.ClientID) errors.push({ rowIndex: i, column: 'ClientID', message: 'Missing ClientID' });
    if (!c.ClientName) errors.push({ rowIndex: i, column: 'ClientName', message: 'Missing ClientName' });
    // Duplicate IDs
    if (seenIDs.has(c.ClientID)) errors.push({ rowIndex: i, column: 'ClientID', message: 'Duplicate ClientID' });
    seenIDs.add(c.ClientID);
    // PriorityLevel
    if (isNaN(c.PriorityLevel) || c.PriorityLevel < 1 || c.PriorityLevel > 5) errors.push({ rowIndex: i, column: 'PriorityLevel', message: 'PriorityLevel must be 1-5' });
    // RequestedTaskIDs
    if (!Array.isArray(c.RequestedTaskIDs)) errors.push({ rowIndex: i, column: 'RequestedTaskIDs', message: 'Malformed RequestedTaskIDs' });
    else {
      c.RequestedTaskIDs.forEach((tid) => {
        if (!allTaskIDs.includes(tid)) errors.push({ rowIndex: i, column: 'RequestedTaskIDs', message: `Unknown TaskID: ${tid}` });
      });
    }
    // AttributesJSON
    if (typeof c.AttributesJSON !== 'object') errors.push({ rowIndex: i, column: 'AttributesJSON', message: 'Malformed JSON' });
  });
  return errors;
}

export function validateWorkers(workers: Worker[]): RowError[] {
  const errors: RowError[] = [];
  const seenIDs = new Set<string>();
  workers.forEach((w, i) => {
    if (!w.WorkerID) errors.push({ rowIndex: i, column: 'WorkerID', message: 'Missing WorkerID' });
    if (!w.WorkerName) errors.push({ rowIndex: i, column: 'WorkerName', message: 'Missing WorkerName' });
    if (seenIDs.has(w.WorkerID)) errors.push({ rowIndex: i, column: 'WorkerID', message: 'Duplicate WorkerID' });
    seenIDs.add(w.WorkerID);
    if (!Array.isArray(w.Skills)) errors.push({ rowIndex: i, column: 'Skills', message: 'Malformed Skills' });
    if (!Array.isArray(w.AvailableSlots)) errors.push({ rowIndex: i, column: 'AvailableSlots', message: 'Malformed AvailableSlots' });
    if (isNaN(w.MaxLoadPerPhase) || w.MaxLoadPerPhase < 1) errors.push({ rowIndex: i, column: 'MaxLoadPerPhase', message: 'Invalid MaxLoadPerPhase' });
  });
  return errors;
}

export function validateTasks(tasks: Task[], allWorkerSkills: string[]): RowError[] {
  const errors: RowError[] = [];
  const seenIDs = new Set<string>();
  tasks.forEach((t, i) => {
    if (!t.TaskID) errors.push({ rowIndex: i, column: 'TaskID', message: 'Missing TaskID' });
    if (!t.TaskName) errors.push({ rowIndex: i, column: 'TaskName', message: 'Missing TaskName' });
    if (seenIDs.has(t.TaskID)) errors.push({ rowIndex: i, column: 'TaskID', message: 'Duplicate TaskID' });
    seenIDs.add(t.TaskID);
    if (isNaN(t.Duration) || t.Duration < 1) errors.push({ rowIndex: i, column: 'Duration', message: 'Duration must be >= 1' });
    if (!Array.isArray(t.RequiredSkills)) errors.push({ rowIndex: i, column: 'RequiredSkills', message: 'Malformed RequiredSkills' });
    else {
      t.RequiredSkills.forEach((skill) => {
        if (!allWorkerSkills.includes(skill)) errors.push({ rowIndex: i, column: 'RequiredSkills', message: `No worker with skill: ${skill}` });
      });
    }
    if (!Array.isArray(t.PreferredPhases)) errors.push({ rowIndex: i, column: 'PreferredPhases', message: 'Malformed PreferredPhases' });
    if (isNaN(t.MaxConcurrent) || t.MaxConcurrent < 1) errors.push({ rowIndex: i, column: 'MaxConcurrent', message: 'Invalid MaxConcurrent' });
  });
  return errors;
} 