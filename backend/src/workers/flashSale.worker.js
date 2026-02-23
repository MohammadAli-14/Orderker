import cron from "node-cron";
import { FlashSale } from "../models/flashSale.model.js";

/**
 * Initializes the Flash Sale cron worker.
 * Runs every minute to check for sales that need to be activated or finished.
 * Enforces single-active-sale rule: only activates a scheduled sale if no other is ACTIVE.
 */
export const initFlashSaleWorker = () => {
    cron.schedule("* * * * *", async () => {
        const now = new Date();

        try {
            // 1. Finish Expired Sales FIRST (frees the slot for new activations)
            const salesToFinish = await FlashSale.find({
                status: "ACTIVE",
                endTime: { $lte: now }
            });

            if (salesToFinish.length > 0) {
                console.log(`⚡ Finishing ${salesToFinish.length} flash sales...`);
                for (const sale of salesToFinish) {
                    sale.status = "FINISHED";
                    await sale.save();
                    console.log(`   -> Finished sale: ${sale.title}`);
                }
            }

            // 2. Activate Scheduled Sales (only if no ACTIVE sale exists)
            const currentlyActive = await FlashSale.findOne({ status: "ACTIVE" });

            if (!currentlyActive) {
                // No active sale — safe to activate the next scheduled one
                const nextSale = await FlashSale.findOne({
                    status: "SCHEDULED",
                    startTime: { $lte: now }
                }).sort({ startTime: 1 }); // Activate the earliest one first

                if (nextSale) {
                    nextSale.status = "ACTIVE";
                    await nextSale.save();
                    console.log(`⚡ Activated sale: ${nextSale.title}`);
                }
            } else {
                // An ACTIVE sale exists — check if there are scheduled ones waiting, log a warning
                const pendingScheduled = await FlashSale.countDocuments({
                    status: "SCHEDULED",
                    startTime: { $lte: now }
                });

                if (pendingScheduled > 0) {
                    console.log(`⚠️ ${pendingScheduled} scheduled sale(s) waiting — "${currentlyActive.title}" is still active.`);
                }
            }
        } catch (error) {
            console.error("❌ Error in Flash Sale Worker:", error);
        }
    });

    console.log("⚡ Flash Sale Worker Initialized");
};
