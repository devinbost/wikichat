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

export default function Home() {
    const [isLoading, setIsLoading] = useState(false);
    const [initialData, setInitialData] = useState<string>("");
    const [messages, setmessages] = useState<{ role: string; content: string }[]>([]);
    const [input, setinput] = useState<string>("");
    const initialPrompt = "8888888888";

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setinput(e.target.value);
    };

    const handleSendnew = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setmessages(prevMessages => [...prevMessages, { role: "user", content: input }]);
        if (input.trim()) {
            setinput("");
            const assistantResponse = await fetchData(input);
            setmessages(prevMessages => [...prevMessages, { role: "assistant", content: assistantResponse }]);
            setIsLoading(false);
        }
    };

    const fetchData = async (inputValue: string, stream = false) => {
        try {
            const response = await fetch("/api/langflow", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inputValue: inputValue,
                    inputType: "chat",
                    outputType: "chat",
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
        } finally {
            setIsLoading(false);
        }
    };

    const { category, setCategory, theme, setTheme } = useTheme();
    const { llm, setConfiguration } = useConfiguration();

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        fetchData(initialPrompt);
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
                <Navbar llm={llm} setConfiguration={setConfiguration} theme={theme} setTheme={setTheme} />
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
                            <div className="text-xl md:text-3xl text-center">
                                What would you like to learn about today?
                            </div>
                            <div className="text-md md:text-lg text-center">
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
