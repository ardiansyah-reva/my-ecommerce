const express = require("express");
const router = express.Router();
const shipmentController = require("../controllers/shipment.controller");
const auth = require("../middlewares/auth");

router.use(auth);

router.get("/", shipmentController.getAllShipment);
router.get("/:id", shipmentController.getShipmentById);

router.post("/", shipmentController.createShipment);
router.put("/:id", shipmentController.updateShipment);
router.delete("/:id", shipmentController.deleteShipment);

module.exports = router;
