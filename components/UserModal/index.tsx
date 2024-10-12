"use client";
import { FormEvent, useEffect, useState } from "react";

interface UserModalProps {
    user_id?: number;
    username?: string;
    role?: string;
    onClose: () => void;
    onRefresh: () => void;
    title?: string;
    btnText?: string;
    modalType?: string;
}

const UserModal: React.FC<UserModalProps> = ({
    user_id,
    username,
    role,
    title,
    btnText,
    modalType = "Create",
    onClose,
    onRefresh,
}) => {
    const [loading, setLoading] = useState(false);
    const [formEmail, setformEmail] = useState(username || "");
    const [formRole, setFormRole] = useState(role || "");
    const [roles, setRoles] = useState<string[]>([]);
    const [error, setError] = useState("");

    // Fetch roles from the API to populate the dropdown
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await fetch("/api/getRoles");
                if (res.ok) {
                    const data = await res.json();
                    setRoles(data.data);
                } else {
                    console.error("Failed to fetch roles");
                }
            } catch (error) {
                console.error("Error fetching roles: ", error);
            }
        };
        fetchRoles();
    }, []);

    // Update the state when the props change
    useEffect(() => {
        setformEmail(username || "");
        setFormRole(role || "");
    }, [username, role]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError("");

        const endpoint = modalType === "Create" ? "/api/createUser" : "/api/updateUser";
        const body = modalType === "Create"
            ? { formEmail, formRole }
            : { user_id, formEmail, formRole };

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                onRefresh();
                onClose();
            } else {
                const data = await res.json();
                setError(data.message);
            }
        } catch (error) {
            console.error("Error submitting form: ", error);
            setError("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="z-20 fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-50 py-10">
                <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
                    <div className="relative py-3 sm:mx-auto">
                        <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
                            <div className="min-w-[43rem] mx-auto">
                                <div className="flex items-center space-x-5">
                                    <div className="h-[70px] w-[70px] bg-yellow-200 rounded-full flex flex-shrink-0 justify-center items-center text-yellow-500 text-2xl font-mono">
                                        SIA
                                    </div>
                                    <div className="pl-2 font-semibold text-xl text-gray-700">
                                        <h2 className="leading-relaxed">{title}</h2>
                                    </div>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="divide-y divide-gray-200">
                                        <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                                            <div className="flex flex-col">
                                                <label className="leading-loose">Username (Email)</label>
                                                <input
                                                    type="email"
                                                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                                                    placeholder="Email address"
                                                    value={formEmail}
                                                    onChange={e => setformEmail(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <label className="leading-loose">Role</label>
                                                <select
                                                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                                                    value={formRole}
                                                    onChange={e => setFormRole(e.target.value)}
                                                    required
                                                >
                                                    <option value="" disabled>Select Role</option>
                                                    {roles.map(({ role }) => (
                                                        <option key={role} value={role}>
                                                        {role}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="pt-4 flex items-center space-x-4">
                                            <button
                                                onClick={onClose}
                                                className="cursor-pointer transform hover:scale-[1.05] transition-transform duration-200 flex justify-center items-center w-full text-gray-900 px-4 py-3 rounded-md focus:outline-none">
                                                <svg
                                                    className="w-6 h-6 mr-3"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M6 18L18 6M6 6l12 12"></path>
                                                </svg>
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="cursor-pointer transform hover:scale-[1.05] transition-transform duration-200 bg-primary flex justify-center items-center w-full text-white px-4 py-3 rounded-md focus:outline-none">
                                                {btnText}
                                            </button>
                                        </div>
                                        {error && <p className="text-red-500">{error}</p>}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserModal;