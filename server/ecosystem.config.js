module.exports = {
  apps: [{
    name: 'stock-share-api',
    script: 'npm',
    args: 'start',
    cwd: '/root/stockshare/server',
    env: {
      NODE_ENV: 'production',
      PORT: '33333',
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_USER: 'postgres',
      DB_PASSWORD: 'postgres',
      DB_NAME: 'stock_app',
      CORS_ORIGIN: '*'
    },
    max_memory_restart: '500M',
    instances: 1,
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
