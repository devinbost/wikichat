import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
    ],
    session: {
      strategy: "jwt", // Ensure that this is set to "jwt" if using JSON Web Tokens
    },
    jwt: {
      secret: process.env.JWT_SECRET, // Same secret as in your middleware
    },
    callbacks: {
      async jwt({ token, account, profile }) {
        // Modify the token as needed
        if (account && profile) {
          token.email = profile.email; // Capture the user's email
         //await saveUserToDatabase(profile.email);  // Save the email to your database if it's a new user
        }
        return token;
      },
      async session({ session, token }) {
        // Modify the session object based on token data
        session.email = token.email; // Attach email to the session object
        session.role = token.role;
        return session;
      },
    },
    logger: {
      error(code, ...message) {
        console.error(code, ...message);
      },
      warn(code, ...message) {
        console.warn(code, ...message);
      },
      debug(code, ...message) {
        console.debug(code, ...message);
      },
    },
    debug: true,
  });
