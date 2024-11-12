const cassandra = require("cassandra-driver");

const cassandraClientSingleton = async () => {
    try {
        const contactPoints = (process.env.CASSANDRA_CONTACT_POINTS || '')
            .split(',')
            .map(point => point.trim());

        const client = new cassandra.Client({
            contactPoints: contactPoints, 
            localDataCenter: "dc1",
            keyspace: process.env.CASSANDRA_NAMESPACE || 'default_namespace',
            credentials: {
                username: process.env.CASSANDRA_USERNAME || 'your_username',
                password: process.env.CASSANDRA_PASSWORD || 'your_password'
            },
            // Add retry options
            pooling: {
                coreConnectionsPerHost: {
                    local: 2,
                    remote: 1
                }
            },
            socketOptions: {
                connectTimeout: 5000 // 5 seconds
            },
            queryOptions: {
                consistency: cassandra.types.consistencies.localQuorum,
                retryOnTimeout: true,
                readTimeout: 5000 // 5 seconds
            }
        });

        if (!globalThis.cassandraGlobal) {
            await client.connect();
            console.log('Cassandra Database session Created');
            globalThis.cassandraGlobal = client;
        }

        return globalThis.cassandraGlobal;
    } catch (error) {
        console.error("Error connecting to Cassandra:", error);
        throw new Error("Failed to connect to Cassandra");
    }
};

export default async function getCassandraClient() {
    return cassandraClientSingleton();
}

