const admin = require('admin'),
    metrics = require('measured').createCollection();

metrics.gauge('memory.rss', () => process.memoryUsage().rss);
metrics.gauge('event-loop-lag', require('event-loop-lag')(1000));

module.exports = {
    buildConfig: (adminInterfacePort, mainAppPort, config) => {
        return {
            http: {
                bindAddress: '0.0.0.0',
                port: adminInterfacePort
            },

            plugins: [
                require('admin-plugin-index')({
                    message: ''
                }),
                require('admin-plugin-report')(),
                require('admin-plugin-environment')(),
                require('admin-plugin-profile')(),
                require('admin-plugin-measured')({collection: metrics}),
                require('admin-plugin-terminate')(),
                require('admin-plugin-config')({
                    ports: {
                        appPort: mainAppPort,
                        appAdminPort: adminInterfacePort
                    },
                    config: config
                }),
                require('admin-plugin-healthcheck')({})
            ]
        }
    },

    start: (adminConfig) => {
        admin.configure(adminConfig);
        admin.start();
    }
};