
import base64 from 'base-64';
import { DataAPIClient, UsernamePasswordTokenProvider } from '@datastax/astra-db-ts';


const cassandraDataClientSingleton = async () => {
    const endpoint = (process.env.CASSANDRA_DATA_ENDPOINT || 'http://example_endpoint:port');
    const password = (process.env.CASSANDRA_PASSWORD || 'example_data_password');
    const username = (process.env.CASSANDRA_USERNAME || 'example_data_username');
    const collectionName = (process.env.CASSANDRA_COLLECTION || 'example_data_collection');
    const dataApiPath = (process.env.DATA_API_PATH || 'api/json/v1'); // Default works for Astra

    const tokenProvider = new UsernamePasswordTokenProvider(username, password);
    // Initialize DataAPIClient with token and options, including dataApiPath
    
  
    const client = new DataAPIClient(tokenProvider, {
      environment: 'dse', 
        dbOptions: {
          token: tokenProvider.getToken(),
          keyspace: "default_namespace",
          dataApiPath: dataApiPath
        }});

    // Initialize the database with keyspace, token, and overridden dataApiPath in dbOptions
    const db = client.db(endpoint);
    // Create the collection and list collections
    const collectionNames = await db.listCollections({ nameOnly: true });
    console.log('Collection Names found:', collectionNames);
    const result4 = await db.dropCollection(collectionName);
    // const result2 = await db.createCollection(collectionName);
    const collection = await db.collection(collectionName);
    const docBefore = await collection.find({ }).toArray();
    console.log('Documents found before delete:', docBefore);
    const result = await collection.deleteMany({});
    const docAfter = await collection.find({ }).toArray();
    console.log('Documents found after delete:', docAfter);

    if (!globalThis.cassandraCollectionGlobal) {
        console.log('Cassandra Database session Created');
        if (process.env.NODE_ENV !== 'production') globalThis.cassandraCollectionGlobal = collection;
    }

    return globalThis.cassandraCollectionGlobal;
};

export default async function getCassandraDataCollection() {
    return cassandraDataClientSingleton();
}