module.exports = {
  apps: [
    {
      name: "myserver",
      script: "./server.js",
      instances: "max",
      autorestart: true,
      watch: true,
      max_memory_restart: "1G",
      kill_timeout: 10000,
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
    {
      name: "mytest",
      script: "./test.js",
      instances: 1, // You can specify the number of instances for test.js
      autorestart: true,
      watch: false, // Set to true if you want PM2 to watch for changes in test.js
      max_memory_restart: "500M", // Example memory limit for test.js
      kill_timeout: 5000, // Example kill timeout for test.js
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
