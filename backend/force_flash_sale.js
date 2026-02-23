import mongoose from 'mongoose';

const DB_URL = "mongodb+srv://rajaali8383679_db_user:XgeJnsk1XZWiSNF3@cluster0.w9hxopc.mongodb.net/?appName=Cluster0";

// Minimal schema definition to avoid import issues
const flashSaleSchema = new mongoose.Schema({
    title: String,
    startTime: Date,
    endTime: Date,
    status: String
}, { strict: false }); // Allow other fields to exist

const FlashSale = mongoose.model("FlashSale", flashSaleSchema);

const update = async () => {
    try {
        console.log('Connecting...');
        await mongoose.connect(DB_URL);
        console.log('Connected!');

        const sale = await FlashSale.findOne({ title: "Ramadan Flash Sale" });
        if (!sale) {
            console.error('Sale not found');
            process.exit(1);
        }

        console.log(`Updating "${sale.title}" from ${sale.status}...`);

        // Set End Time to 48 hours from now to be safe
        const newEnd = new Date();
        newEnd.setHours(newEnd.getHours() + 48);

        sale.endTime = newEnd;
        sale.status = 'ACTIVE';

        await sale.save();
        console.log(`✅ Success! New End: ${newEnd.toISOString()}`);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

update();
