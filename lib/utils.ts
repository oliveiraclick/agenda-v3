/**
 * Generates a URL-safe slug from a string.
 * - Converts to lowercase
 * - Removes accents
 * - Replaces spaces and non-alphanumeric characters with hyphens
 * - Removes consecutive hyphens
 */
export const slugify = (text: string): string => {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD') // Normalize accented characters (e.g., 'ã' -> 'a' + '~')
        .replace(/[\u0300-\u036f]/g, '') // Remove the combining characters (the accent marks)
        .replace(/[^\w\s-]/g, '') // Keep only letters, numbers, spaces, and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with a single one
        .trim() // Trim any leading/trailing spaces or hyphens
        .replace(/^-+|-+$/g, ''); // Ensure no hyphens at the start or end
};
