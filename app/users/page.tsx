"use client";
import React, { useState, useEffect } from "react";
import LeftNav from "../../components/LeftNav";
import Spinner from "../../components/Spinner";
import UserModal from "../../components/UserModal";

export default function UserDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [permissions, setPermissions] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [users, setUsers] = useState([]);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch("/api/getUsers");
            if (response.ok) {
                const data = await response.json();
                setUsers(data.data);
            } else {
                console.error("Failed to fetch users");
            }
        } catch (error) {
            console.error("Error fetching users: ", error);
        }
    };

    const fetchPermissions = async (resourceName: string) => {
        try {
            const response = await fetch("/api/getPermissions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ resource_name: resourceName }),
            });
            if (response.ok) {
                const data = await response.json();
                setPermissions(data.permissions);
                await fetchUsers();
            } else {
                console.error("Failed to fetch user permissions");
            }
        } catch (error) {
            console.error("Error fetching user permissions: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPermissions("user_management");
    }, []);

    const handleRefresh = () => {
        fetchUsers();
    };

    if (loading) {
        return <Spinner />;
    }

    return (
        <>
            <div className="flex min-h-screen">
                <div>
                    <LeftNav />
                </div>
                <div className="flex flex-1 justify-center items-center h-screen">
                    <section className="container ">
                        <div className="flex flex-col">
                            <div className="mb-3 flex justify-end">
                                <button
                                    onClick={openModal}
                                    className="cursor-pointer transform hover:scale-[1.05] transition-transform duration-200 w-40 bg-primary flex justify-center items-center text-white px-4 py-3 rounded-md focus:outline-none">
                                    Create a User
                                </button>
                            </div>
                            <div className="overflow-x-auto overflow-y-visible scrollbar-none sm:-mx-6 lg:mx-8 2xl:mx-2 max-h-[80vh]">
                                <div className=" inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                                    <div className="overflow-hidden border border-gray-200 dark:border-gray-700 md:rounded-lg">
                                        <div className="overflow-y-auto max-h-[80vh]">
                                            <table className="min-w-full">
                                                <thead className="bg-primary dark:bg-gray-800 sticky top-0 z-10">
                                                    <tr>
                                                        <th
                                                            scope="col"
                                                            className="py-3.5 px-4 text-sm font-normal text-left rtl:text-right text-white">
                                                            User ID
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="text-white px-4 py-3.5 text-sm font-normal text-left rtl:text-right">
                                                            Email
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="text-white px-4 py-3.5 text-sm font-normal text-left rtl:text-right">
                                                            Role
                                                        </th>
                                                        {permissions?.can_modify && permissions?.can_delete && (
                                                            <th scope="col" className="text-white relative py-3.5 px-4">
                                                                <span className="text-white">Actions</span>
                                                            </th>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900">
                                                    {users.map(user => (
                                                        <tr key={user.user_id}>
                                                            <td className="px-4 py-3.5">{user.user_id}</td>
                                                            <td className="px-4 py-3.5">{user.email}</td>
                                                            <td className="px-4 py-3.5">{user.role}</td>
                                                            {/* Add action buttons for edit/delete */}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
            {isModalOpen && (
                <UserModal onClose={closeModal} title="Create A User" btnText="Create" onRefresh={handleRefresh} />
            )}
        </>
    );
}