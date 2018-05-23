'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn(
            'tips',
            'AuthorId',
            {type: Sequelize.INTEGER}
        );
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('tips', 'AuthorId');
    }
};
