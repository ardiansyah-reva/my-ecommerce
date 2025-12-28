// Backend/services/email.service.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

exports.sendOrderConfirmation = async (order, user) => {
  await transporter.sendMail({
    from: '"Lazada" <noreply@Lazada.com>',
    to: user.email,
    subject: `Order Confirmation #${order.id}`,
    html: `
      <h1>Thank you for your order!</h1>
      <p>Order ID: ${order.id}</p>
      <p>Total: ${formatPrice(order.total_amount)}</p>
      <a href="${process.env.FRONTEND_URL}/orders/${order.id}">
        Track Your Order
      </a>
    `
  });
};