"use client";
import { useEffect, useRef, useState } from "react";
import { Trash3, PencilSquare } from "react-bootstrap-icons";
import MyModal from "../Modal";

interface TableRowProps {
    question_id: number;
    question: string;
    query: string;
    instruction: string;
    system: string;
    isExpanded: boolean;
    isAdmin: boolean;
    onRowClick: () => void;
    onRefresh: () => void;
}

const TableRow: React.FC<TableRowProps> = ({
    question_id,
    question = "Dummy Question",
    query,
    instruction,
    system,
    isExpanded,
    isAdmin = false,
    onRowClick,
    onRefresh,
}) => {
    const [height, setHeight] = useState<number | "auto">(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const handleDelete = async () => {
        const confirmed = confirm("Are you sure you want to delete this question?");
        if (confirmed) {
            try {
                const response = await fetch(`/api/deleteRecord`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ question_id }),
                });

                if (response.ok) {
                    console.log("Delete successful");
                    onRefresh(); // This will refresh the data after deletion
                } else {
                    console.error("Delete failed");
                }
            } catch (error) {
                console.error("Error deleting question: ", error);
            }
        }
    };

    const openModal = (modalType: string) => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        if (isExpanded) {
            setHeight(contentRef.current?.scrollHeight || 0);
        } else {
            setHeight(0);
        }
    }, [isExpanded]);

    return (
        <>
            <tr>
                <td onClick={onRowClick} className="cursor-pointer px-4 py-4 text-sm font-medium">
                    <div className="inline-flex items-center gap-x-3">
                        <span>{question_id}</span>
                    </div>
                </td>
                <td onClick={onRowClick} className="cursor-pointer px-4 py-4 text-sm">
                    <div
                        className="cursor-pointer w-[250px] overflow-hidden text-ellipsis whitespace-nowrap"
                        title={isExpanded ? undefined : question}>
                        {question}
                    </div>
                </td>
                <td onClick={onRowClick} className="cursor-pointer px-4 py-4 text-sm font-medium whitespace-nowrap">
                    <div className="inline-flex items-center px-3 py-1 rounded-full gap-x-2 bg-emerald-100/60">
                        <h2 className="text-sm font-normal">
                            <div
                                className="w-[250px] overflow-hidden text-ellipsis whitespace-nowrap"
                                title={isExpanded ? undefined : query}>
                                {query}
                            </div>
                        </h2>
                    </div>
                </td>
                <td onClick={onRowClick} className="cursor-pointer px-4 py-4 text-sm text-gray-500">
                    <div className="flex items-center gap-x-2">
                        <div>
                            <h2 className="text-sm font-medium">
                                <div
                                    className="w-[250px] overflow-hidden text-ellipsis whitespace-nowrap"
                                    title={isExpanded ? undefined : instruction} // Full text on hover only if not expanded
                                >
                                    {instruction}
                                </div>
                            </h2>
                        </div>
                    </div>
                </td>
                <td onClick={onRowClick} className="cursor-pointer px-4 py-4">
                    {system}
                </td>
                {isAdmin && (
                    <td className="px-4 py-4 text-sm">
                        <div className="flex items-center justify-center gap-x-4">
                            <PencilSquare
                                onClick={() => openModal("update")}
                                className="cursor-pointer transform hover:scale-[1.5] transition-transform duration-200"
                            />
                            <Trash3
                                onClick={handleDelete}
                                className="cursor-pointer transform hover:scale-[1.5] transition-transform duration-200"
                            />
                        </div>
                    </td>
                )}
            </tr>

            <tr style={{ border: "none" }}>
                <td colSpan={6} className="px-4 py-0">
                    <div
                        ref={contentRef}
                        style={{
                            height: height === "auto" ? "auto" : `${height}px`,
                            overflow: "hidden",
                            transition: "height 0.3s ease",
                        }}
                        className="bg-gray-100">
                        <div className="px-4 py-4 text-sm">
                            <p>
                                <strong>Full Question:</strong> {question}
                            </p>
                            <p>
                                <strong>Full Query:</strong> {query}
                            </p>
                            <p>
                                <strong>Full Instruction:</strong> {instruction}
                            </p>
                        </div>
                    </div>
                </td>
            </tr>
            {isModalOpen && (
                <MyModal
                    onClose={closeModal}
                    question={question}
                    query={query}
                    instruction={instruction}
                    system={system}
                    question_id={question_id}
                    title="Update A Record"
                    btnText="Update"
                    modalType="Update"
                    onRefresh={onRefresh}
                />
            )}
        </>
    );
};
export default TableRow;
