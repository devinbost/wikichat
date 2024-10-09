"use client";
import { FormEvent, useEffect, useState } from "react";

interface MyModalProps {
    question_id?: number;
    question?: string;
    query?: string;
    instruction?: string;
    system?: string;
    onClose: () => void;
    children?: React.ReactNode;
    title?: string;
    btnText?: string;
    modalType?: string;
    onRefresh: () => void;
}

const MyModal: React.FC<MyModalProps> = ({
    question_id,
    question,
    query,
    instruction,
    system,
    title,
    btnText,
    modalType = "Create",
    onClose,
    onRefresh,
}) => {
    const [loading, setLoading] = useState(false);
    const [formQuestion, setFormQuestion] = useState(question || "");
    const [formQuery, setFormQuery] = useState(query || "");
    const [formInstruction, setFormInstruction] = useState(instruction || "");
    const [formSystem, setFormSystem] = useState(system || "");
    const [error, setError] = useState("");

    // Update the state when the props change
    useEffect(() => {
        setFormQuestion(question || "");
        setFormQuery(query || "");
        setFormInstruction(instruction || "");
        setFormSystem(system || "");
    }, [question, query, instruction, system]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError("");
        if (modalType === "Create") {
            const res = await fetch("/api/createRecord", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ formQuestion, formQuery, formInstruction, formSystem }),
            });

            if (res.ok) {
                onRefresh();
                onClose();
            } else {
                const data = await res.json();
                setError(data.message);
            }
        } else if (modalType === "Update") {
            const res = await fetch("/api/updateRecord", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ question_id, formQuestion, formQuery, formInstruction, formSystem }),
            });

            if (res.ok) {
                onRefresh();
                onClose();
            } else {
                const data = await res.json();
                setError(data.message);
            }
        }
    }

    return (
        <>
            <div className="z-20 fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-50 py-10">
                <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
                    <div className="relative py-3  sm:mx-auto">
                        <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
                            <div className=" min-w-[43rem] mx-auto">
                                <div className="flex items-center space-x-5">
                                    <div className="h-[70px] w-[70px] bg-yellow-200 rounded-full flex flex-shrink-0 justify-center items-center text-yellow-500 text-2xl font-mono">
                                        SIA
                                    </div>
                                    <div className="pl-2 font-semibold text-xl  text-gray-700">
                                        <h2 className="leading-relaxed">{title}</h2>
                                        {/* <p className="text-sm text-gray-500 font-normal leading-relaxed">
                                            Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                                        </p> */}
                                    </div>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="divide-y divide-gray-200">
                                        <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                                            <div className="flex flex-col">
                                                <label className="leading-loose">Question</label>
                                                <input
                                                    type="text"
                                                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                                                    placeholder="Question"
                                                    value={formQuestion}
                                                    onChange={e => setFormQuestion(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <label className="leading-loose">Query</label>
                                                <input
                                                    type="text"
                                                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                                                    placeholder="Query"
                                                    value={formQuery}
                                                    onChange={e => setFormQuery(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <label className="leading-loose">Instruction</label>
                                                <input
                                                    type="text"
                                                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                                                    placeholder="Instruction"
                                                    value={formInstruction}
                                                    onChange={e => setFormInstruction(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <label className="leading-loose">System</label>
                                                <input
                                                    type="text"
                                                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                                                    placeholder="System"
                                                    value={formSystem}
                                                    onChange={e => setFormSystem(e.target.value)}
                                                    required
                                                />
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
export default MyModal;
