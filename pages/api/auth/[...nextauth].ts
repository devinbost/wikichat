import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { v4 as uuidv4 } from "uuid";
import jwt from 'jsonwebtoken';

import getCassandraClient from "../../../lib/db";

const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD;
const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "JWT secret";

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

        const createIndexQuery2 = `
          CREATE CUSTOM INDEX IF NOT EXISTS ON default_namespace.users (role)
          USING 'StorageAttachedIndex'`;
          
        await client.execute(createIndexQuery2);
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
          ['admin', 'user_management', true, true, true, true],
          ['power-user', 'user_management', false, false, false, false],
          ['end-user', 'user_management', false, false, false, false],
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
async function checkAndCreateDefaultAdminUser(cassandraClient) {
    if (!DEFAULT_ADMIN_EMAIL) {
        console.log("No default admin email set. Skipping admin creation.");
        return;
    }

    try {
        // Check if a user exists with the DEFAULT_ADMIN_EMAIL
        const checkUserQuery = `SELECT user_id, email, role FROM default_namespace.users WHERE email = ?`;
        const result = await cassandraClient.execute(checkUserQuery, [DEFAULT_ADMIN_EMAIL], { prepare: true });

        if (result.rowLength > 1) {
            throw new Error(`Multiple users found with email: ${DEFAULT_ADMIN_EMAIL}`);
        }

        if (result.rowLength === 1) {
            // User exists, update their role to 'admin'
            const userId = result.rows[0].user_id;
            const updatedAt = new Date();

            const updateRoleQuery = `
                UPDATE default_namespace.users
                SET role = ?, updated_at = ?
                WHERE user_id = ?
            `;
            const params = ['admin', updatedAt, userId];
            await cassandraClient.execute(updateRoleQuery, params, { prepare: true });

            console.log(`User with email ${DEFAULT_ADMIN_EMAIL} role updated to admin.`);
        } else {
            // User does not exist, create a new admin user
            const userId = uuidv4();
            const createdAt = new Date();
            const updatedAt = new Date();

            const insertAdminQuery = `
                INSERT INTO default_namespace.users (user_id, email, role, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?)
            `;
            const params = [userId, DEFAULT_ADMIN_EMAIL, 'admin', createdAt, updatedAt];
            await cassandraClient.execute(insertAdminQuery, params, { prepare: true });

            console.log(`Default admin user created with email: ${DEFAULT_ADMIN_EMAIL}`);
        }
    } catch (error) {
        console.error("Error during default admin creation:", error);
    }
}

async function getUserRoleByEmail(cassandraClient: any, email: string) {
    try {
        const query = `SELECT role FROM default_namespace.users WHERE email = ?`;
        const result = await cassandraClient.execute(query, [email], { prepare: true });

        // If more than one row is returned, throw an exception
        if (result.rowLength > 1) {
            throw new Error(`Multiple user role entries found for email: ${email}`);
        }

        // Return the user's role if one exists, otherwise return null
        if (result.rowLength === 1) {
            return result.rows[0].role;
        }
        
        return null;
    } catch (error) {
        console.error("Error checking user role:", error);
        throw new Error("Failed to retrieve user role");
    }
}

async function insertUserIntoCQLDatabase(
    userId: string,
    email: string,
    role: string,
    createdAt: Date,
    updatedAt: Date,
) {
    try {
        const cassandraClient = await getCassandraClient();
        // Ensure DB is setup. In future, move this code to run once upon app start.
        const query = `
            INSERT INTO default_namespace.users (user_id, email, role, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
        `;
        const params = [userId, email, role, createdAt, updatedAt];
        await cassandraClient.execute(query, params, { prepare: true });
    } catch (error) {
        console.error("Error inserting into the database: ", error);
        throw new Error("Database insertion failed");
    }
}

export default NextAuth({
    providers: [
      GoogleProvider({
        clientId: process.env.OAUTH_CLIENTID,
        clientSecret: process.env.OAUTH_CLIENTSECRET,
      }),
    ],
    jwt: {
        secret: process.env.JWT_SECRET,
        encode: async ({ token }) => {
          return jwt.sign(token, process.env.JWT_SECRET);
        },
        decode: async ({ token }) => {
          return jwt.verify(token, process.env.JWT_SECRET);
        },
      },
      cookies: {
        sessionToken: {
          name: 'token', // Set the custom cookie name here
          options: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Use secure cookies in production
            path: "/",
            sameSite: "lax",
          },
        },
      },
    secret: NEXTAUTH_SECRET, // Ensure this is set to a secure random value
    session: {
      strategy: "jwt", // Ensure that this is set to "jwt" if using JSON Web Tokens
    },
    callbacks: {
      async jwt({ token, account, profile }) {
        // Modify the token as needed
        if (account && profile) {
            token.email = profile.email; // Capture the user's email
            // Check user's role. If it exists, then set to token. 
            
            const cassandraClient = await getCassandraClient();
            // Ensure DB is setup. In future, move this code to run once upon app start.
            await checkAndCreateUsersTable(cassandraClient);
            await checkAndCreateRolePermissionsTable(cassandraClient);
            await checkAndCreateDefaultAdminUser(cassandraClient);

            // check if user exists already. If so, get role. 
            const userRole = await getUserRoleByEmail(cassandraClient, profile.email);

                // Check if the user exists in the database
            if (userRole) {
                // User exists, set the role in the token
                token.role = userRole;
                const cassandraClient = await getCassandraClient();
            } else {
                // User does not exist, create a new user with default role
                const userId = uuidv4();
                const createdAt = new Date();
                const updatedAt = new Date();
                const role = "end-user";
                await insertUserIntoCQLDatabase(userId, profile.email, role, createdAt, updatedAt);
                token.role = role;
            }
            
        }
        console.log("JWT Token after assignment:", token); // Log to verify the token
        return token;
      },
      async session({ session, token }) {
        // Modify the session object based on token data
        session.email = token.email; // Attach email to the session object
        session.role = token.role;
        console.log("Session data:", session); // Log to verify session data
        return session;
      },
    },
    debug: true,
  });