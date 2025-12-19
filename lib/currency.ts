// Utility to format currency input (Brazilian Real)
export const formatCurrency = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');

    if (!numbers) return '';

    // Converte para número com centavos
    const amount = parseFloat(numbers) / 100;

    // Formata em BRL
    return amount.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

// Parse formatted currency back to number
export const parseCurrency = (formattedValue: string): number => {
    const numbers = formattedValue.replace(/\D/g, '');
    return parseFloat(numbers) / 100;
};
