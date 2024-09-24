import "@fontsource/space-grotesk";
import "./globals.css";

export const metadata = {
    title: "SingaPore Airlines Agent",
    description:
        "Chatting with SingaPore Airlines Agent is a breeze! Simply type your questions or requests in a clear and concise manner. Responses are sourced from real-time integrations with your data.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
