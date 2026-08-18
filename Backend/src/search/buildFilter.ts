export function buildFilter(filters: any) {

    const must: any[] = [];

    if (filters.brand) {
        must.push({
            key: "brand",
            match: {
                value: filters.brand,
            },
        });
    }

    if (filters.category) {
        must.push({
            key: "category",
            match: {
                value: filters.category,
            },
        });
    }

    if (filters.ram) {
        must.push({
            key: "ram",
            match: {
                value: filters.ram,
            },
        });
    }

    if (filters.processor) {
        must.push({
            key: "processor",
            match: {
                value: filters.processor,
            },
        });
    }

    if (filters.gpu) {
        must.push({
            key: "gpu",
            match: {
                value: filters.gpu,
            },
        });
    }

    if (filters.purpose) {
        must.push({
            key: "purpose",
            match: {
                value: filters.purpose,
            },
        });
    }

    if (filters.maxPrice) {
        must.push({
            key: "price",
            range: {
                lte: Number(filters.maxPrice),
            },
        });
    }

    return {
        must,
    };
}