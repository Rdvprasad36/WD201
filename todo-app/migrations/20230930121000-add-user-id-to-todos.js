'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add userId column as nullable first
    await queryInterface.addColumn('Todos', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    // Set userId to a default value (e.g., 1) for existing rows if needed
    // await queryInterface.sequelize.query('UPDATE Todos SET userId = 1 WHERE userId IS NULL');
    // Alter column to set allowNull false
    await queryInterface.changeColumn('Todos', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('Todos', 'userId');
  }
};
