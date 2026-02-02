# React Frontend Specification

## Overview

Replace Alpine.js with React for the Content Pipeline UI. This is the right choice for a long-term product that will become the hub for all content creation.

---

## Technology Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **Framework** | React 18 | Industry standard, huge ecosystem, TypeScript-ready |
| **Build** | Vite | Fast dev server, instant HMR, easy config |
| **Routing** | React Router v6 | Standard, supports nested layouts |
| **Server State** | TanStack Query v5 | Handles caching, refetching, background sync |
| **Tables** | TanStack Table v8 | Headless, 50k+ row support, sorting/filtering built-in |
| **Styling** | Tailwind CSS | Already using it, no change needed |
| **Types** | TypeScript | Catch bugs early, better DX |

---

## Project Structure

```
content-pipeline/
├── server/                    # Existing Express backend
│   ├── routes/
│   ├── index.js
│   └── package.json
│
├── client/                    # NEW: React frontend
│   ├── src/
│   │   ├── main.tsx          # Entry point
│   │   ├── App.tsx           # Root component + router
│   │   ├── api/              # API client functions
│   │   │   ├── client.ts     # Fetch wrapper
│   │   │   ├── submodules.ts # Submodule API calls
│   │   │   └── runs.ts       # Pipeline run API calls
│   │   ├── components/       # Reusable components
│   │   │   ├── ui/           # Base UI (Button, Card, Badge)
│   │   │   ├── ResultsTable.tsx
│   │   │   ├── SubmoduleCard.tsx
│   │   │   ├── StepContainer.tsx
│   │   │   └── ApprovalPane.tsx
│   │   ├── hooks/            # Custom hooks
│   │   │   ├── useSubmoduleResults.ts
│   │   │   └── useWebSocket.ts
│   │   ├── pages/            # Route pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── PipelineRun.tsx
│   │   │   └── SubmoduleDetail.tsx
│   │   ├── types/            # TypeScript types
│   │   │   └── index.ts
│   │   └── lib/              # Utilities
│   │       └── utils.ts
│   ├── index.html
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── package.json
│
├── public/                    # Keep for now (gradual migration)
└── docker-compose.yml
```

---

## Key Components

### 1. ResultsTable (Core Component)

Handles the per-result approval workflow from Gap 2.

```tsx
// client/src/components/ResultsTable.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createColumnHelper, useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';

interface ResultRow {
  approval_id: string;
  url: string;
  entity_name: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Props {
  runId: string;
  submoduleRunId: string;
}

export function ResultsTable({ runId, submoduleRunId }: Props) {
  const queryClient = useQueryClient();

  // Fetch results from server
  const { data, isLoading } = useQuery({
    queryKey: ['results', runId, submoduleRunId],
    queryFn: () => fetchResults(runId, submoduleRunId),
    refetchInterval: 5000, // Poll every 5s (or use WebSocket)
  });

  // Approval mutation
  const approveMutation = useMutation({
    mutationFn: ({ approvalId, action }: { approvalId: string; action: 'approve' | 'reject' }) =>
      patchApproval(runId, submoduleRunId, approvalId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results', runId, submoduleRunId] });
    },
  });

  // Batch approval mutation
  const batchMutation = useMutation({
    mutationFn: (approvals: { result_id: string; action: 'approve' | 'reject' }[]) =>
      batchApproval(runId, submoduleRunId, approvals),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results', runId, submoduleRunId] });
    },
  });

  const columnHelper = createColumnHelper<ResultRow>();

  const columns = [
    columnHelper.accessor('url', {
      header: 'URL',
      cell: info => <span className="truncate max-w-xs">{info.getValue()}</span>,
    }),
    columnHelper.accessor('entity_name', {
      header: 'Entity',
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => <StatusBadge status={info.getValue()} />,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => row.original.status === 'pending' && (
        <div className="flex gap-2">
          <button
            onClick={() => approveMutation.mutate({ approvalId: row.original.approval_id, action: 'approve' })}
            className="btn-approve"
          >
            ✓
          </button>
          <button
            onClick={() => approveMutation.mutate({ approvalId: row.original.approval_id, action: 'reject' })}
            className="btn-reject"
          >
            ✗
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: data?.results ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {/* Summary bar */}
      <div className="summary-bar">
        <span>Pending: {data?.summary?.pending ?? 0}</span>
        <span>Approved: {data?.summary?.approved ?? 0}</span>
        <span>Rejected: {data?.summary?.rejected ?? 0}</span>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className={row.original.status === 'approved' ? 'bg-green-50' : row.original.status === 'rejected' ? 'bg-red-50' : ''}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bulk actions */}
      <div className="bulk-actions mt-4">
        <button
          onClick={() => {
            const pending = data?.results?.filter(r => r.status === 'pending') ?? [];
            batchMutation.mutate(pending.map(r => ({ result_id: r.approval_id, action: 'approve' })));
          }}
          className="btn-primary"
        >
          Approve All Pending
        </button>
        <button
          onClick={() => {
            const pending = data?.results?.filter(r => r.status === 'pending') ?? [];
            batchMutation.mutate(pending.map(r => ({ result_id: r.approval_id, action: 'reject' })));
          }}
          className="btn-secondary ml-2"
        >
          Reject All Pending
        </button>
      </div>
    </div>
  );
}
```

### 2. WebSocket Hook (Real-time Updates)

