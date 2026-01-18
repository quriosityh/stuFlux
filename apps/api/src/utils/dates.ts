import { format, parseISO, isBefore, isAfter } from 'date-fns';

export const formatDate = (date: string | Date, dateFormat: string = 'yyyy-MM-dd'): string => {
    return format(typeof date === 'string' ? parseISO(date) : date, dateFormat);
};

export const isDateBefore = (date1: string | Date, date2: string | Date): boolean => {
    return isBefore(typeof date1 === 'string' ? parseISO(date1) : date1, typeof date2 === 'string' ? parseISO(date2) : date2);
};

export const isDateAfter = (date1: string | Date, date2: string | Date): boolean => {
    return isAfter(typeof date1 === 'string' ? parseISO(date1) : date1, typeof date2 === 'string' ? parseISO(date2) : date2);
};