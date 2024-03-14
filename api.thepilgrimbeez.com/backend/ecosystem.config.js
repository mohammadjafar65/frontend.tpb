module.exports = {
  apps: [
    {
      name: "my-app",
      script: "./server.js",
      instances: "max",
      autorestart: true,
      watch: true,
      max_memory_restart: "1TB",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
