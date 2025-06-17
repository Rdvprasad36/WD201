'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn('Todos', 'userId', {
      type: queryInterface.sequelize.Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    // Alter column to NOT NULL after adding
    await queryInterface.changeColumn('Todos', 'userId', {
      type: queryInterface.sequelize.Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('Todos', 'userId');
  }
};
