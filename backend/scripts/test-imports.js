import fs from "node:fs";
import { join } from "node:path";

console.log("🔍 Diagnostic: Testing Module Imports...");

const testImport = async (name, path) => {
    try {
        const mod = await import(path);
        console.log(`✅ Success: ${name} imported from ${path}`);
        return mod;
    } catch (err) {
        console.error(`❌ Failure: ${name} could NOT be imported from ${path}`);
        console.error(`   Error Code: ${err.code}`);
        console.error(`   Error Message: ${err.message}`);
        if (err.stack) {
            console.error(`   Stack Trace Snippet: ${err.stack.split('\n').slice(0, 3).join('\n')}`);
        }
    }
};

const runDiagnostics = async () => {
    console.log(`Working Directory: ${process.cwd()}`);
    console.log(`Node Version: ${process.version}`);

    await testImport("axios", "axios");
    await testImport("cloudinary", "../src/config/cloudinary.js");
    await testImport("products", "../src/seeds/products.js");
};

runDiagnostics();
