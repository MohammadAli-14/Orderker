import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";

export async function createOrder(req, res) {
  try {
    const user = req.user;
    const { orderItems, shippingAddress, paymentResult, totalPrice, paymentMethod, paymentProof } = req.body;

    console.log(`Creating order for user ${user.clerkId} with method: ${paymentMethod}`);
    if (paymentProof) {
      console.log(`Payment Proof received: TxnID: ${paymentProof.transactionId}, URL: ${paymentProof.receiptUrl}`);
    }

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ error: "No order items" });
    }

    // validate products and stock
    for (const item of orderItems) {
      const productId = item.product?._id || item.product;
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.name} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }
    }

    let finalPaymentResult = paymentResult;

    // Handle COD
    if (paymentMethod === 'COD') {
      finalPaymentResult = {
        id: `COD-${Date.now()}`,
        status: 'pending'
      };
    }

    // Handle Easypaisa/JazzCash
    if (['Easypaisa', 'JazzCash'].includes(paymentMethod)) {
      if (!paymentProof?.transactionId || !paymentProof?.receiptUrl) {
        return res.status(400).json({ error: "Transaction ID and receipt are required" });
      }
      finalPaymentResult = {
        id: paymentProof.transactionId,
        status: 'pending' // Admin manually verifies
      };
    }

    const order = await Order.create({
      user: user._id,
      clerkId: user.clerkId,
      orderItems,
      shippingAddress,
      paymentResult: finalPaymentResult,
      paymentMethod: paymentMethod || "Stripe",
      paymentProof,
      totalPrice,
    });

    // update product stock
    for (const item of orderItems) {
      const productId = item.product?._id || item.product;
      await Product.findByIdAndUpdate(productId, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    console.error("Error in createOrder controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getUserOrders(req, res) {
  try {
    const orders = await Order.find({ clerkId: req.user.clerkId })
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    // check if each order has been reviewed

    const orderIds = orders.map((order) => order._id);
    const reviews = await Review.find({ orderId: { $in: orderIds } });
    const reviewedOrderIds = new Set(reviews.map((review) => review.orderId.toString()));

    const ordersWithReviewStatus = await Promise.all(
      orders.map(async (order) => {
        return {
          ...order.toObject(),
          hasReviewed: reviewedOrderIds.has(order._id.toString()),
        };
      })
    );

    res.status(200).json({ orders: ordersWithReviewStatus });
  } catch (error) {
    console.error("Error in getUserOrders controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
