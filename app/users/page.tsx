"use client";
import React, { useState, useEffect } from "react";
import LeftNav from "../../components/LeftNav";
import Spinner from "../../components/Spinner";
import UserModal from "../../components/UserModal";

type Permission = {
    can_modify: boolean;
    can_delete: boolean;
    can_add: boolean;
    can_view: boolean;
};

type User = {
    user_id: string;
    email: string;
    role: string;
};

export default function UserDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [permission, setPermission] = useState<Permission | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [modalType, setModalType] = useState<"Create" | "Update">("Create");

    const openModal = (user: User | null = null, type: "Create" | "Update" = "Create") => {
        setSelectedUser(user);
        setModalType(type);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedUser(null);
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

    const fetchPermission = async (resourceName: string) => {
        try {
            const response = await fetch("/api/getPermission", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resource_name: resourceName }),
            });
            if (response.ok) {
                const data = await response.json();
                setPermission(data.permission);
                await fetchUsers();
            } else {
                console.error("Failed to fetch user permission");
            }
        } catch (error) {
            console.error("Error fetching user permission: ", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async (user: Partial<User>, type: "Create" | "Update") => {
        const endpoint = type === "Create" ? "/api/createUser" : "/api/updateUser";
        const body = JSON.stringify({
            user_id: user.user_id,
            formEmail: user.email,
            formRole: user.role,
        });

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body,
            });

            if (response.ok) {
                await fetchUsers();
                closeModal();
            } else {
                console.error("Failed to create or update user");
            }
        } catch (error) {
            console.error(`Error during ${type} operation: `, error);
        }
    };

    const handleDelete = async (userId: string) => {
        try {
            const response = await fetch(`/api/deleteUser`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId }),
            });
            if (response.ok) {
                await fetchUsers();
            } else {
                console.error("Failed to delete user");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    useEffect(() => {
        fetchPermission("user_management");
    }, []);

    if (loading) return <Spinner />;

    return (
        <>
            <div className="flex min-h-screen">
                <div><LeftNav /></div>
                <div className="flex flex-1 justify-center items-center h-screen">
                    <section className="container">
                        <div className="flex flex-col">
                            <div className="mb-3 flex justify-end">
                                <button
                                    onClick={() => openModal(null, "Create")}
                                    className="w-40 bg-primary text-white px-4 py-3 rounded-md">
                                    Create a User
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-primary text-white">
                                        <tr>
                                            <th>User ID</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            {permission?.can_modify && permission?.can_delete && (
                                                <th>Actions</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.user_id}>
                                                <td>{user.user_id}</td>
                                                <td>{user.email}</td>
                                                <td>{user.role}</td>
                                                {permission?.can_modify && permission?.can_delete && (
                                                    <td>
                                                        <button
                                                            onClick={() => openModal(user, "Update")}
                                                            className="text-blue-500 hover:underline">
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user.user_id)}
                                                            className="text-red-500 hover:underline ml-4">
                                                            Delete
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {isModalOpen && (
                <UserModal
                    user_id={selectedUser?.user_id}
                    username={selectedUser?.email}
                    role={selectedUser?.role}
                    modalType={modalType}
                    title={modalType === "Create" ? "Create A User" : "Update User"}
                    btnText={modalType === "Create" ? "Create" : "Update"}
                    onClose={closeModal}
                    onSubmit={(user) => handleCreateOrUpdate(user, modalType)}
                />
            )}
        </>
    );
}