```tsx
// client/src/hooks/useWebSocket.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useWebSocket(runId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const ws = new WebSocket(`ws://${location.host}`);

    ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);

      if (data.run_id !== runId) return;

      switch (type) {
        case 'submodule_complete':
        case 'submodule_approval':
          // Invalidate relevant queries to trigger refetch
          queryClient.invalidateQueries({ queryKey: ['results', runId, data.submodule_run_id] });
          queryClient.invalidateQueries({ queryKey: ['submoduleRuns', runId] });
          break;
      }
    };

    return () => ws.close();
  }, [runId, queryClient]);
}
```

### 3. API Client

```tsx
// client/src/api/submodules.ts
const API_BASE = '/api';

export async function fetchResults(runId: string, submoduleRunId: string) {
  const res = await fetch(`${API_BASE}/submodules/runs/${runId}/${submoduleRunId}/results`);
  if (!res.ok) throw new Error('Failed to fetch results');
  return res.json();
}

export async function patchApproval(
  runId: string,
  submoduleRunId: string,
  approvalId: string,
  action: 'approve' | 'reject',
  reason?: string
) {
  const res = await fetch(
    `${API_BASE}/submodules/runs/${runId}/${submoduleRunId}/results/${approvalId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason }),
    }
  );
  if (!res.ok) throw new Error('Failed to update approval');
  return res.json();
}

export async function batchApproval(
  runId: string,
  submoduleRunId: string,
  approvals: { result_id: string; action: 'approve' | 'reject' }[]
) {
  const res = await fetch(
    `${API_BASE}/submodules/runs/${runId}/${submoduleRunId}/batch-approval`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvals }),
    }
  );
  if (!res.ok) throw new Error('Failed to batch approve');
  return res.json();
}
```

---

## Migration Strategy

### Phase 1: Parallel Setup (Day 1)

1. Create `client/` directory with Vite + React
2. Configure Vite proxy to forward `/api/*` to Express
3. Keep existing `public/index.html` working
4. New React app at `/app` route (or similar)

### Phase 2: Core Components (Days 2-3)

1. Build `ResultsTable` component
2. Build `SubmoduleCard` component
3. Build `StepContainer` component
4. Set up TanStack Query provider

### Phase 3: Integration (Days 4-5)

1. Build full pipeline run page
2. Wire up WebSocket hook
3. Test with real data
4. Verify all Gap 2 features work

### Phase 4: Cutover (Day 6)

1. Replace old Alpine UI with React
2. Remove `public/` Alpine code
3. Update deployment scripts

---

## Vite Configuration

```ts
// client/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:3000',
        ws: true,
      },
    },
  },
  build: {
    outDir: '../public-react', // Build output
  },
});
```

---

## Package Dependencies

```json
{
  "name": "content-pipeline-client",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.22.0",
    "@tanstack/react-query": "^5.18.0",
    "@tanstack/react-table": "^8.11.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.55",
    "@types/react-dom": "^18.2.19",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3",
    "vite": "^5.1.0"
  }
}
```

---

## TypeScript Types

```ts
// client/src/types/index.ts

export interface PipelineRun {
  id: string;
  project_id: string;
  status: 'running' | 'completed' | 'failed';
  step_1_status: 'active' | 'completed' | 'locked';
  step_2_status: 'active' | 'completed' | 'locked';
  step_3_status: 'active' | 'completed' | 'locked';
  created_at: string;
}

export interface SubmoduleRun {
  id: string;
  run_id: string;
  submodule_type: string;
  submodule_name: string;
  status: 'pending' | 'running' | 'completed' | 'approved' | 'failed';
  result_count: number;
  approved_count: number;
  rejected_count: number;
  created_at: string;
}

export interface ResultApproval {
  approval_id: string;
  result_index: number;
  result_url: string | null;
  result_entity_id: string | null;
  result_entity_name: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  decided_at: string | null;
}

export interface ResultsResponse {
  results: ResultApproval[];
  summary: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

export interface SubmoduleDefinition {
  type: string;
  name: string;
  displayName: string;
  description: string;
  options?: SubmoduleOption[];
}

export interface SubmoduleOption {
  name: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  default?: unknown;
  options?: { label: string; value: string }[];
}
```

---

## Benefits of This Approach

1. **Type Safety**: Catch errors at compile time, not runtime
2. **Caching**: TanStack Query handles cache invalidation automatically
3. **Real-time**: WebSocket hook triggers query invalidation
4. **Scalable**: TanStack Table handles 50k+ rows with virtualization
5. **Maintainable**: Clear separation of concerns
6. **Future-proof**: React ecosystem, easy to add new features
7. **Gradual Migration**: Can run alongside existing Alpine code

---

## Server Changes Required

Minimal. The Express backend already has all required endpoints. Only change:

1. **Serve React build**: Update Express to serve `public-react/` for production
2. **CORS (dev only)**: Already handled by Vite proxy

```js
// server/index.js addition for production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../public-react')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public-react/index.html'));
  });
}
```

---

## Success Criteria

- [ ] React app loads and renders pipeline dashboard
- [ ] Results table displays with per-result approve/reject
- [ ] Bulk approve/reject works
- [ ] Summary counts update after actions
- [ ] WebSocket updates trigger UI refresh
- [ ] Page refresh preserves state (server is truth)
- [ ] 10k+ URLs renders smoothly (virtualization)
- [ ] TypeScript catches type errors at build time

---

*Document created: 2026-02-01*
*Based on: CTO recommendation for long-term product architecture*
