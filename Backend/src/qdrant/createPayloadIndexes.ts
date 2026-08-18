import { qdrant } from "../config/qdrant";

async function createIndexes() {
    try {

        const keywordFields = [
            "brand",
            "category",
            "ram",
            "processor",
            "gpu",
            "purpose"
        ];

        for (const field of keywordFields) {

            console.log(`Creating keyword index for ${field}...`);

            await qdrant.createPayloadIndex("products", {
                field_name: field,
                field_schema: "keyword",
            });

        }

        console.log("Creating integer index for price...");

        await qdrant.createPayloadIndex("products", {
            field_name: "price",
            field_schema: "integer",
        });

        console.log("All payload indexes created successfully.");

    } catch (error) {
        console.error(error);
    }
}

createIndexes();