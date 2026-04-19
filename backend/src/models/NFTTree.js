const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const NFTTree = sequelize.define('NFTTree', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    tokenId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    txHash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    treeType: {
        type: DataTypes.STRING,
        defaultValue: 'Generic Oak'
    },
    region: {
        type: DataTypes.STRING,
        defaultValue: 'Global Forest'
    },
    category: {
        type: DataTypes.STRING,
        defaultValue: 'plantation'
    },
    mintedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'nft_trees',
    timestamps: true
});

module.exports = NFTTree;
