const { Payment, Order } = require('../models');
const sequelize = require('../db');

class PaymentService {
  /**
   * Get all payments
   */
  async getAllPayments(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const { count, rows } = await Payment.findAndCountAll({
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'user_id', 'status', 'total_amount']
        }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    return {
      payments: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit)
    };
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId) {
    const payment = await Payment.findByPk(paymentId, {
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'user_id', 'status', 'total_amount', 'shipping_cost']
        }
      ]
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    return payment;
  }

  /**
   * Create payment for an order
   */
  async createPayment(orderId, payload) {
    const order = await Order.findByPk(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'pending') {
      throw new Error('Order is not eligible for payment');
    }

    const existingPayment = await Payment.findOne({
      where: { order_id: orderId }
    });

    if (existingPayment) {
      throw new Error('Payment already exists for this order');
    }

    const payment = await Payment.create({
      order_id: orderId,
      method: payload.method,
      amount: order.total_amount,
      status: 'pending',
    });

    return payment;
  }

  /**
   * Mark payment as successful
   */
  async markPaymentSuccess(paymentId) {
    return await sequelize.transaction(async (t) => {
      const payment = await Payment.findByPk(paymentId, { transaction: t });

      if (!payment) throw new Error('Payment not found');
      if (payment.status === 'success') throw new Error('Payment already completed');

      // Update payment
      payment.status = 'success';
      await payment.save({ transaction: t });

      // Update order
      const order = await Order.findByPk(payment.order_id, { transaction: t });
      order.status = 'paid';
      await order.save({ transaction: t });

      return payment;
    });
  }

  /**
   * Mark payment as failed
   */
  async markPaymentFailed(paymentId) {
    const payment = await Payment.findByPk(paymentId);

    if (!payment) throw new Error('Payment not found');

    payment.status = 'failed';
    await payment.save();

    return payment;
  }

  /**
   * Cancel payment (only if still pending)
   */
  async cancelPayment(paymentId) {
    const payment = await Payment.findByPk(paymentId);

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'pending') {
      throw new Error('Only pending payments can be canceled');
    }

    payment.status = 'canceled';
    await payment.save();

    return payment;
  }
}

module.exports = new PaymentService();
