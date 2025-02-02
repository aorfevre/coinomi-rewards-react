import { getWeek } from 'date-fns';

const WEEK_OPTIONS = {
    weekStartsOn: 1, // Monday as week start
    firstWeekContainsDate: 4, // ISO week numbering
};

export const calculateWeek = date => {
    return getWeek(date, WEEK_OPTIONS);
};

export const getWeekOptions = () => {
    const options = [];
    const now = new Date();
    const currentYear = now.getFullYear();

    // Start from the first Monday of the current year
    const firstDay = new Date(currentYear, 0, 1);
    const firstMonday = new Date(firstDay);
    firstMonday.setDate(firstDay.getDate() + ((8 - firstDay.getDay()) % 7));

    // Generate weeks until current date
    let weekStart = new Date(firstMonday);

    while (weekStart <= now) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const formattedStart = weekStart.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
        const formattedEnd = weekEnd.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });

        options.unshift({
            label: `${formattedStart} - ${formattedEnd}`,
            value: `${weekStart.toISOString()}|${weekEnd.toISOString()}`,
        });

        // Move to next Monday
        weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() + 1);
        weekStart.setHours(0, 0, 0, 0);
    }

    return options;
};

export const formatDate = date => {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};
