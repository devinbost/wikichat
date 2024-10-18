"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Spinner from "../../components/Spinner";
import AirlineIconBlue from "../../components/icons/airline";

const LoginPage = () => {
    const router = useRouter(); // Initialize the useRouter hook
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleGoogleLogin() {
        setLoading(true);
        
        const result = await signIn("google", {
            redirect: false,
            callbackUrl: "/",
          });
        console.log("Sign-in result:", result); // Log the full result

        if (result?.ok) {
            console.log("Login successful");
            router.push("/"); // Redirect to the main page on successful login
        } else {
            setLoading(false);
            console.log(result);
            setError(result?.error || "Login failed. Please try again.");
            console.log( "Login failed. Please try again.");
        }
    }

    return loading ? (
        <Spinner />
    ) : (
        <div className="min-h-screen flex items-center justify-center ">
            <div className="relative w-96">
                <div className="absolute top-0 left-0 w-full h-full bg-primary rounded-lg transform rotate-[-10deg] z-0"></div>
                <div className="bg-gray p-8 rounded-lg shadow-lg relative z-100">
                    <div className="flex items-center justify-center h-[80px] mb-2 rounded-[10px]">
                        <AirlineIconBlue />
                    </div>
                    <div className="mb-6">
                        <button
                            onClick={handleGoogleLogin} // Call the login function on click
                            className="cursor-pointer transform hover:scale-[1.05] transition-transform duration-200 bg-primary text-gray from-blue-500 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Sign in with Google
                        </button>
                    </div>
                    {error && <p className="text-red-500">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;