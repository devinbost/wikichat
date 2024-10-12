"use client";
import React from "react";
import { useRouter } from "next/navigation";
import LeftNav from "../../components/LeftNav";
import TableRow from "../../components/TableRow";
import { useEffect, useState } from "react";
import LLMInstructionModal from "../../components/InstructionModal";
import Spinner from "../../components/Spinner";
import { useSession, signIn } from "next-auth/react";

export default function DashboardPage() {
    const { data: session, status } = useSession();

    const [loading, setLoading] = useState(true);
    const [permissions, setPermissions] = useState(null);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [questions, setQuestions] = useState([]);
    if (status === "unauthenticated") {
        signIn("google"); // Redirect to Google sign-in
        return null; // Prevent rendering until authenticated
    }


    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleRowClick = (question_id: number) => {
        setExpandedRow(prevExpandedRow => (prevExpandedRow === question_id ? null : question_id));
    };

    const fetchQuestions = async () => {
        try {
            const response = await fetch("/api/getRecords");
            if (response.ok) {
                const data = await response.json();
                setQuestions(data.data);
            } else {
                console.error("Failed to fetch questions");
            }
        } catch (error) {
            console.error("Error fetching questions: ", error);
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
                await fetchQuestions();
            } else {
                console.error("Failed to fetch user permissions");
            }
        } catch (error) {
            console.error("Error fetching user permissions ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPermissions("query_instruction_grid");
    }, []);

    const handleRefresh = () => {
        fetchQuestions();
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
                    {/* <div className="flex items-center justify-center h-screen pt-6 "> */}
                    <section className="container ">
                        <div className="flex flex-col">
                            <div className="mb-3 flex justify-end">
                                <button
                                    onClick={openModal}
                                    className="cursor-pointer transform hover:scale-[1.05] transition-transform duration-200 w-40 bg-primary flex justify-center items-center text-white px-4 py-3 rounded-md focus:outline-none">
                                    Create a Record
                                </button>
                            </div>
                            <div className="overflow-x-auto overflow-y-visible scrollbar-none   sm:-mx-6 lg:mx-8 2xl:mx-2  max-h-[80vh]">
                                <div className=" inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                                    <div className="overflow-hidden border border-gray-200 dark:border-gray-700 md:rounded-lg">
                                        <div className="overflow-y-auto max-h-[80vh]">
                                            <table className="min-w-full">
                                                <thead className="bg-primary dark:bg-gray-800 sticky top-0 z-10">
                                                    <tr>
                                                        <th
                                                            scope="col"
                                                            className="py-3.5 px-4 text-sm font-normal text-left rtl:text-right text-white ">
                                                            <div className="flex items-center gap-x-3">
                                                                <span>Question Id</span>
                                                                <button className="flex items-center gap-x-2">
                                                                    <svg
                                                                        className="h-3"
                                                                        viewBox="0 0 10 11"
                                                                        fill="none"
                                                                        xmlns="http://www.w3.org/2000/svg">
                                                                        <path
                                                                            d="M2.13347 0.0999756H2.98516L5.01902 4.79058H3.86226L3.45549 3.79907H1.63772L1.24366 4.79058H0.0996094L2.13347 0.0999756ZM2.54025 1.46012L1.96822 2.92196H3.11227L2.54025 1.46012Z"
                                                                            fill="currentColor"
                                                                            stroke="currentColor"
                                                                            stroke-width="0.1"
                                                                        />
                                                                        <path
                                                                            d="M0.722656 9.60832L3.09974 6.78633H0.811638V5.87109H4.35819V6.78633L2.01925 9.60832H4.43446V10.5617H0.722656V9.60832Z"
                                                                            fill="currentColor"
                                                                            stroke="currentColor"
                                                                            stroke-width="0.1"
                                                                        />
                                                                        <path
                                                                            d="M8.45558 7.25664V7.40664H8.60558H9.66065C9.72481 7.40664 9.74667 7.42274 9.75141 7.42691C9.75148 7.42808 9.75146 7.42993 9.75116 7.43262C9.75001 7.44265 9.74458 7.46304 9.72525 7.49314C9.72522 7.4932 9.72518 7.49326 9.72514 7.49332L7.86959 10.3529L7.86924 10.3534C7.83227 10.4109 7.79863 10.418 7.78568 10.418C7.77272 10.418 7.73908 10.4109 7.70211 10.3534L7.70177 10.3529L5.84621 7.49332C5.84617 7.49325 5.84612 7.49318 5.84608 7.49311C5.82677 7.46302 5.82135 7.44264 5.8202 7.43262C5.81989 7.42993 5.81987 7.42808 5.81994 7.42691C5.82469 7.42274 5.84655 7.40664 5.91071 7.40664H6.96578H7.11578V7.25664V0.633865C7.11578 0.42434 7.29014 0.249976 7.49967 0.249976H8.07169C8.28121 0.249976 8.45558 0.42434 8.45558 0.633865V7.25664Z"
                                                                            fill="currentColor"
                                                                            stroke="currentColor"
                                                                            stroke-width="0.3"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </th>

                                                        <th
                                                            scope="col"
                                                            className="text-white px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                            Question
                                                        </th>

                                                        <th
                                                            scope="col"
                                                            className="text-white px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                            Query
                                                        </th>

                                                        <th
                                                            scope="col"
                                                            className="text-white px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                            Instruction
                                                        </th>

                                                        <th
                                                            scope="col"
                                                            className="text-white px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                            System
                                                        </th>
                                                        {permissions?.can_modify && permissions?.can_delete && (
                                                            <th scope="col" className="text-white relative py-3.5 px-4">
                                                                <span className="text-white">Actions</span>
                                                            </th>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900">
                                                    {questions.map(questionData => (
                                                        <TableRow
                                                            key={questionData.question_id}
                                                            {...questionData}
                                                            isExpanded={expandedRow === questionData.question_id}
                                                            onRowClick={() => handleRowClick(questionData.question_id)}
                                                            onRefresh={handleRefresh}
                                                            isAdmin={permissions.can_modify && permissions.can_delete}
                                                        />
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-6">
                            <a
                                href="#"
                                className="cursor-pointer transform hover:scale-[1.05] transition-transform duration-200 flex items-center px-5 py-2 text-sm text-gray-700 capitalize bg-white border rounded-md gap-x-2 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke-width="1.5"
                                    stroke="currentColor"
                                    className="w-5 h-5 rtl:-scale-x-100">
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
                                    />
                                </svg>

                                <span>previous</span>
                            </a>

                            <div className="items-center hidden md:flex gap-x-3">
                                <a
                                    href="#"
                                    className="px-2 py-1 text-sm text-blue-500 rounded-md dark:bg-gray-800 bg-blue-100/60">
                                    1
                                </a>
                                <a
                                    href="#"
                                    className="px-2 py-1 text-sm text-gray-500 rounded-md dark:hover:bg-gray-800 dark:text-gray-300 hover:bg-gray-100">
                                    2
                                </a>
                                <a
                                    href="#"
                                    className="px-2 py-1 text-sm text-gray-500 rounded-md dark:hover:bg-gray-800 dark:text-gray-300 hover:bg-gray-100">
                                    3
                                </a>
                                <a
                                    href="#"
                                    className="px-2 py-1 text-sm text-gray-500 rounded-md dark:hover:bg-gray-800 dark:text-gray-300 hover:bg-gray-100">
                                    ...
                                </a>
                                <a
                                    href="#"
                                    className="px-2 py-1 text-sm text-gray-500 rounded-md dark:hover:bg-gray-800 dark:text-gray-300 hover:bg-gray-100">
                                    12
                                </a>
                                <a
                                    href="#"
                                    className="px-2 py-1 text-sm text-gray-500 rounded-md dark:hover:bg-gray-800 dark:text-gray-300 hover:bg-gray-100">
                                    13
                                </a>
                                <a
                                    href="#"
                                    className="px-2 py-1 text-sm text-gray-500 rounded-md dark:hover:bg-gray-800 dark:text-gray-300 hover:bg-gray-100">
                                    14
                                </a>
                            </div>

                            <a
                                href="#"
                                className="cursor-pointer transform hover:scale-[1.05] transition-transform duration-200 flex items-center px-5 py-2 text-sm text-gray-700 capitalize bg-white border rounded-md gap-x-2 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800">
                                <span>Next</span>

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke-width="1.5"
                                    stroke="currentColor"
                                    className="w-5 h-5 rtl:-scale-x-100">
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                                    />
                                </svg>
                            </a>
                        </div>
                    </section>
                    {/* </div> */}
                </div>
            </div>
            {isModalOpen && (
                <LLMInstructionModal onClose={closeModal} title="Create A Record" btnText="Create" onRefresh={handleRefresh} />
            )}
        </>
    );
}
