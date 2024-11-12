"use client";
import React, { useState, useEffect } from "react";
import { signIn, getCsrfToken } from "next-auth/react";
import { useRouter } from "next/navigation";
import Spinner from "../../components/Spinner";
import AirlineIconBlue from "../../components/icons/airline";

const LoginPage = () => {
    const router = useRouter(); // Initialize the useRouter hook
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [username, setUsername] = useState(""); // Store the username input for Credentials login
    const [password, setPassword] = useState(""); // Store the password input for Credentials login

    const [csrfToken, setCsrfToken] = useState<string|undefined>("");

    useEffect(() => {
        const fetchCsrfToken = async () => {
            const token = await getCsrfToken();
            setCsrfToken(token);
        };
        fetchCsrfToken();
    }, []);

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
    async function handleCredentialsLogin(event) {
        event.preventDefault(); // Prevent the form from submitting normally
        setLoading(true);

        const result = await signIn("credentials", {
            redirect: false,
            username,
            password,
            callbackUrl: "/",
            csrfToken, // Include the CSRF token here
        });
        console.log("Sign-in result:", result); // Log the full result

        if (result?.ok) {
            router.push(result.url || '/');
        } else {
            setLoading(false);
            setError(result?.error || 'Login failed. Please try again.');
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
                    <form onSubmit={handleCredentialsLogin} className="space-y-4">
                        <input
                            name="csrfToken"
                            type="hidden"
                            defaultValue={csrfToken}
                        />
                        <div>
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full p-2 rounded border"
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 rounded border"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full transform hover:scale-[1.05] transition-transform duration-200 bg-primary text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Sign in with Credentials
                        </button>
                    </form>
                    {error && <p className="text-red-500">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;