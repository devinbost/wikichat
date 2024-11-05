
import base64 from 'base-64';
import { DataAPIClient } from '@datastax/astra-db-ts';

class TokenProvider {
  // to do: update to use this one: https://github.com/datastax/astra-db-ts/blob/263e90d0ab98762f72d0ffbc98c26c39c81c1de7/src/lib/token-providers/userpass-token-providers.ts#L32
  private username: string;
  private password: string;
  private PREFIX = 'Cassandra';

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }

  private _b64(cleartext: string): string {
    return base64.encode(cleartext);
  }

  public getToken(): string {
    return `${this.PREFIX}:${this._b64(this.username)}:${this._b64(this.password)}`;
  }

  public toString(): string {
    return this.getToken();
  }
}


const cassandraDataClientSingleton = async () => {
    const endpoint = (process.env.CASSANDRA_DATA_ENDPOINT || 'http://example_endpoint:port');
    const password = (process.env.CASSANDRA_PASSWORD || 'example_data_password');
    const username = (process.env.CASSANDRA_USERNAME || 'example_data_username');
    const collectionName = (process.env.CASSANDRA_COLLECTION || 'example_data_collection');

    const tokenProvider = new TokenProvider(username, password);
    const client = new DataAPIClient(tokenProvider.getToken());
    const db = client.db(endpoint, { keyspace: 'default_namespace' });
    const collection = db.collection(collectionName);

    if (!globalThis.cassandraCollectionGlobal) {
        console.log('Cassandra Database session Created');
        if (process.env.NODE_ENV !== 'production') globalThis.cassandraCollectionGlobal = collection;
    }

    return globalThis.cassandraCollectionGlobal;
};

export default async function getCassandraDataCollection() {
    return cassandraDataClientSingleton();
}