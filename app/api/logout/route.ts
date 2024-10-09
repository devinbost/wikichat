import { NextResponse } from "next/server";

export async function DELETE() {
    const response = NextResponse.json({ message: "Logout successful" });

    // Clear the JWT token by setting the maxAge to 0
    response.cookies.set("token", "", { httpOnly: true, maxAge: 0 });

    return response;
}
