const { sequelize } = require('./src/config/db');
const { User } = require('./src/models');
const bcrypt = require('bcrypt');

const seedAdminAndUser = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to PostgreSQL.');

        // Skip sync in seed - the main server handles it
        // await sequelize.sync({ alter: true });

        const salt = await bcrypt.genSalt(10);
        const adminPass = await bcrypt.hash('admin1234', salt);

        const [admin, created] = await User.findOrCreate({
            where: { email: 'admin@greenverse.io' },
            defaults: {
                displayName: 'Greenverse Admin',
                email: 'admin@greenverse.io',
                password: adminPass,
                role: 'admin'
            }
        });

        if (created) {
            console.log('Admin user created.');
        } else {
            // Update password in case it changed
            admin.password = adminPass;
            await admin.save();
            console.log('Admin user updated.');
        }

        await User.findOrCreate({
            where: { email: 'user@greenverse.io' },
            defaults: {
                displayName: 'John Doe',
                email: 'user@greenverse.io',
                password: adminPass,
                role: 'user',
                walletAddress: '0xabc123456789def0123456789abc0123456789'
            }
        });

        console.log('Dummy Users Seeded.');
        process.exit();

    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedAdminAndUser();
