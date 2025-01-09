import { NextResponse } from "next/server";
export const revalidate = 0;
//import getCassandraDataCollection from "../../../lib/datadb";
import { DataAPIClient, UsernamePasswordTokenProvider } from '@datastax/astra-db-ts';

async function getRecordsInVectorDatabase() {
    // note that we can't add the question/text to this update unless we also update the vector
    try {
        //const collection = await getCassandraDataCollection();
        

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
            monitorCommands: true,
            token: tokenProvider.getToken(),
            keyspace: "default_namespace",
            dataApiPath: dataApiPath
            }});
        
        client.on('commandStarted', (event) => {
            console.dir(event, { depth: null });
        });
        const db = client.db(endpoint);
        const collection = await db.collection(collectionName);
        const docBefore = await collection.find({ });
        return docBefore;
        
    } catch (error) {
        console.error("Error updating the vector database: ", error);
        throw new Error("Database update failed");
    }
}

export async function GET() {
    try {
        const records = await getRecordsInVectorDatabase();
        const recordsData = await records.toArray();
        console.log(recordsData);
        const response = NextResponse.json(
            {   
                message: "Records fetched successfully", 
                data: recordsData,
             }, 
            { status: 200 }
        );
        return response;

    } catch (error) {
        console.error("Error during fetching records: ", error);
        return NextResponse.json(
            { message: "Record fetching failed", error: error.message }, 
            { status: 500 }
        );
    }
}
