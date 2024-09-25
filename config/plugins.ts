export default ({ env }) => ({
  // ... other plugin configurations
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d',
      },
    },
  },
});
