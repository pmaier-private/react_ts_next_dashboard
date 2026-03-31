# AI Chat Interface for Dental Data Exploration

AI-powered chat page (`/chat`) that lets users explore dental data using natural language, backed by a LangGraph dual-LLM agent running in Next.js API routes.

---

## Phase 1 — Data Layer (types, functions, mock)

### Files to create

- `src/app/lib/dental-types.ts`
  - `DentalEntry` interface:
    - `kartei_id: number`
    - `entry_date: Date`
    - `patient_id: string`
    - `insurance_state: string`
    - `file_entry: string`
    - `service: string`
  - `DentalQueryParams` interface:
    - `startDt: number` (epoch millis)
    - `endDt: number` (epoch millis)
  - `DentalFilterParams` interface:
    - Optional fields for each `DentalEntry` field to filter by

- `src/app/lib/dental-data.ts`
  - `fetchDentalEntries(params: DentalQueryParams): Promise<DentalEntry[]>` — plain exported async function; initially imports and returns mock data, later swap body to `fetch()` the real REST endpoint
  - `filterDentalEntries(entries: DentalEntry[], filters: DentalFilterParams): DentalEntry[]` — plain exported function for field-level filtering

- `src/app/lib/dental-mock.ts`
  - `MOCK_DENTAL_ENTRIES: DentalEntry[]` — ~25 hardcoded records with realistic dental data (varied patients, insurance states, services like "Kontrolle", "PZR", "Füllung", "Extraktion", etc.)
  - Date range filtering applied inside `fetchDentalEntries` on `entry_date`
  - Field-level filtering (exact match and substring for string fields) in `filterDentalEntries`

### Tests to create

- `tests/app/lib/dental-data.test.ts`
  - `fetchDentalEntries` returns all entries for wide date range
  - Date range filtering excludes out-of-range entries
  - `filterDentalEntries` by `patient_id`, `insurance_state`, `service` works correctly
  - Combined date + field filtering
  - Empty result when no matches
  - Tests use `vi.mock` on `dental-mock` module when needed

---

## Phase 2 — LangGraph Agent (API route)

### Dependencies to add

- `@langchain/langgraph`
- `@langchain/openai`
- `@langchain/core`

### Environment

- `OPENAI_API_KEY` in `.env.local`

### Files to create

- `src/app/lib/agent/tools.ts`
  - `queryByDateRange` tool — calls `fetchEntries` with start/end dates
  - `filterByField` tool — filters results by any of: `kartei_id`, `patient_id`, `insurance_state`, `file_entry`, `service`, `entry_date`
  - Tools call `fetchDentalEntries` and `filterDentalEntries` directly

- `src/app/lib/agent/graph.ts`
  - LangGraph `StateGraph` with two LLM nodes:
    - **Processor node**: OpenAI model with tool-use capability; interprets user questions, calls tools, formulates answers from retrieved data
    - **Evaluator node**: Separate OpenAI model that reviews the processor's answer and enforces:
      - No medical advice or diagnosis
      - Responses grounded in retrieved data (no hallucination)
      - On-topic (dental data exploration only)
      - Clear, helpful formatting
    - If evaluator rejects, route back to processor with feedback for retry (max 2 retries, then return best-effort answer with disclaimer)
  - Graph edges: `processor → evaluator → (conditional: pass → END, fail → processor)`
  - State schema: messages array, retry count, retrieved data

- `src/app/api/chat/route.ts`
  - `POST` handler accepting `{ messages: { role: string, content: string }[] }`
  - Runs the LangGraph graph
  - Returns streaming response using `ReadableStream` for token-by-token delivery
  - Error handling: returns 500 with error message on failure

### Tests to create

- `tests/app/lib/agent/tools.test.ts`
  - `queryByDateRange` returns correct entries for given range
  - `filterByField` filters correctly for each field
  - Tools return empty arrays for no-match queries

---

## Phase 3 — Chat UI (separate page)

### Files to create

- `src/app/chat/page.tsx`
  - Server component, renders page title/description and `ChatWindow`

- `src/app/chat/ChatWindow.tsx`
  - `"use client"` component
  - State: `messages` array (`{ role: 'user' | 'assistant', content: string }`), `input` string, `isLoading` boolean
  - Scrollable message list with auto-scroll to bottom on new messages
  - Text input + send button at bottom
  - On submit: append user message, POST to `/api/chat`, stream response tokens into an assistant message
  - Loading indicator while streaming
  - Tailwind styling consistent with existing dashboard (zinc palette, Montserrat font)

### Files to modify

- `src/app/page.tsx`
  - Add a navigation link to `/chat` in the header area

### Tests to create

- No unit tests for UI components in this phase (matches existing project convention — no component tests present)

---

## Concerns

- `@langchain/langgraph` TypeScript SDK is evolving — pin versions in `package.json`
- Streaming requires careful error boundary handling for interrupted connections
- Evaluator retries add latency; cap at 2 to keep response times reasonable
- Mock data is static; when switching to a real API (e.g. ivoris), swap the body of `fetchDentalEntries` from mock import to `fetch()` call
- No authentication on `/api/chat` — acceptable for learning project, but flag for production
