const User = require('./User');
const Submission = require('./Submission');
const TokenTx = require('./TokenTx');
const NFTTree = require('./NFTTree');

// Associations
// A User creates many Submissions (userId FK)
User.hasMany(Submission, { foreignKey: 'userId', as: 'submissions' });
Submission.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// A Submission can be reviewed by a User (reviewerId FK) — no cascade delete
Submission.belongsTo(User, { foreignKey: 'reviewerId', as: 'reviewer', constraints: false });

// A User has many TokenTx
User.hasMany(TokenTx, { foreignKey: 'userId', as: 'tokenTransactions' });
TokenTx.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// A Submission can have many TokenTx
Submission.hasMany(TokenTx, { foreignKey: 'submissionId', as: 'tokenTransactions' });
TokenTx.belongsTo(Submission, { foreignKey: 'submissionId', as: 'submission' });

// A User owns many NFTTrees
User.hasMany(NFTTree, { foreignKey: 'ownerId', as: 'nftTrees' });
NFTTree.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

module.exports = { User, Submission, TokenTx, NFTTree };
