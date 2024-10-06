"use client";
import React, { useState } from "react";
import { BoxArrowLeft, PersonPlusFill } from "react-bootstrap-icons";
import { useRouter } from "next/navigation";

const LeftNav = () => {
    const router = useRouter();
    async function handleLogout() {
        const response = await fetch("/api/logout", {
            method: "DELETE",
        });

        if (response.ok) {
            console.log("Logout successful");
            router.push("/login");
        }
    }

    return (
        <div className="flex flex-col h-screen w-[65px] bg-primary text-white">
            <div className="flex-1 flex flex-col items-center justify-start py-4 pl-[1px]">
                <div className="mb-4">
                    <h1 className="text-sm font-bold">Menu</h1>
                </div>
                <button title="Register a User">
                    <PersonPlusFill />
                </button>
            </div>
            <div className="flex justify-center py-4">
                <button
                    onClick={handleLogout}
                    className="cursor-pointer transform hover:scale-[1.05] transition-transform duration-200 flex flex-col items-center text-sm text-white hover:text-gray-400 ">
                    <BoxArrowLeft className="w-5 h-5 mr-2" />
                    <div>Logout</div>
                </button>
            </div>
        </div>
    );
};

export default LeftNav;
