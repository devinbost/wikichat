"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowCounterclockwise, Tools, Send } from "react-bootstrap-icons";
import Bubble from "../components/Bubble";
import Footer from "../components/Footer";
import useConfiguration from "./hooks/useConfiguration";
import useTheme from "./hooks/useTheme";
import LoadingBubble from "../components/LoadingBubble";
import Navbar from "../components/Navbar";
import ReactMarkdown from "react-markdown";

type UserState = {
    user_id: string;
    user_question: string;
};

export default function Home() {
    const [isLoading, setIsLoading] = useState(false);
    const [initialData, setInitialData] = useState<string>("");
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
    const [input, setInput] = useState<string>("");
    const [user, setUser] = useState<UserState>({
        user_id: "8888888888",
        user_question: "What is my mileage?",
    });

    // Function to handle streaming using axios
    const handleStream = async (
        streamUrl: string,
        onUpdate: (data: any) => void,
        onClose: (message: string) => void,
        onError: (error: any) => void,
    ) => {
        let hasReceivedFirstChunk = false;
        try {
            const eventSource = new EventSource(streamUrl);

            eventSource.onopen = () => {
                console.log("Stream connection opened.");
            };
            eventSource.onmessage = event => {
                const parsedData = JSON.parse(event.data);
                if (!hasReceivedFirstChunk) {
                    hasReceivedFirstChunk = true;
                    setMessages(prevMessages => [...prevMessages, { role: "assistant", content: "" }]);
                    setIsLoading(false);
                }

                if (parsedData.chunk) {
                    // Update the UI with the received chunk
                    onUpdate(parsedData.chunk);
                } else if (parsedData.message) {
                    console.log(parsedData.message); // Log any additional messages
                }
            };

            eventSource.onerror = error => {
                console.error("Stream Error:", error);
                onError(error);
                eventSource.close();
            };

            eventSource.addEventListener("close", event => {
                console.log("Stream closed:", event);
                onClose("Stream closed");
                eventSource.close();
            });
        } catch (error) {
            console.error("Error during streaming:", error);
            onError(error);
        }
    };

    const callFetchData = async (user: UserState, stream = true) => {
        await fetchData(
            user,
            stream,
            chunk => {
                setMessages(prevMessages => {
                    const lastIndex = prevMessages.length - 1;
                    const lastMessage = prevMessages[lastIndex];
                    if (lastMessage.role === "assistant") {
                        const updatedMessage = {
                            ...lastMessage,
                            content: lastMessage.content + chunk,
                        };
                        return [...prevMessages.slice(0, lastIndex), updatedMessage];
                    } else {
                        return prevMessages;
                    }
                });
            },
            fullMessage => {
                console.log("Stream Closed:", fullMessage);
            },
            error => {
                console.error("Stream Error:", error);
            },
        );
    };

    const setuser = async (Customer: string) => {
        setIsLoading(true);
        setInitialData("");
        setMessages([]);
        setUser(prevState => ({
            ...prevState,
            user_id: Customer,
        }));
        await callFetchData(
            {
                ...user,
                user_id: Customer,
            },
            false,
        );
        setIsLoading(false);
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
            setIsLoading(true);
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
                    inputValue: JSON.stringify(inputValue),
                    inputType: "chat",
                    outputType: "chat",
                    session_id: inputValue.user_id,
                    stream: stream,
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.statusText}`);
            }

            const data = await response.json();

            if (stream && data.streamUrl) {
                const streamUrl = data.streamUrl;
                await handleStream(process.env.NEXT_PUBLIC_LANGFLOW_BASE_URL + streamUrl, onUpdate, onClose, onError);
            } else {
                setInitialData(data.message?.text || "No data found.");
                setMessages(prevMessages => [...prevMessages, { role: "assistant", content: data.message?.text }]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setInitialData("Error fetching data");
        }
    };

    const { category, setCategory, theme, setTheme } = useTheme();
    const { llm, setConfiguration } = useConfiguration();

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        callFetchData(user, false);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages.length]);

    const handleReset = () => {
        setMessages([]);
        setCategory("custom");
    };

    return (
        <main className={`${category} flex h-screen flex-col items-center justify-center py-6`}>
            <section className="flex flex-col bg-body origin:w-[1200px] w-full origin:h-[800px] h-full rounded-3xl border overflow-y-auto scrollbar-none">
                <Navbar
                    llm={llm}
                    setConfiguration={setConfiguration}
                    theme={theme}
                    setTheme={setTheme}
                    setUser={setuser}
                />
                <div className="flex flex-col flex-auto mx-6 md:mx-16">
                    {messages && messages.length > 2 ? (
                        <div className="flex flex-col gap-6 py-6">
                            {messages.map((message, index) => (
                                <Bubble
                                    ref={messagesEndRef}
                                    key={`message-${index}`}
                                    content={message}
                                    category={category}
                                />
                            ))}
                            {isLoading && <LoadingBubble ref={messagesEndRef} />}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6 md:gap-16 mt-auto mb-6">
                            <div className="text-l md:text-2xl text-left">
                                Please wait as we retrieve your information...
                            </div>
                            <div className="text-md md:text-lg text-left">
                                <ReactMarkdown>{initialData}</ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>
                <div className="sticky bottom-0 bg-body z-10 p-6 md:px-16 md:pb-16">
                    <form className="flex h-[40px] gap-2" onSubmit={handleSendnew}>
                        <div className="relative flex-1">
                            <input
                                className="input border-tertiary hover:border-primary focus:border-primary block border w-full text-sm md:text-base outline-none bg-transparent rounded-full py-2 px-4"
                                onChange={handleInputChange}
                                placeholder="Enter your question..."
                                value={input}
                            />
                            <button type="submit" className="absolute end-3 bottom-2.5">
                                <Send size={20} />
                            </button>
                        </div>
                        <button
                            onClick={handleReset}
                            className="bg-primary text-inverse hover:bg-primary-hover flex rounded-full items-center justify-center px-2.5 origin:px-3">
                            <ArrowCounterclockwise size={20} />
                            <span className="hidden origin:block text-sm ml-2">New chat</span>
                        </button>
                    </form>
                    <Footer />
                </div>
            </section>
        </main>
    );
}
