export const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr || dateTimeStr === 'NA') return 'N/A';

    // Handle database datetime format (2025-09-18 11:57:05)
    let date: Date;
    if (dateTimeStr.includes(' ') && !dateTimeStr.includes('T')) {
        // Database datetime format - convert to ISO format
        date = new Date(dateTimeStr.replace(' ', 'T'));
    } else {
        // ISO format or other standard formats
        date = new Date(dateTimeStr);
    }

    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
};

export const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === 'NA') return 'N/A';

    // Handle different date formats from the database
    let date: Date;

    if (dateStr.includes('T')) {
        // ISO datetime string (2025-09-18T11:57:05.000Z)
        date = new Date(dateStr);
    } else if (dateStr.includes(' ')) {
        // Database datetime format (2025-09-18 11:57:05)
        date = new Date(dateStr.replace(' ', 'T')); // Convert to ISO format
    } else {
        // Date-only string (2025-09-18) - parse as local date to avoid timezone issues
        const [year, month, day] = dateStr.split('-').map(Number);
        date = new Date(year, month - 1, day); // month is 0-indexed
    }

    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
};

export const formatCurrency = (amount: number | string, symbol: string) => {
    const numericAmount =
        typeof amount === 'string' ? parseFloat(amount) : amount;
    const formattedAmount = numericAmount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return symbol + formattedAmount;
};

export const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
        age--;
    }
    return age;
};
