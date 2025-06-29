"use client"
import React, { useState, useEffect } from 'react';
import FileUploader from '@/components/FileUploader';
import EditableDataGrid from '@/components/EditableDataGrid';
import { Client, Worker, Task, RowError } from '@/types/data';
import { normalizeClient, normalizeWorker, normalizeTask, mapHeadersWithAI } from '@/lib/parsing';
import { validateClients, validateWorkers, validateTasks } from '@/lib/validation';

export default function HomePage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clientErrors, setClientErrors] = useState<RowError[]>([]);
  const [workerErrors, setWorkerErrors] = useState<RowError[]>([]);
  const [taskErrors, setTaskErrors] = useState<RowError[]>([]);

  // Run validations whenever data changes
  useEffect(() => {
    const allTaskIDs = tasks.map(t => t.TaskID);
    setClientErrors(validateClients(clients, allTaskIDs));
  }, [clients, tasks]);
  useEffect(() => {
    setWorkerErrors(validateWorkers(workers));
  }, [workers]);
  useEffect(() => {
    const allWorkerSkills = workers.flatMap(w => w.Skills);
    setTaskErrors(validateTasks(tasks, allWorkerSkills));
  }, [tasks, workers]);

  const handleClients = async (raw: any[], fileName: string) => {
    if (!raw.length) return;
    const headerMap = await mapHeadersWithAI(Object.keys(raw[0]), 'client');
    const mapped = raw.map(row => {
      const mappedRow: any = {};
      for (const key in row) {
        const canonical = headerMap[key] || key;
        mappedRow[canonical] = row[key];
      }
      return normalizeClient(mappedRow);
    });
    setClients(mapped);
  };

  const handleWorkers = async (raw: any[], fileName: string) => {
    if (!raw.length) return;
    const headerMap = await mapHeadersWithAI(Object.keys(raw[0]), 'worker');
    const mapped = raw.map(row => {
      const mappedRow: any = {};
      for (const key in row) {
        const canonical = headerMap[key] || key;
        mappedRow[canonical] = row[key];
      }
      return normalizeWorker(mappedRow);
    });
    setWorkers(mapped);
  };

  const handleTasks = async (raw: any[], fileName: string) => {
    if (!raw.length) return;
    const headerMap = await mapHeadersWithAI(Object.keys(raw[0]), 'task');
    const mapped = raw.map(row => {
      const mappedRow: any = {};
      for (const key in row) {
        const canonical = headerMap[key] || key;
        mappedRow[canonical] = row[key];
      }
      return normalizeTask(mappedRow);
    });
    setTasks(mapped);
  };

  return (
    <main className="container mx-auto py-10 px-4 min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-slate-800">Data Alchemist</h1>
        <p className="text-lg text-slate-600">AI Resource-Allocation Configurator</p>
      </div>
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-slate-700">1. Upload Your Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <FileUploader label="Clients" onFileParsed={handleClients} />
          </Card>
          <Card>
            <FileUploader label="Workers" onFileParsed={handleWorkers} />
          </Card>
          <Card>
            <FileUploader label="Tasks" onFileParsed={handleTasks} />
          </Card>
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-slate-700">2. Edit & Validate Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <EntitySection
              title="Clients"
              data={clients}
              setData={setClients}
              errors={clientErrors}
              errorSummary={clientErrors}
            />
          </Card>
          <Card>
            <EntitySection
              title="Workers"
              data={workers}
              setData={setWorkers}
              errors={workerErrors}
              errorSummary={workerErrors}
            />
          </Card>
          <Card>
            <EntitySection
              title="Tasks"
              data={tasks}
              setData={setTasks}
              errors={taskErrors}
              errorSummary={taskErrors}
            />
          </Card>
        </div>
      </section>
    </main>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100 min-h-[180px] flex flex-col justify-center">
      {children}
    </div>
  );
}

function EntitySection<T extends Record<string, any>>({ title, data, setData, errors, errorSummary }: {
  title: string;
  data: T[];
  setData: (d: T[]) => void;
  errors: { rowIndex: number; column: string; message: string }[];
  errorSummary: { rowIndex: number; column: string; message: string }[];
}) {
  const [mode, setMode] = useState<'preview' | 'edit'>('preview');
  const [modalOpen, setModalOpen] = useState(false);
  if (!data.length) return <div className="text-slate-400 italic">No data uploaded.</div>;
  const columns = Object.keys(data[0]);
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-slate-700 text-lg">{title}</h3>
        <div className="flex gap-2">
          <ValidationSummary errors={errorSummary} onOpenModal={() => setModalOpen(true)} />
          <button
            className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition"
            onClick={() => setMode(mode === 'preview' ? 'edit' : 'preview')}
          >
            {mode === 'preview' ? 'Edit' : 'Preview'}
          </button>
        </div>
      </div>
      <ValidationModal open={modalOpen} onClose={() => setModalOpen(false)} errors={errorSummary} />
      {mode === 'preview' ? (
        <EntityPreview data={data} />
      ) : (
        <EditableDataGrid columns={columns} data={data} errors={errors} onChange={setData} />
      )}
    </div>
  );
}

function ValidationSummary({ errors, onOpenModal }: { errors: { rowIndex: number; column: string; message: string }[]; onOpenModal: () => void }) {
  if (!errors.length) return (
    <div className="mb-2 text-green-600 text-xs font-medium flex items-center gap-1">
      <span className="inline-block w-2 h-2 rounded-full bg-green-500" /> All good! No errors found.
    </div>
  );
  return (
    <button
      className="mb-2 text-red-600 text-xs font-medium flex items-center gap-1 hover:underline"
      onClick={onOpenModal}
      type="button"
    >
      <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
      {errors.length} error{errors.length > 1 ? 's' : ''} found (view)
    </button>
  );
}

function ValidationModal({ open, onClose, errors }: { open: boolean; onClose: () => void; errors: { rowIndex: number; column: string; message: string }[] }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative animate-fade-in">
        <button
          className="absolute top-2 right-2 text-slate-400 hover:text-slate-700 text-xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h4 className="text-lg font-semibold mb-4 text-red-600">Validation Errors</h4>
        {errors.length === 0 ? (
          <p className="text-green-600">No errors found.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {errors.map((e, i) => (
              <p key={i} className="text-slate-700 text-sm">
                <span className="font-semibold">Row {e.rowIndex + 1}, {e.column}:</span> {e.message}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EntityPreview({ data }: { data: any[] }) {
  const [showAll, setShowAll] = useState(false);
  if (!data.length) return <div className="text-slate-400 italic">No data uploaded.</div>;
  const keys = Object.keys(data[0]);
  const displayData = showAll ? data : data.slice(0, 5);
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-slate-700 text-lg">Preview</span>
        {data.length > 5 && (
          <button
            className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition"
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? `Show First 5` : `Show All (${data.length})`}
          </button>
        )}
      </div>
      <div className={showAll ? "overflow-x-auto overflow-y-auto rounded border border-slate-200 max-h-96" : "overflow-x-auto rounded border border-slate-200"}>
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {keys.map((k) => (
                <th key={k} className="px-3 py-2 border-b text-left font-medium text-slate-600">{k}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, i) => (
              <tr key={i} className="even:bg-slate-50">
                {keys.map((k) => (
                  <td key={k} className="px-3 py-2 border-b text-slate-700">
                    {typeof row[k] === 'object' ? JSON.stringify(row[k]) : String(row[k])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!showAll && data.length > 5 && (
          <div className="text-xs text-slate-500 px-2 py-1">Showing first 5 of {data.length} rows</div>
        )}
      </div>
    </div>
  );
}
