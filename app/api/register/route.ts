import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import getCassandraClient from "../../../lib/db";

// Number of bcrypt salt rounds
const SALT_ROUNDS = bcrypt.genSaltSync(10);

async function checkAndCreateUsersTable(client: any) {
    try {
        
      // Check if table exists by querying system schema
      const queryCheck = `SELECT table_name FROM system_schema.tables WHERE keyspace_name = 'default_namespace' AND table_name = 'users'`;
      const result = await client.execute(queryCheck);
  
      if (result.rowLength === 0) {
        // Table doesn't exist, create the table
        console.log("Table doesn't exist, creating...");
  
        const createTableQuery = `
          CREATE TABLE default_namespace.users (
            user_id UUID PRIMARY KEY,
            email TEXT,
            hashed_password TEXT,
            role TEXT,
            created_at TIMESTAMP,
            updated_at TIMESTAMP
          )`;
  
        await client.execute(createTableQuery);
        console.log('Table users created successfully.');
  
        // Create SAI index on email field
        const createIndexQuery = `
          CREATE CUSTOM INDEX IF NOT EXISTS ON default_namespace.users (email)
          USING 'StorageAttachedIndex'`;
          
        await client.execute(createIndexQuery);
        console.log('SAI index on email created successfully.');
      } else {
        console.log('Table users already exists.');
      }
    } catch (err) {
      console.error('Error occurred:', err);
    } //finally {
    //   await client.shutdown();
    // }
  }

// Function to check if the role_permissions table exists and create it
async function checkAndCreateRolePermissionsTable(cassandraClient) {
    try {
      // Check if table exists by querying system schema
      const queryCheck = `SELECT table_name FROM system_schema.tables WHERE keyspace_name = 'default_namespace' AND table_name = 'role_permissions'`;
      const result = await cassandraClient.execute(queryCheck);
  
      if (result.rowLength === 0) {
        // Table doesn't exist, create the table
        console.log("Table doesn't exist, creating...");
  
        const createTableQuery = `
          CREATE TABLE default_namespace.role_permissions (
            role TEXT,
            resource_name TEXT,
            can_view BOOLEAN,
            can_add BOOLEAN,
            can_modify BOOLEAN,
            can_delete BOOLEAN,
            PRIMARY KEY (role, resource_name)
          )`;
  
        await cassandraClient.execute(createTableQuery);
        console.log('Table role_permissions created successfully.');
  
        // Insert initial data
        const insertDataQuery = `
          INSERT INTO default_namespace.role_permissions (role, resource_name, can_view, can_add, can_modify, can_delete)
          VALUES (?, ?, ?, ?, ?, ?)`;
  
        const permissionsData = [
          ['admin', 'query_instruction_grid', true, true, true, true],
          ['power-user', 'query_instruction_grid', true, true, false, false],
          ['end-user', 'query_instruction_grid', false, false, false, false],
          ['admin', 'chat_session', true, true, false, false],
          ['power-user', 'chat_session', true, true, false, false],
          ['end-user', 'chat_session', true, true, false, false],
        ];
  
        for (const data of permissionsData) {
          await cassandraClient.execute(insertDataQuery, data, { prepare: true });
        }
        console.log('Role permissions data inserted successfully.');
      } else {
        console.log('Table role_permissions already exists.');
      }
    } catch (err) {
      console.error('Error occurred:', err);
    } 
    // finally {
    //   await cassandraClient.shutdown();
    // }
}
async function insertUserIntoCQLDatabase(
    userId: string,
    email: string,
    hashedPassword: string,
    role: string,
    createdAt: Date,
    updatedAt: Date,
) {
    try {
        const cassandraClient = await getCassandraClient();
        await checkAndCreateUsersTable(cassandraClient);
        await checkAndCreateRolePermissionsTable(cassandraClient);
        const query = `
            INSERT INTO default_namespace.users (user_id, email, hashed_password, role, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [userId, email, hashedPassword, role, createdAt, updatedAt];
        await cassandraClient.execute(query, params, { prepare: true });
    } catch (error) {
        console.error("Error inserting into the database: ", error);
        throw new Error("Database insertion failed");
    }
}

export async function POST(request: Request) {
    try {
        const { email, password, role } = await request.json();

        const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);
        const userId = uuidv4();
        const createdAt = new Date();
        const updatedAt = new Date();
        await insertUserIntoCQLDatabase(userId, email, hashedPassword, role, createdAt, updatedAt);

        return NextResponse.json({ message: "Registration successful" }, { status: 201 });
    } catch (error) {
        console.error("Error during registration: ", error);
        return NextResponse.json({ message: "Registration failed", error: error.message }, { status: 500 });
    }
}
