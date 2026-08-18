export interface RequirementResult {
    canSearch: boolean;
    message?: string;
}

export function checkRequirements(
    query: string,
    filters: any
): RequirementResult {

    const text = query.toLowerCase();

    const hasCategory =
        !!filters.category ||
        text.includes("laptop") ||
        text.includes("software") ||
        text.includes("printer") ||
        text.includes("monitor");

    const hasDetails =
        !!filters.brand ||
        !!filters.model ||
        !!filters.processor ||
        !!filters.ram ||
        !!filters.storage ||
        !!filters.gpu ||
        !!filters.maxPrice ||
        !!filters.purpose;

    if (!hasCategory) {
        return {
            canSearch: false,
            message:
`I'd be happy to help you.

Could you please tell me which product you're looking for?

For example:
• Laptop
• Desktop
• Printer
• Software

Once I know the product type, I'll help you find the most suitable option.`
        };
    }

    if (!hasDetails) {
        return {
            canSearch: false,
            message:
`Thank you for your interest.

To recommend the most suitable ${filters.category ?? "product"}, could you please provide one or more of the following details?

• Budget or price range
• Preferred brand
• Required specifications
• Intended use

Example:
Gaming laptop under ₹80,000
Dell laptop with 16GB RAM
Business software for 50 users`
        };
    }

    return {
        canSearch: true,
    };
}