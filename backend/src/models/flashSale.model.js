import mongoose from "mongoose";

const flashSaleSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ["DRAFT", "SCHEDULED", "ACTIVE", "FINISHED"],
            default: "DRAFT",
        },
        discountType: {
            type: String,
            enum: ["INDIVIDUAL", "GLOBAL"],
            default: "INDIVIDUAL",
        },
        globalDiscountPercent: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        products: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
        ],
        bannerImage: {
            type: String,
        },
    },
    { timestamps: true }
);

export const FlashSale = mongoose.model("FlashSale", flashSaleSchema);
