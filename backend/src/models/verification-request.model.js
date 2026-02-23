import mongoose from "mongoose";

const verificationRequestSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        index: true
    },
    code: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isLid: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // Automatic cleanup by MongoDB
    }
}, { timestamps: true });

export const VerificationRequest = mongoose.model("VerificationRequest", verificationRequestSchema);
