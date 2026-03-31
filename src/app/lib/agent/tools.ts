import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { fetchDentalEntries, filterDentalEntries } from '../dental-data';
import type { DentalEntry, DentalFilterParams } from '../dental-types';

export const queryByDateRangeTool = tool(
    async ({ startDt, endDt }: { startDt: number; endDt: number }): Promise<string> => {
        const results = await fetchDentalEntries({ startDt, endDt });
        return JSON.stringify(results);
    },
    {
        name: 'queryByDateRange',
        description:
            'Retrieves dental records whose entry_date falls within the given epoch-millisecond range.',
        schema: z.object({
            startDt: z.number().describe('Start of the date range as epoch milliseconds (inclusive)'),
            endDt: z.number().describe('End of the date range as epoch milliseconds (inclusive)'),
        }),
    }
);

export const filterByFieldTool = tool(
    async ({
        entriesJson,
        kartei_id,
        patient_id,
        insurance_state,
        file_entry,
        service,
    }: {
        entriesJson: string;
        kartei_id?: number;
        patient_id?: string;
        insurance_state?: string;
        file_entry?: string;
        service?: string;
    }): Promise<string> => {
        const parsed: (Omit<DentalEntry, 'entry_date'> & { entry_date: string })[] =
            JSON.parse(entriesJson) as (Omit<DentalEntry, 'entry_date'> & { entry_date: string })[];

        const entries: DentalEntry[] = parsed.map((e) => ({
            ...e,
            entry_date: new Date(e.entry_date),
        }));

        const filters: DentalFilterParams = {};
        if (kartei_id !== undefined) filters.kartei_id = kartei_id;
        if (patient_id !== undefined) filters.patient_id = patient_id;
        if (insurance_state !== undefined) filters.insurance_state = insurance_state;
        if (file_entry !== undefined) filters.file_entry = file_entry;
        if (service !== undefined) filters.service = service;

        const filtered = filterDentalEntries(entries, filters);
        return JSON.stringify(filtered);
    },
    {
        name: 'filterByField',
        description:
            'Filters a JSON array of dental entries by one or more field values. Pass the JSON string from queryByDateRange as entriesJson.',
        schema: z.object({
            entriesJson: z.string().describe('JSON string of dental entries to filter'),
            kartei_id: z.number().optional().describe('Exact kartei_id match'),
            patient_id: z.string().optional().describe('Case-insensitive substring match on patient_id'),
            insurance_state: z
                .string()
                .optional()
                .describe('Case-insensitive substring match on insurance_state'),
            file_entry: z
                .string()
                .optional()
                .describe('Case-insensitive substring match on file_entry'),
            service: z.string().optional().describe('Case-insensitive substring match on service'),
        }),
    }
);
