module.exports = {
  apps: [
    {
      name: "my-app",
      script: "./server.js",
      instances: "max",
      autorestart: true,
      watch: true,
      max_memory_restart: "1000G",
      kill_timeout: 10000, // 10000 milliseconds (10 seconds)
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};