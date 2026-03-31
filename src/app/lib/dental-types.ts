export interface DentalEntry {
    kartei_id: number;
    entry_date: Date;
    patient_id: string;
    insurance_state: string;
    file_entry: string;
    service: string;
}

export interface DentalQueryParams {
    /** Start of the date range as epoch milliseconds (inclusive) */
    startDt: number;
    /** End of the date range as epoch milliseconds (inclusive) */
    endDt: number;
}

export interface DentalFilterParams {
    kartei_id?: number;
    entry_date?: Date;
    patient_id?: string;
    insurance_state?: string;
    file_entry?: string;
    service?: string;
}
