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
    const [messages, setmessages] = useState<{ role: string; content: string }[]>([]);
    const [input, setinput] = useState<string>("");
    const [user, setUser] = useState<UserState>({
        user_id: "8888888888",
        user_question: "What is my mileage?",
    });

    // Function to update only the 'input' part of user
    const setuser = async (Customer: string) => {
        setUser(prevState => ({
            ...prevState,
            user_id: Customer,
        }));
        setIsLoading(true);
        setmessages([{ role: "assistant", content: "Loading user's data. It will take a minute." }]);
        const assistantResponse = await fetchData({
            ...user, // Spread the previous state to keep other values
            user_id: Customer,
        });
        setmessages(prevMessages => [...prevMessages, { role: "assistant", content: assistantResponse }]);
        setIsLoading(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setinput(e.target.value);
    };

    const handleSendnew = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setmessages(prevMessages => [...prevMessages, { role: "user", content: input }]);
        if (input.trim()) {
            setinput("");
            // Pass the updated input object to fetchData
            const assistantResponse = await fetchData({
                ...user, // Spread the previous state to keep other values
                user_question: input,
            });

            setmessages(prevMessages => [...prevMessages, { role: "assistant", content: assistantResponse }]);
            setIsLoading(false);
        }
    };

    const fetchData = async (inputValue: UserState, stream = false) => {
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
            if (initialData.length > 0) {
                return data.message?.text;
            }
            setInitialData(data.message?.text || "No data found.");
        } catch (error) {
            console.error("Error fetching initial data:", error);
            setInitialData("Error fetching data.");
        }
    };

    const { category, setCategory, theme, setTheme } = useTheme();
    const { llm, setConfiguration } = useConfiguration();

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        fetchData(user);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages.length]);

    const handleReset = () => {
        setmessages([]);
        setCategory("custom");
    };

    return (
        <main className={`${category} flex h-screen flex-col items-center justify-center py-6`}>
            <section className="flex flex-col bg-body origin:w-[1200px] w-full origin:h-[800px] h-full rounded-3xl border overflow-y-auto scrollbar">
                <Navbar
                    llm={llm}
                    setConfiguration={setConfiguration}
                    theme={theme}
                    setTheme={setTheme}
                    setUser={setuser}
                />
                <div className="flex flex-col flex-auto mx-6 md:mx-16">
                    {messages && messages.length > 0 ? (
                        <div className="flex flex-col gap-6 py-6">
                            {messages.map((message, index) => (
                                <Bubble
                                    ref={messagesEndRef}
                                    key={`message-${index}`}
                                    content={message}
                                    category={category}
                                />
                            ))}
                            {isLoading && messages?.length % 2 !== 0 && <LoadingBubble ref={messagesEndRef} />}
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
