"use client"
import React, { useState, useEffect } from 'react';
import FileUploader from '@/components/FileUploader';
import EditableDataGrid from '@/components/EditableDataGrid';
import { Client, Worker, Task, RowError } from '@/types/data';
import { normalizeClient, normalizeWorker, normalizeTask, mapHeadersWithAI } from '@/lib/parsing';
import { validateClients, validateWorkers, validateTasks } from '@/lib/validation';
import RuleSection from '@/components/RuleSection';
import { Rule } from '@/components/RuleBuilder';
import PrioritizationSection from '@/components/PrioritizationSection';
import { Weights } from '@/components/PrioritizationPanel';
import ExportPanel from '@/components/ExportPanel';
import EntitySection from '@/components/EntitySection';
import AiValidatorPanel from '@/components/AiValidatorPanel';

export default function HomePage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clientErrors, setClientErrors] = useState<RowError[]>([]);
  const [workerErrors, setWorkerErrors] = useState<RowError[]>([]);
  const [taskErrors, setTaskErrors] = useState<RowError[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [weights, setWeights] = useState<Weights>({
    priority: 3,
    fairness: 3,
    cost: 3,
    fulfillment: 3,
    workload: 3,
  });
  const [validatorOpen, setValidatorOpen] = useState(false);
  const [validatorLoading, setValidatorLoading] = useState(false);
  const [validatorFindings, setValidatorFindings] = useState<string[]>([]);
  const [validatorError, setValidatorError] = useState<string | null>(null);

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

  async function runAiValidator() {
    setValidatorOpen(true);
    setValidatorLoading(true);
    setValidatorError(null);
    setValidatorFindings([]);
    try {
      const res = await fetch('/api/aiValidator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clients, workers, tasks, rules }),
      });
      const data = await res.json();
      setValidatorFindings(data.findings || []);
    } catch (e: any) {
      setValidatorError(e.message || 'Failed to run AI Validator');
    } finally {
      setValidatorLoading(false);
    }
  }

  return (
    <main className="container mx-auto py-10 px-4 min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <section className="mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold text-slate-700">AI Validator</h2>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            onClick={runAiValidator}
            disabled={validatorLoading}
          >
            {validatorLoading ? 'Running...' : 'Run AI Validator'}
          </button>
        </div>
        <AiValidatorPanel
          findings={validatorFindings}
          loading={validatorLoading}
          error={validatorError}
          open={validatorOpen}
          onClose={() => setValidatorOpen(false)}
        />
      </section>
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-slate-800">Data Alchemist</h1>
        <p className="text-lg text-slate-600">AI Resource-Allocation Configurator</p>
      </div>
      <section className="mb-12">
        <div className="flex items-center mb-6 gap-4">
          <span className="bg-gradient-to-tr from-blue-500 to-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-extrabold shadow-lg border-4 border-white">1</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 drop-shadow-sm">Upload Your Data</h2>
        </div>
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-2xl p-6 flex flex-col items-center gap-4">
          <div className="flex flex-row gap-8 w-full justify-center">
            <div className="flex flex-col items-center gap-2">
              <FileUploader label="Clients" icon="users" compact onFileParsed={handleClients} />
              <span className={`text-xs mt-1 ${clients.length ? 'text-green-600' : 'text-gray-400'}`}>{clients.length ? 'Uploaded' : 'Not uploaded'}</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <FileUploader label="Workers" icon="briefcase" compact onFileParsed={handleWorkers} />
              <span className={`text-xs mt-1 ${workers.length ? 'text-green-600' : 'text-gray-400'}`}>{workers.length ? 'Uploaded' : 'Not uploaded'}</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <FileUploader label="Tasks" icon="clipboard-list" compact onFileParsed={handleTasks} />
              <span className={`text-xs mt-1 ${tasks.length ? 'text-green-600' : 'text-gray-400'}`}>{tasks.length ? 'Uploaded' : 'Not uploaded'}</span>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="flex items-center mb-6 gap-4">
          <span className="bg-gradient-to-tr from-green-500 to-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-extrabold shadow-lg border-4 border-white">2</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 drop-shadow-sm">Edit & Validate Data</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-slate-200 min-h-[200px] flex flex-col justify-center transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
            <EntitySection
              title="Clients"
              data={clients}
              setData={setClients}
              errors={clientErrors}
              errorSummary={clientErrors}
              entity="clients"
            />
          </div>
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-slate-200 min-h-[200px] flex flex-col justify-center transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
            <EntitySection
              title="Workers"
              data={workers}
              setData={setWorkers}
              errors={workerErrors}
              errorSummary={workerErrors}
              entity="workers"
            />
          </div>
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-slate-200 min-h-[200px] flex flex-col justify-center transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
            <EntitySection
              title="Tasks"
              data={tasks}
              setData={setTasks}
              errors={taskErrors}
              errorSummary={taskErrors}
              entity="tasks"
            />
          </div>
        </div>
      </section>
      <section className="mb-12 mt-12">
        <div className="flex items-center mb-6 gap-4">
          <span className="bg-gradient-to-tr from-purple-500 to-pink-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-extrabold shadow-lg border-4 border-white">3</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 drop-shadow-sm">Define Business Rules</h2>
        </div>
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-2xl p-10 border border-slate-200 flex flex-col gap-8 transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(191,38,135,0.15)]">
          <RuleSection
            rules={rules}
            setRules={setRules}
            taskIDs={tasks.map(t => t.TaskID)}
            clientGroups={[...new Set(clients.map(c => c.GroupTag))].filter(Boolean)}
            workerGroups={[...new Set(workers.map(w => w.WorkerGroup))].filter(Boolean)}
            clients={clients}
            workers={workers}
            tasks={tasks}
          />
        </div>
      </section>
      <section className="mb-12 mt-12">
        <div className="flex items-center mb-6 gap-4">
          <span className="bg-gradient-to-tr from-pink-500 to-orange-400 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-extrabold shadow-lg border-4 border-white">4</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 drop-shadow-sm">Prioritization & Weights</h2>
        </div>
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-2xl p-10 border border-slate-200 flex flex-col gap-8 transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(255,99,71,0.15)]">
          <PrioritizationSection weights={weights} setWeights={setWeights} />
        </div>
      </section>
      <section className="mb-12 mt-12">
        <div className="flex items-center mb-6 gap-4">
          <span className="bg-gradient-to-tr from-green-400 to-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-extrabold shadow-lg border-4 border-white">5</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 drop-shadow-sm">Export Cleaned Data & Rules</h2>
        </div>
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-2xl p-10 border border-slate-200 flex flex-col gap-8 transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(38,135,191,0.15)]">
          <ExportPanel
            clients={clients}
            workers={workers}
            tasks={tasks}
            rules={rules}
            weights={weights}
          />
        </div>
      </section>
    </main>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-slate-200 min-h-[200px] flex flex-col justify-center transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
      {children}
    </div>
  );
}
