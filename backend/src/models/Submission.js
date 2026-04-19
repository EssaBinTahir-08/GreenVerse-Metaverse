const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Submission = sequelize.define('Submission', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    category: {
        type: DataTypes.ENUM('recycling', 'energy_saving', 'plantation', 'cleanup', 'wildlife', 'renewable', 'marine'),
        allowNull: false
    },
    evidenceUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    notes: {
        type: DataTypes.TEXT,
        defaultValue: null
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Flagged'),
        defaultValue: 'Pending'
    },
    reviewerId: {
        type: DataTypes.INTEGER,
        defaultValue: null
    },
    decisionReason: {
        type: DataTypes.TEXT,
        defaultValue: null
    }
}, {
    tableName: 'submissions',
    timestamps: true
});

module.exports = Submission;
