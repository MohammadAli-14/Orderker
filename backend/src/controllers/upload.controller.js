import cloudinary from "../config/cloudinary.js";

export async function uploadImage(req, res) {
    console.log("Upload request received. File:", req.file ? req.file.originalname : "NONE");
    try {
        if (!req.file) {
            console.warn("No file in request");
            return res.status(400).json({ message: "No image provided" });
        }

        console.log("Uploading to Cloudinary from path:", req.file.path);
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "receipts",
        });

        console.log("Cloudinary upload success:", result.secure_url);
        res.status(200).json({ imageUrl: result.secure_url });
    } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);
        res.status(500).json({ message: "Image upload failed: " + error.message });
    }
}
