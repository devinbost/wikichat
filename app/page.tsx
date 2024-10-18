"use client";
import React, { useEffect, useRef, useState } from "react";
import { ArrowCounterclockwise, Send } from "react-bootstrap-icons";
import Bubble from "../components/Bubble";
import Footer from "../components/Footer";
import LoadingBubble from "../components/LoadingBubble";
import Navbar from "../components/Navbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // Import useRouter

type UserState = {
    user_id: string;
    user_question: string;
};

export default function Home() {
    const { data: session, status } = useSession(); // Fetch session and its status
    const router = useRouter(); // Initialize the useRouter hook for redirection
    const [isLoading, setIsLoading] = useState(false);
    const [initialQuestion, setInitialQuestion] = useState("What is my mileage?");
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
    const [input, setInput] = useState<string>("");
    const [user, setUser] = useState<UserState>({
        user_id: "8991147774",
        user_question: "What is my mileage?",
    });

    // Example: Checking session status and role
    useEffect(() => {
        // Redirect to "/login" if session or role is not defined
        console.log("Session status:", status);
        if (status === "unauthenticated") {
            router.push("/login");
            //return;
        } else if (status === "authenticated" && session?.user) {
            console.log("Authenticated user:", session);
            console.log("User email:", session.email); // Access email
            console.log("User role:", session.role);   // Access role if attached
            setUser({
                user_id: session.email,  // Assuming email is used as user_id
                user_question: initialQuestion,
            });
        }
    }, [session, status, router]);

    const callFetchData = async (user: UserState, stream = true) => {
        let hasReceivedFirstChunk = false;
        await fetchData(
            user,
            stream,
            chunk => {
                if (!hasReceivedFirstChunk) {
                    hasReceivedFirstChunk = true;
                    setMessages(prevMessages => [...prevMessages, { role: "assistant", content: "" }]);
                    setIsLoading(false);
                }
                setMessages(prevMessages => {
                    const lastIndex = prevMessages.length - 1;
                    const lastMessage = prevMessages[lastIndex];
                    if (lastMessage && lastMessage.role === "assistant") {
                        const updatedMessage = {
                            ...lastMessage,
                            content: lastMessage.content + chunk,
                        };
                        return [...prevMessages.slice(0, lastIndex), updatedMessage];
                    } else {
                        return [...prevMessages, { role: "assistant", content: chunk }];
                    }
                });
            },
            fullMessage => {
                console.log("Stream Closed:", fullMessage);
                setIsLoading(false);
            },
            error => {
                console.error("Stream Error:", error);
                setIsLoading(false);
            },
        );
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleSendnew = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        if (input.trim()) {
            setMessages(prevMessages => [...prevMessages, { role: "user", content: input }]);

            setInput("");
            setUser(prevState => ({
                ...prevState,
                user_question: input,
            }));
            await callFetchData({
                ...user,
                user_question: input,
            });
        }
    };

    const fetchData = async (
        inputValue: UserState,
        stream: boolean,
        onUpdate: (data: any) => void,
        onClose: (message: string) => void,
        onError: (error: any) => void,
    ) => {
        try {
            const response = await fetch("/api/langflow", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inputValue: JSON.stringify(inputValue.user_question),
                    inputType: "chat",
                    outputType: "chat",
                    session_id: inputValue.user_id,
                    stream: stream,
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.statusText}`);
            }

            if (stream) {
                const reader = response.body?.getReader();
                const decoder = new TextDecoder();

                let buffer = "";
                let done = false;

                while (!done) {
                    const { value, done: doneReading } = await reader?.read();
                    done = doneReading;
                    if (value) {
                        buffer += decoder.decode(value, { stream: true });
                        let lines = buffer.split("\n");
                        buffer = lines.pop() || "";

                        for (const line of lines) {
                            if (line.startsWith("data: ")) {
                                const data = line.slice(6).trim();
                                if (data) {
                                    try {
                                        const parsedData = JSON.parse(data);
                                        if (parsedData.chunk) {
                                            onUpdate(parsedData.chunk);
                                        }
                                    } catch (err) {
                                        console.error("Failed to parse JSON:", err);
                                    }
                                }
                            }
                        }
                    }
                }
                onClose("Stream closed");
            } else {
                const data = await response.json();
                setMessages(prevMessages => [...prevMessages, { role: "assistant", content: data.message?.text }]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    return (
        <main className="flex h-screen flex-col items-center justify-center py-6">
            <section className="flex flex-col bg-body origin:w-[1200px] w-full origin:h-[800px] h-full rounded-3xl border overflow-y-auto">
                <Navbar />
                <div className="flex flex-col flex-auto mx-6 md:mx-16">
                    {messages.length > 0 ? (
                        <div className="flex flex-col gap-6 py-6">
                            {messages.map((message, index) => (
                                <Bubble key={`message-${index}`} content={message} />
                            ))}
                            {isLoading && <LoadingBubble />}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6 md:gap-16 mt-auto mb-6">
                            <div className="text-l md:text-2xl text-left">Welcome. Please ask a question below.</div>
                        </div>
                    )}
                </div>
                <div className="sticky bottom-0 bg-body z-10 p-6 md:px-16 md:pb-16">
                    <form className="flex h-[40px] gap-2" onSubmit={handleSendnew}>
                        <div className="relative flex-1">
                            <input
                                className="input border w-full rounded-full py-2 px-4"
                                onChange={handleInputChange}
                                placeholder="Enter your question..."
                                value={input}
                            />
                            <button type="submit" className="absolute end-3 bottom-2.5">
                                <Send size={20} />
                            </button>
                        </div>
                        <button className="bg-primary text-inverse rounded-full px-2.5">
                            <ArrowCounterclockwise size={20} />
                        </button>
                    </form>
                    <Footer />
                </div>
            </section>
        </main>
    );
}