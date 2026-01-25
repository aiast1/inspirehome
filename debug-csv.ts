
import fs from 'fs';
import path from 'path';

// --- Replicating Parser Logic Correctly ---

interface Product {
    id: string;
    title: string;
    categories: string[];
    inStock: boolean;
    stockStatus: string;
}

function createSlug(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function parseProductsFromCSV(csvText: string): Product[] {
    const cleanText = csvText.replace(/^\uFEFF/, '');
    const records: string[][] = [];
    let currentRecord: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < cleanText.length; i++) {
        const char = cleanText[i];
        const nextChar = cleanText[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                currentField += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            currentRecord.push(currentField.trim());
            currentField = '';
        } else if ((char === '\n' || char === '\r') && !inQuotes) {
            if (char === '\r' && nextChar === '\n') i++;
            if (currentField || currentRecord.length > 0) {
                currentRecord.push(currentField.trim());
                if (currentRecord.length > 1) records.push(currentRecord);
                currentRecord = [];
                currentField = '';
            }
        } else {
            currentField += char;
        }
    }
    if (currentField || currentRecord.length > 0) {
        currentRecord.push(currentField.trim());
        if (currentRecord.length > 1) records.push(currentRecord);
    }

    if (records.length < 2) return [];

    const header = records[0];
    const indices = {
        title: header.findIndex(h => h.includes('post_title')),
        stockStatus: header.findIndex(h => h === 'stock_status'),
        categories: header.findIndex(h => h === 'tax:product_cat'),
        price: header.findIndex(h => h === 'regular_price'),
    };

    const products: Product[] = [];
    // Use the SAME limit as the source code was updated to
    const maxProducts = 30000;

    for (let i = 1; i < Math.min(records.length, maxProducts + 1); i++) {
        const fields = records[i];
        if (!fields || fields.length < 5) continue;

        const priceStr = fields[indices.price] || '0';
        const price = parseFloat(priceStr) || 0;
        if (price <= 0) continue; // Parser skips these

        const catField = fields[indices.categories] || '';
        const categories = catField.split('|').map(c => c.trim()).filter(Boolean);
        const stockStatus = fields[indices.stockStatus] || '';

        products.push({
            id: `product-${i}`,
            title: fields[indices.title],
            categories,
            inStock: stockStatus !== 'outofstock',
            stockStatus
        });
    }
    return products;
}

// --- Analysis Logic ---

function analyze() {
    const csvPath = path.resolve('public/data/products.csv');
    console.log(`Reading ${csvPath}...`);
    const csvText = fs.readFileSync(csvPath, 'utf8');
    const products = parseProductsFromCSV(csvText);

    console.log(`\nTotal Parsed Products: ${products.length}`);

    // 1. Stock Analysis
    const inStock = products.filter(p => p.inStock).length;
    console.log(`In Stock: ${inStock}`);
    console.log(`Out of Stock: ${products.length - inStock}`);

    // 2. Category Analysis (Logic from extractCategories)
    const visibleCategories = new Set<string>();
    const productsInVisibleCategories = new Set<string>();

    products.forEach(p => {
        let isVisible = false;
        p.categories.forEach(cat => {
            // Logic from productParser.ts:
            // } else if (cat && !cat.includes('OFFERS') && !cat.includes('SPECIAL') && !cat.includes('Families')) {

            if (cat.includes('>')) {
                const [parent] = cat.split('>').map(s => s.trim());
                visibleCategories.add(parent);
                isVisible = true;
            } else if (cat && !cat.includes('OFFERS') && !cat.includes('SPECIAL') && !cat.includes('Families')) {
                visibleCategories.add(cat);
                isVisible = true;
            }
        });

        if (isVisible) {
            productsInVisibleCategories.add(p.id);
        }
    });

    console.log(`\nVisible Categories Found: ${visibleCategories.size}`);
    console.log(`Products in a Visible Category: ${productsInVisibleCategories.size}`);
    console.log(`Orphaned Products (No Visible Category): ${products.length - productsInVisibleCategories.size}`);

    console.log("\n--- Top 20 Visible Categories (by product count) ---");
    // Quick accurate count for display
    const catCounts: { [key: string]: number } = {};
    products.forEach(p => {
        p.categories.forEach(cat => {
            if (cat.includes('>')) {
                const [parent] = cat.split('>').map(s => s.trim());
                catCounts[parent] = (catCounts[parent] || 0) + 1;
            } else if (cat && !cat.includes('OFFERS') && !cat.includes('SPECIAL') && !cat.includes('Families')) {
                catCounts[cat] = (catCounts[cat] || 0) + 1;
            }
        });
    });

    Object.entries(catCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .forEach(([name, count]) => console.log(`${name}: ${count}`));

    console.log("\n--- Sample Orphaned Products (First 5) ---");
    const orphans = products.filter(p => !productsInVisibleCategories.has(p.id)).slice(0, 5);
    orphans.forEach(p => {
        console.log(`- ${p.title} [Categories: ${p.categories.join(', ')}]`);
    });

}

analyze();
