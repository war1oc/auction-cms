const fs = require('fs');
const strapi = require('@strapi/strapi');
const csv = require('csv-parser');

const importUsers = async () => {
  try {
    // Initialize Strapi
    const app = await strapi({ distDir: "./dist" }).load();
    await app.server.mount();

    const users = [];

    // Read users from CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream('scripts/users.csv')
        .pipe(csv())
        .on('data', (row) => {
          users.push(row);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    for (const user of users) {
      const newUser = await app.plugins['users-permissions'].services.user.add({
        username: user.email,
        email: user.email,
        password: user.password,
        confirmed: true,
        blocked: false,
        role: 1,
        provider: 'local'
      });

      console.log(`User created: ${newUser.email}`);
    }

    console.log('User import completed');
    process.exit(0);
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
};

importUsers();
