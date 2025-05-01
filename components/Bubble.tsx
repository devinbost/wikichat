import { useState } from "react";
import { forwardRef, JSXElementConstructor, RefObject } from "react";
import {
    Link as LinkIcon,
    HandThumbsUp,
    HandThumbsUpFill,
    HandThumbsDown,
    HandThumbsDownFill,
} from "react-bootstrap-icons";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

const Bubble: JSXElementConstructor<any> = forwardRef(function Bubble({ content, category }, ref) {
    const { role } = content;
    const isUser = role === "user";

    const [likeStatus, setLikeStatus] = useState<"liked" | "disliked" | null>(null);

    const handleLike = async () => {
        if (likeStatus === "liked") {
            setLikeStatus(null);
        } else {
            setLikeStatus("liked");
            // Send like to the server
            await saveFeedback("like", content);
        }
    };

    const handleDislike = async () => {
        if (likeStatus === "disliked") {
            setLikeStatus(null);
        } else {
            setLikeStatus("disliked");
            // Send dislike to the server
            await saveFeedback("dislike", content);
        }
    };

    const saveFeedback = async (feedbackType: "like" | "dislike", message: { content: string }) => {
        // try {
        //     await fetch("/api/feedback", {
        //         method: "POST",
        //         headers: {
        //             "Content-Type": "application/json",
        //         },
        //         body: JSON.stringify({
        //             feedbackType,
        //             message: message.content,
        //         }),
        //     });
        // } catch (error) {
        //     console.error("Error saving feedback:", error);
        // }
    };

    return (
        <div
            ref={ref as RefObject<HTMLDivElement>}
            className={`relative ${isUser ? "ml-24 md:ml-52" : "mr-24 md:mr-52"}`}>
            <Markdown
                className={`border p-3 max-w-fit rounded-t-xl ${
                    isUser ? "ml-auto bg-bg-2 rounded-bl-xl" : "mr-auto rounded-br-xl"
                }`}
                remarkPlugins={[remarkGfm]}
                components={{
                    a() {
                        return null;
                    },
                    code({ node, children, ...props }) {
                        return <code {...props}>{children}</code>;
                    },
                }}>
                {content?.content}
            </Markdown>
            {/* Like and Dislike buttons for assistant */}
            {!isUser && (
                <div className="flex gap-2 mt-1 justify-start">
                    {/* Like Button */}
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-[2px] px-[10px] py-1 rounded-full border ${
                            likeStatus === "liked" ? "border-blue-500" : "border-gray-400"
                        }`}>
                        {likeStatus === "liked" ? (
                            <HandThumbsUpFill size={16} className="text-blue-500" /> // Filled like icon
                        ) : (
                            <HandThumbsUp size={16} className="text-gray-500" /> // Outlined like icon
                        )}
                    </button>

                    {/* Dislike Button */}
                    <button
                        onClick={handleDislike}
                        className={`flex items-center gap-[2px] px-[10px] py-1 rounded-full border ${
                            likeStatus === "disliked" ? "border-red-500" : "border-gray-400"
                        }`}>
                        {likeStatus === "disliked" ? (
                            <HandThumbsDownFill size={16} className="text-red-500" />
                        ) : (
                            <HandThumbsDown size={16} className="text-gray-500" />
                        )}
                    </button>
                </div>
            )}
        </div>
    );
});

export default Bubble;
