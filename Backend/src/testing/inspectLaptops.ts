import { getProducts } from "../services/googleSheets.service";

async function run() {
  const products = await getProducts();
  console.log(`Total Laptops in Catalog: ${products.length}`);
  
  const rtxLaptops = products.filter((p: any) => {
    const text = `${p["Product Name"]} ${p["Graphic Processor"]} ${p["name"]}`.toLowerCase();
    return text.includes("rtx");
  });
  
  console.log(`\nFound ${rtxLaptops.length} RTX laptops:`);
  rtxLaptops.forEach((p: any) => {
    console.log(`- ID: ${p.Product_ID} | Brand: ${p.Brand} | Name: ${p.name || p["Product Name"]} | Price: ${p.Price} | GPU: ${p["Graphic Processor"]}`);
  });
}

run().catch(console.error);
