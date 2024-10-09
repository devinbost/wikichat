"use client";
import React, { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Spinner from "../../components/Spinner";
import AirlineIconBlue from "../../components/icons/airline";

const RegisterPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [role, setRole] = useState("");

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setRole(event.target.value);
    };
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email");
        const password = formData.get("password");

        setError("");

        const res = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password, role }),
        });

        if (res.ok) {
            router.push("/login");
        } else {
            const data = await res.json();
            setError(data.message);
        }
    }
    return loading ? (
        <Spinner />
    ) : (
        <div className="min-h-screen flex items-center justify-center ">
            <div className="relative w-96">
                <div className="absolute top-0 left-0 w-full h-full bg-primary  rounded-lg transform rotate-[-10deg] z-0"></div>
                <div className="bg-gray p-8 rounded-lg shadow-lg relative z-100">
                    <div className="flex items-center justify-center h-[80px] mb-2 rounded-[10px]">
                        <AirlineIconBlue />
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <input
                                type="email"
                                name="email"
                                className="pl-2 rounded-md h-8 mt-1 block w-full border-gray-300 focus:outline-none focus:border-indigo-500 sm:text-sm font-sans text-primary"
                                placeholder="Email Address"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <input
                                type="password"
                                name="password"
                                id="password"
                                className="pl-2 rounded-md h-8 mt-1 block w-full border-gray-300 focus:outline-none focus:border-indigo-500 sm:text-sm font-sans text-primary"
                                placeholder="Password"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <select
                                id="role"
                                name="role"
                                value={role}
                                onChange={handleChange}
                                required
                                className="block w-full bg-white text-black py-2 px-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="" disabled>
                                    Select Role
                                </option>
                                <option value="admin">Admin</option>
                                <option value="end-user">End-User</option>
                                <option value="power-user">Power-User</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="cursor-pointer transform hover:scale-[1.05] transition-transform duration-200 bg-primary text-gray from-blue-500 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2 mb-4 font-sans">
                            Register
                        </button>
                        <div className="text-base text-[#adadad] flex gap-1">
                            <div>Already a member?</div>
                            <div
                                onClick={() => {
                                    router.push("/login");
                                }}
                                className="text-primary hover:underlin cursor-pointer transform hover:scale-[1.05] transition-transform duration-200">
                                Login
                            </div>
                        </div>
                        {error && <p className="text-red-500">{error}</p>}
                        <span className="inline-block w-4"></span>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default RegisterPage;
