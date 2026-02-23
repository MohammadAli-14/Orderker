import { Product } from "../models/product.model.js";
import { applyFlashSaleLogic } from "../utils/productUtils.js";

export async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    const processedProduct = await applyFlashSaleLogic(product);
    res.status(200).json(processedProduct);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
