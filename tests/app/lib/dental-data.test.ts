import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// vi.mock is hoisted to the top of the file, so any data referenced inside the
// factory must also be hoisted via vi.hoisted().
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
            patient_id: 'P003',
            insurance_state: 'GKV',
            file_entry: 'Karies an Zahn 25, Komposit-Füllung gelegt.',
            service: 'Füllung',
        },
        {
            kartei_id: 4,
            entry_date: new Date('2024-10-10'),
            patient_id: 'P001',
            insurance_state: 'GKV',
            file_entry: 'Extraktion Zahn 36.',
            service: 'Extraktion',
        },
    ];
    return { MOCK_ENTRIES };
});

vi.mock('../../../src/app/lib/dental-mock', () => ({
    MOCK_DENTAL_ENTRIES: MOCK_ENTRIES,
}));

import { fetchDentalEntries, filterDentalEntries } from '../../../src/app/lib/dental-data';
import type { DentalEntry } from '../../../src/app/lib/dental-types';

// ---------------------------------------------------------------------------
// fetchDentalEntries
// ---------------------------------------------------------------------------

describe('fetchDentalEntries', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns all entries when the date range covers every record', async () => {
        const result = await fetchDentalEntries({
            startDt: new Date('2000-01-01').getTime(),
            endDt: new Date('2099-12-31').getTime(),
        });
        expect(result).toHaveLength(MOCK_ENTRIES.length);
        expect(result).toEqual(MOCK_ENTRIES);
    });

    it('excludes entries outside the date range', async () => {
        // Only the March and May entries should be included
        const result = await fetchDentalEntries({
            startDt: new Date('2024-02-01').getTime(),
            endDt: new Date('2024-06-30').getTime(),
        });
        expect(result).toHaveLength(2);
        expect(result.map((e) => e.kartei_id)).toEqual([1, 2]);
    });

    it('includes entries exactly on the boundary dates', async () => {
        const start = new Date('2024-03-01').getTime();
        const end = new Date('2024-05-15').getTime();
        const result = await fetchDentalEntries({ startDt: start, endDt: end });
        expect(result).toHaveLength(2);
        expect(result.map((e) => e.kartei_id)).toEqual([1, 2]);
    });

    it('returns an empty array when no entries fall in the range', async () => {
        const result = await fetchDentalEntries({
            startDt: new Date('2023-01-01').getTime(),
            endDt: new Date('2023-12-31').getTime(),
        });
        expect(result).toHaveLength(0);
    });
});

// ---------------------------------------------------------------------------
// filterDentalEntries
// ---------------------------------------------------------------------------

describe('filterDentalEntries', () => {
    // Use a fresh copy for every test to avoid mutation side-effects
    let entries: DentalEntry[]; // DentalEntry imported above
    beforeEach(() => {
        entries = [...MOCK_ENTRIES];
    });

    it('filters by patient_id (exact value)', () => {
        const result = filterDentalEntries(entries, { patient_id: 'P001' });
        expect(result).toHaveLength(2);
        result.forEach((e) => expect(e.patient_id).toBe('P001'));
    });

    it('filters by patient_id using case-insensitive substring', () => {
        const result = filterDentalEntries(entries, { patient_id: 'p00' });
        expect(result).toHaveLength(4); // all entries match 'P00x'
    });

    it('filters by insurance_state (GKV)', () => {
        const result = filterDentalEntries(entries, { insurance_state: 'GKV' });
        expect(result).toHaveLength(3);
        result.forEach((e) => expect(e.insurance_state).toBe('GKV'));
    });

    it('filters by insurance_state (PKV)', () => {
        const result = filterDentalEntries(entries, { insurance_state: 'PKV' });
        expect(result).toHaveLength(1);
        expect(result[0].kartei_id).toBe(2);
    });

    it('filters by service (exact case)', () => {
        const result = filterDentalEntries(entries, { service: 'Kontrolle' });
        expect(result).toHaveLength(1);
        expect(result[0].kartei_id).toBe(1);
    });

    it('filters by service (case-insensitive)', () => {
        const result = filterDentalEntries(entries, { service: 'kontrolle' });
        expect(result).toHaveLength(1);
        expect(result[0].kartei_id).toBe(1);
    });

    it('filters by kartei_id (exact number match)', () => {
        const result = filterDentalEntries(entries, { kartei_id: 3 });
        expect(result).toHaveLength(1);
        expect(result[0].service).toBe('Füllung');
    });

    it('filters by entry_date (exact calendar day)', () => {
        const result = filterDentalEntries(entries, {
            entry_date: new Date('2024-05-15'),
        });
        expect(result).toHaveLength(1);
        expect(result[0].kartei_id).toBe(2);
    });

    it('filters by file_entry substring (case-insensitive)', () => {
        const result = filterDentalEntries(entries, { file_entry: 'karies' });
        expect(result).toHaveLength(1);
        expect(result[0].kartei_id).toBe(3);
    });

    it('returns an empty array when no entries match the filter', () => {
        const result = filterDentalEntries(entries, { patient_id: 'P999' });
        expect(result).toHaveLength(0);
    });

    it('applies combined patient_id and service filters', () => {
        const result = filterDentalEntries(entries, {
            patient_id: 'P001',
            service: 'Extraktion',
        });
        expect(result).toHaveLength(1);
        expect(result[0].kartei_id).toBe(4);
    });
});

// ---------------------------------------------------------------------------
// Combined: fetchDentalEntries + filterDentalEntries
// ---------------------------------------------------------------------------

describe('combined date range + field filtering', () => {
    it('returns only matching entries after applying both layers', async () => {
        const fetched = await fetchDentalEntries({
            startDt: new Date('2024-01-01').getTime(),
            endDt: new Date('2024-12-31').getTime(),
        });

        const filtered = filterDentalEntries(fetched, { insurance_state: 'PKV' });

        expect(filtered).toHaveLength(1);
        expect(filtered[0].patient_id).toBe('P002');
    });

    it('returns empty array when date range matches but field filter excludes all', async () => {
        const fetched = await fetchDentalEntries({
            startDt: new Date('2024-03-01').getTime(),
            endDt: new Date('2024-03-01').getTime(),
        });

        const filtered = filterDentalEntries(fetched, { insurance_state: 'PKV' });
        expect(filtered).toHaveLength(0);
    });
});
