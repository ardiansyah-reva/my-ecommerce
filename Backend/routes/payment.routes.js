const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const auth = require("../middlewares/auth");

router.use(auth);

router.get("/", paymentController.getAllPayment);
router.get("/:id", paymentController.getPaymentById);
router.post("/", paymentController.createPayment);

module.exports = router;
