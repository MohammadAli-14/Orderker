import mongoose from "mongoose";

const whatsappSessionSchema = new mongoose.Schema(
    {
        sessionId: {
            type: String,
            required: true,
            unique: true,
            default: "default"
        },
        data: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export const WhatsAppSession = mongoose.model("WhatsAppSession", whatsappSessionSchema);
