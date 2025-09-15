import { tool } from 'ai';
import { z } from 'zod';

export const getCurrentTime = tool({
    description: 'Get the current date and time',
    inputSchema: z.object({
        // Optional: allow a timezone offset, e.g., +7 for Vietnam
        timezoneOffset: z.number().optional(),
    }),
    execute: async ({ timezoneOffset }) => {
        const now = new Date();

        // If a timezone offset is provided, adjust the time
        let currentTime = now;
        if (typeof timezoneOffset === 'number') {
            const localOffset = now.getTimezoneOffset() / 60; // in hours
            const targetOffset = timezoneOffset;
            const diff = targetOffset + localOffset; // adjust difference
            currentTime = new Date(now.getTime() + diff * 60 * 60 * 1000);
        }

        return {
            iso: currentTime.toISOString(),
            localeString: currentTime.toLocaleString(),
            timestamp: currentTime.getTime(),
        };
    },
});
