const { User, UserAddress, Order } = require('../models');

class UserService {
  
  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: UserAddress,
          as: 'addresses'
        }
      ]
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }


  /**
   * Get all users + pagination
   */
  async getAllUsers(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      attributes: { exclude: ['password'] },
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    return {
      users: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit)
    };
  }


  /**
   * Update user profile
   */
  async updateUser(userId, data) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error("User not found");
    }

    await user.update(data);

    return {
      message: "User updated successfully",
      user
    };
  }


  /**
   * Delete user (soft delete)
   */
  async deleteUser(userId) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error("User not found");
    }

    await user.destroy();

    return { message: "User deleted successfully" };
  }


  /**
   * Add User Address
   */
  async addUserAddress(userId, addressData) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const newAddress = await UserAddress.create({
      ...addressData,
      user_id: userId
    });

    return newAddress;
  }

}

module.exports = new UserService();
