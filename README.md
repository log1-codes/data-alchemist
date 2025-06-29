# Data Alchemist: AI Resource-Allocation Configurator

## Overview
Data Alchemist is an AI-powered web app to clean, validate, and configure resource allocation data. Upload messy CSV/XLSX files, edit in a modern grid, get instant AI validation, define business rules (visually or in natural language), set prioritization weights, and export ready-to-use data and rules for downstream allocation tools.

---

## Features

- Upload CSV or XLSX files for Clients, Workers, and Tasks
- AI-powered header mapping (handles messy or misnamed columns)
- Editable data grid for each entity (inline editing, fast, responsive)
- Real-time validation on upload and edit (missing columns, duplicates, malformed lists, out-of-range values, etc.)
- Error highlighting in the grid and a modal summary panel
- Visual RuleBuilder for all core rule types (co-run, slot-restriction, load-limit, phase-window, pattern-match, precedence override)
- Natural language to rules: type rules in plain English, AI parses and adds them
- List, edit, and remove rules in a modern UI
- Prioritization & Weights panel: sliders, drag-and-drop, and preset profiles
- Export cleaned data (CSV/XLSX) and rules+weights (rules.json) with one click
- Natural language data modification: type commands like "Change all tasks with duration > 2 to duration 2" and the AI will interpret and apply the change to the data grid
- AI rule recommendations: the system analyzes your data and suggests rules you might want to add (e.g., "Tasks T12 and T14 always run together. Add a Co-run rule?")
- AI-based error correction and suggestions: when errors are found, the AI suggests specific fixes (e.g., "Worker W3 is overloaded. Reduce MaxLoadPerPhase or add more workers."). Users can apply fixes with a click
- AI-based validator for broader, context-aware checks: beyond core validations, the AI runs context-aware checks and flags subtle or complex issues (e.g., circular dependencies, skill mismatches, phase-slot saturation)
- Advanced natural language data retrieval/modification: filter or update data using natural language queries (e.g., "Show all workers available in phase 2" or "Increase PriorityLevel for all clients in GroupA")

---

## Tech Stack
- Next.js (App Router, TypeScript)
- shadcn/ui (React UI components)
- Tailwind CSS (modern styling)
- OpenAI API (AI features)
- PapaParse, SheetJS (CSV/XLSX parsing)
- FileSaver.js (downloads)

---

## Setup & Usage
1. Clone the repo and install dependencies:
   ```bash
   git clone https://github.com/log1-codes/data-alchemist.git
   cd data-alchemist
   npm install
   ```
2. Install shadcn/ui (if not already):
   ```bash
   npx shadcn-ui@latest init
   ```
3. Add your OpenAI API key to `.env.local`:
   ```env
   OPENAI_API_KEY=sk-...your-key...
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage Guide
- **Upload Data:** Drag and drop or select your CSV/XLSX files for Clients, Workers, and Tasks.
- **Edit & Validate:** Click any cell to edit. Errors are highlighted and summarized in a modal.
- **Define Rules:** Use the visual builder or type rules in plain English. Remove or edit rules as needed.
- **Set Priorities:** Adjust sliders or use presets to set what matters most for allocation.
- **Export:** Download cleaned data and rules.json for downstream tools.

---

## Contributing
Pull requests and suggestions are welcome! Please open an issue or PR for any improvements, bug fixes, or new features.

---

## License
MIT
