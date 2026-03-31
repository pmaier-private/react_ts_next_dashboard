import { describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Hoisted mock data
// ---------------------------------------------------------------------------

const { MOCK_ENTRIES } = vi.hoisted(() => {
    const MOCK_ENTRIES = [
        {
            kartei_id: 1,
            entry_date: new Date('2024-03-01'),
            patient_id: 'P001',
            insurance_state: 'GKV',
            file_entry: 'Routinekontrolle ohne Befund.',
            service: 'Kontrolle',
        },
        {
            kartei_id: 2,
            entry_date: new Date('2024-05-15'),
            patient_id: 'P002',
            insurance_state: 'PKV',
            file_entry: 'Professionelle Zahnreinigung durchgeführt.',
            service: 'PZR',
        },
        {
            kartei_id: 3,
            entry_date: new Date('2024-08-20'),
            patient_id: 'P001',
            insurance_state: 'GKV',
            file_entry: 'Karies an Zahn 25, Komposit-Füllung gelegt.',
            service: 'Füllung',
        },
    ];
    return { MOCK_ENTRIES };
});

vi.mock('../../../../src/app/lib/dental-data', () => ({
    fetchDentalEntries: vi.fn(async ({ startDt, endDt }: { startDt: number; endDt: number }) =>
        MOCK_ENTRIES.filter((e) => {
            const ms = e.entry_date.getTime();
            return ms >= startDt && ms <= endDt;
        })
    ),
    filterDentalEntries: vi.fn(
        (entries: typeof MOCK_ENTRIES, filters: { patient_id?: string; kartei_id?: number }) => {
            return entries.filter((e) => {
                if (filters.kartei_id !== undefined && e.kartei_id !== filters.kartei_id) return false;
                if (
                    filters.patient_id !== undefined &&
                    !e.patient_id.toLowerCase().includes(filters.patient_id.toLowerCase())
                )
                    return false;
                return true;
            });
        }
    ),
}));

import { filterByFieldTool, queryByDateRangeTool } from '../../../../src/app/lib/agent/tools';

// ---------------------------------------------------------------------------
// queryByDateRangeTool
// ---------------------------------------------------------------------------

describe('queryByDateRangeTool', () => {
    it('returns a JSON array of matching entries for a broad date range', async () => {
        const result = await queryByDateRangeTool.invoke({
            startDt: new Date('2000-01-01').getTime(),
            endDt: new Date('2099-12-31').getTime(),
        });

        const parsed: unknown[] = JSON.parse(result) as unknown[];
        expect(parsed).toHaveLength(MOCK_ENTRIES.length);
    });

    it('returns "[]" when no entries fall within the range', async () => {
        const result = await queryByDateRangeTool.invoke({
            startDt: new Date('2023-01-01').getTime(),
            endDt: new Date('2023-12-31').getTime(),
        });

        expect(result).toBe('[]');
    });

    it('includes only entries within the specified range', async () => {
        const result = await queryByDateRangeTool.invoke({
            startDt: new Date('2024-03-01').getTime(),
            endDt: new Date('2024-03-01').getTime(),
        });

        const parsed = JSON.parse(result) as { kartei_id: number }[];
        expect(parsed).toHaveLength(1);
        expect(parsed[0].kartei_id).toBe(1);
    });
});

// ---------------------------------------------------------------------------
// filterByFieldTool
// ---------------------------------------------------------------------------

describe('filterByFieldTool', () => {
    it('filters entries by patient_id', async () => {
        const entriesJson = JSON.stringify(MOCK_ENTRIES);

        const result = await filterByFieldTool.invoke({
            entriesJson,
            patient_id: 'P001',
        });

        const parsed = JSON.parse(result) as { patient_id: string }[];
        expect(parsed.length).toBeGreaterThan(0);
        parsed.forEach((e) => expect(e.patient_id).toBe('P001'));
    });

    it('returns "[]" when patient_id matches no entries', async () => {
        const entriesJson = JSON.stringify(MOCK_ENTRIES);

        const result = await filterByFieldTool.invoke({
            entriesJson,
            patient_id: 'P999',
        });

        expect(result).toBe('[]');
    });

    it('re-hydrates entry_date ISO strings to Date objects before filtering', async () => {
        // JSON serialisation converts Date → ISO string; filterByFieldTool must survive this
        const serialised = JSON.stringify(MOCK_ENTRIES); // entry_date becomes ISO string
        const result = await filterByFieldTool.invoke({ entriesJson: serialised, kartei_id: 2 });
        const parsed = JSON.parse(result) as { kartei_id: number }[];
        expect(parsed).toHaveLength(1);
        expect(parsed[0].kartei_id).toBe(2);
    });
});
