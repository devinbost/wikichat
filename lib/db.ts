const cassandra = require("cassandra-driver");
import path from "path";

const cassandraClientSingleton = async () => {
    const cloud = {
        secureConnectBundle:
            process.env.PATH_SECURE_CONNECT_BUNDLE || path.resolve(process.env.SECURE_CONNECT_BUNDLE_PATH || ""),
    };

    const authProvider = new cassandra.auth.PlainTextAuthProvider(
        "token",
        process.env.ASTRA_DB_APPLICATION_TOKEN || "",
    );

    const client = new cassandra.Client({ cloud, authProvider, keyspace: process.env.ASTRA_DB_NAMESPACE || "" });

    if (!globalThis.cassandraGlobal) {
        await client.connect();
        console.log("Cassandra Database session Created");
        if (process.env.NODE_ENV !== "production") globalThis.cassandraGlobal = client;
    }

    return globalThis.cassandraGlobal;
};

export default async function getCassandraClient() {
    return cassandraClientSingleton();
}
