const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TokenTx = sequelize.define('TokenTx', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    submissionId: {
        type: DataTypes.INTEGER,
        defaultValue: null
    },
    txHash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Completed', 'Failed'),
        defaultValue: 'Pending'
    }
}, {
    tableName: 'token_txs',
    timestamps: true
});

module.exports = TokenTx;
