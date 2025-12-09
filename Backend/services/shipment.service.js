const { Shipment, Order } = require('../models');

class ShipmentService {

  /**
   * Get all shipments + pagination
   */
  async getAllShipments(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const { count, rows } = await Shipment.findAndCountAll({
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'user_id', 'status', 'total_amount', 'shipping_cost']
        }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    return {
      shipments: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit)
    };
  }

  /**
   * Get shipment by ID
   */
  async getShipmentById(shipmentId) {
    const shipment = await Shipment.findByPk(shipmentId, {
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'user_id', 'status', 'total_amount', 'shipping_cost']
        }
      ]
    });

    if (!shipment) {
      throw new Error('Shipment not found');
    }

    return shipment;
  }

  /**
   * Create new shipment
   */
  async createShipment(data) {
    return await Shipment.create(data);
  }

  /**
   * Update shipment
   */
  async updateShipment(shipmentId, payload) {
    const shipment = await Shipment.findByPk(shipmentId);

    if (!shipment) {
      throw new Error('Shipment not found');
    }

    await shipment.update(payload);
    return shipment;
  }

  /**
   * Delete shipment
   */
  async deleteShipment(shipmentId) {
    const shipment = await Shipment.findByPk(shipmentId);

    if (!shipment) {
      throw new Error('Shipment not found');
    }

    await shipment.destroy();
    return true;
  }
}

module.exports = new ShipmentService();
