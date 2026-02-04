import cloudinary from "../config/cloudinary.js";

export async function uploadImage(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image provided" });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "receipts",
        });

        res.status(200).json({ imageUrl: result.secure_url });
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ message: "Image upload failed" });
    }
}
