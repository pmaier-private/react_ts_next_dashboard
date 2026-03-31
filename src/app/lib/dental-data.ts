import { MOCK_DENTAL_ENTRIES } from './dental-mock';
import type { DentalEntry, DentalFilterParams, DentalQueryParams } from './dental-types';

/**
 * Returns dental entries whose `entry_date` falls within [startDt, endDt].
 *
 * Currently backed by mock data; swap the body to `fetch()` a real REST
 * endpoint when the backend is available.
 */
export async function fetchDentalEntries(
    params: DentalQueryParams
): Promise<DentalEntry[]> {
    const { startDt, endDt } = params;

    return MOCK_DENTAL_ENTRIES.filter((entry) => {
        const ms = entry.entry_date.getTime();
        return ms >= startDt && ms <= endDt;
    });
}

/**
 * Applies field-level filtering to a list of dental entries.
 *
 * - `kartei_id`: exact number match
 * - `entry_date`: exact calendar-day match (year/month/day, ignores time)
 * - All string fields (`patient_id`, `insurance_state`, `file_entry`, `service`):
 *   case-insensitive substring match
 */
export function filterDentalEntries(
    entries: DentalEntry[],
    filters: DentalFilterParams
): DentalEntry[] {
    return entries.filter((entry) => {
        if (filters.kartei_id !== undefined && entry.kartei_id !== filters.kartei_id) {
            return false;
        }

        if (filters.entry_date !== undefined) {
            const f = filters.entry_date;
            const e = entry.entry_date;
            const sameDay =
                e.getFullYear() === f.getFullYear() &&
                e.getMonth() === f.getMonth() &&
                e.getDate() === f.getDate();
            if (!sameDay) return false;
        }

        const stringFields = ['patient_id', 'insurance_state', 'file_entry', 'service'] as const;
        for (const field of stringFields) {
            const filterVal = filters[field];
            if (filterVal !== undefined) {
                if (!entry[field].toLowerCase().includes(filterVal.toLowerCase())) {
                    return false;
                }
            }
        }

        return true;
    });
}
