import mongoose from "mongoose";

const whatsappAuthSchema = new mongoose.Schema(
    {
        sessionId: {
            type: String,
            required: true,
            default: "default",
            index: true
        },
        collectionName: {
            type: String,
            required: true,
            index: true
        },
        key: {
            type: String,
            required: true,
            index: true
        },
        data: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

// Compound index for fast lookups and unique mapping of keys within a session
whatsappAuthSchema.index({ sessionId: 1, collectionName: 1, key: 1 }, { unique: true });

export const WhatsAppAuth = mongoose.model("WhatsAppAuth", whatsappAuthSchema);
