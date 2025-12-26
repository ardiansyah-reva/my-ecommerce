// Backend/controllers/analytics.controller.js
exports.getSalesAnalytics = async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const salesByDate = await Order.findAll({
    attributes: [
      [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'orders'],
      [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue']
    ],
    where: {
      created_at: { [Op.between]: [startDate, endDate] },
      status: ['PAID', 'COMPLETED']
    },
    group: [sequelize.fn('DATE', sequelize.col('created_at'))],
    order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
  });
  
  res.json({ data: salesByDate });
};