import { whatsappService } from "../services/whatsapp.service.js";

export const getWhatsAppStatus = (req, res) => {
    const status = whatsappService.getStatus();
    res.json(status);
};

export const getWhatsAppQr = (req, res) => {
    const qrData = whatsappService.getQrCode();
    if (!qrData) {
        return res.status(404).json({
            message: "No QR code available. Bot may already be connected or stopped.",
            status: whatsappService.getStatus().status,
        });
    }
    res.json(qrData);
};

export const restartWhatsApp = async (req, res) => {
    try {
        await whatsappService.restart();
        res.json({ message: "WhatsApp bot restart initiated.", status: whatsappService.getStatus() });
    } catch (error) {
        console.error("[WhatsApp Controller] Restart error:", error);
        res.status(500).json({ message: "Failed to restart WhatsApp bot.", error: error.message });
    }
};

export const sendTestMessage = async (req, res) => {
    try {
        const { phone, message } = req.body;
        if (!phone) {
            return res.status(400).json({ error: "Phone number is required" });
        }
        const result = await whatsappService.sendTestMessage(phone, message);
        if (result.success) {
            res.json(result);
        } else {
            res.status(503).json(result);
        }
    } catch (error) {
        console.error("[WhatsApp Controller] Send test error:", error);
        res.status(500).json({ error: error.message });
    }
};
