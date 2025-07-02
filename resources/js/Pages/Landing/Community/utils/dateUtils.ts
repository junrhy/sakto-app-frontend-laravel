/**
 * Format date and time for display
 */
export const formatDateTimeForDisplay = (dateTimeString: string | null | undefined, options?: Intl.DateTimeFormatOptions): string => {
    if (!dateTimeString) return 'N/A';
    
    try {
        const date = new Date(dateTimeString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        
        const defaultOptions: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            ...options
        };
        
        return new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
    } catch (error) {
        return 'Invalid Date';
    }
};

/**
 * Format time for display
 */
export const formatTimeForDisplay = (dateTimeString: string | null | undefined, options?: Intl.DateTimeFormatOptions): string => {
    if (!dateTimeString) return 'N/A';
    
    try {
        const date = new Date(dateTimeString);
        if (isNaN(date.getTime())) return 'Invalid Time';
        
        const defaultOptions: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            ...options
        };
        
        return new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
    } catch (error) {
        return 'Invalid Time';
    }
}; 