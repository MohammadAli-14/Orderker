import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";

export async function createOrder(req, res) {
  try {
    const user = req.user;
    const { orderItems, shippingAddress, paymentResult, totalPrice, paymentMethod, paymentProof } = req.body;

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
      finalPaymentResult = {
        id: paymentProof?.transactionId || `PENDING-${Date.now()}`,
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
    console.error("❌ Order Creation Error:", {
      message: error.message,
      name: error.name,
      errors: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : null
    });
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

export async function getUserOrders(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const cursor = req.query.cursor;

    let query = { clerkId: req.user.clerkId };
    if (cursor) {
      query._id = { $lt: cursor };
    }

    // Fetch limit + 1 to check if there's a next page
    const orders = await Order.find(query)
      .populate("orderItems.product")
      .sort({ _id: -1 })
      .limit(limit + 1);

    const hasMore = orders.length > limit;
    const resultOrders = hasMore ? orders.slice(0, limit) : orders;
    const nextCursor = hasMore ? resultOrders[resultOrders.length - 1]._id : null;

    // check if each order has been reviewed
    const orderIds = resultOrders.map((order) => order._id);
    const reviews = await Review.find({ orderId: { $in: orderIds } });
    const reviewedOrderIds = new Set(reviews.map((review) => review.orderId.toString()));

    const ordersWithReviewStatus = resultOrders.map((order) => {
      return {
        ...order.toObject(),
        hasReviewed: reviewedOrderIds.has(order._id.toString()),
      };
    });

    res.status(200).json({
      orders: ordersWithReviewStatus,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("Error in getUserOrders controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getOrderById(req, res) {
  try {
    console.log(`Fetching order by ID: ${req.params.id} for user ${req.user.clerkId}`);

    // Use findById first to be sure we're getting the order
    const order = await Order.findById(req.params.id).populate("orderItems.product");

    if (!order) {
      console.log(`Order ${req.params.id} not found at all`);
      return res.status(404).json({ error: "Order not found" });
    }

    // Verify ownership
    if (order.clerkId !== req.user.clerkId) {
      console.log(`Order ${req.params.id} belongs to ${order.clerkId}, not ${req.user.clerkId}`);
      return res.status(403).json({ error: "Unauthorized access to this order" });
    }

    // Check review status (consistent with list view)
    const review = await Review.findOne({ orderId: order._id });
    const orderWithStatus = {
      ...order.toObject(),
      hasReviewed: !!review
    };

    res.status(200).json({ order: orderWithStatus });
  } catch (error) {
    console.error("Error in getOrderById controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateOrderPaymentProof(req, res) {
  try {
    const { id } = req.params;
    const { paymentProof } = req.body;

    if (!paymentProof?.transactionId || !paymentProof?.receiptUrl) {
      return res.status(400).json({ error: "Transaction ID and receipt URL are required" });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Verify ownership
    if (order.clerkId !== req.user.clerkId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    order.paymentProof = paymentProof;
    order.paymentResult = {
      ...order.paymentResult,
      id: paymentProof.transactionId,
    };

    await order.save();

    res.status(200).json({ message: "Payment proof updated successfully", order });
  } catch (error) {
    console.error("Error in updateOrderPaymentProof:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getUserDashboardKPI(req, res) {
  try {
    const clerkId = req.user.clerkId;

    const [totalOrders, deliveredOrders, pendingOrders, spentResult] = await Promise.all([
      Order.countDocuments({ clerkId, status: { $ne: "cancelled" } }),
      Order.countDocuments({ clerkId, status: "delivered" }),
      Order.countDocuments({ clerkId, status: "pending" }),
      Order.aggregate([
        { $match: { clerkId, status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
    ]);

    const totalSpent = spentResult.length > 0 ? spentResult[0].total : 0;

    res.status(200).json({
      totalOrders,
      totalSpent,
      deliveredOrders,
      pendingOrders,
    });
  } catch (error) {
    console.error("Error in getUserDashboardKPI:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
