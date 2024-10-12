import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import getCassandraClient from '../../../lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'JWT secret';

// Function to update the user status in the database
async function verifyUserInCQLDatabase(userId: string) {
  try {
    const cassandraClient = await getCassandraClient();
    const query = `
      UPDATE default_namespace.users
      SET is_verified = true
      WHERE user_id = ?
    `;
    await cassandraClient.execute(query, [userId], { prepare: true });
  } catch (error) {
    console.error('Error updating the database: ', error);
    throw new Error('Database update failed');
  }
}

// Handle the token verification
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ message: 'No token provided' }, { status: 400 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { userId } = decoded as { email: string; userId: string };

    // Mark the user as verified
    await verifyUserInCQLDatabase(userId);

    return NextResponse.json({ message: 'User verified successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
  }
}