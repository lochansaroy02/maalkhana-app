// pm2 start ecosystem.config.cjs && pm2 save
module.exports = {
    apps: [
        {
            name: "maalkhana-media",
            script: "server.mjs",
            cwd: __dirname,
            node_args: "--env-file=.env",
            instances: 1,
            autorestart: true,
            max_memory_restart: "300M",
            time: true,
        },
    ],
};
