import { Tooltip } from "react-tooltip";
import { Listbox } from "@headlessui/react";
import { useState } from "react";
import { ChevronDown } from "react-bootstrap-icons";
import AirlineIcon from "./icons/singapore_icon";

interface Props {
    llm: string;
    setConfiguration: (llm: string) => void;
    theme: "light" | "dark";
    setTheme: (theme: "light" | "dark") => void;
    setUser: (user: string) => void;
}

const Navbar = ({ llm, setConfiguration, theme, setTheme, setUser }: Props): JSX.Element => {
    const llmOptions = [
        { label: "GPT 3.5 Turbo", value: "gpt-3.5-turbo" },
        { label: "GPT 4", value: "gpt-4" },
        { label: "GPT 4 Turbo", value: "gpt-4-1106-preview" },
    ];

    const [selectedUserId, setSelectedUserId] = useState("8991147774");

    const [selectedLlm, setSelectedLlm] = useState(llmOptions.find(opt => opt.value === llm));

    const handleChange = llm => {
        setSelectedLlm(llm);
        setConfiguration(llm.value);
    };

    const handleChangeUser = () => {
        setUser(selectedUserId); // Pass the entered user ID to the parent component
    };

    const handleToggle = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <nav className="flex flex-col md:flex-row gap-3 md:gap-6 rounded-t-3xl bg-primary items-center md:items-start sticky top-0 z-10 p-6 md:px-16 md:pt-16">
            {/* Singapore Airlines logo */}
            <AirlineIcon />
            <div className="flex gap-2 md:ml-auto">
                <Listbox value={selectedLlm} by="value" onChange={handleChange}>
                    <div className="relative">
                        <Listbox.Button className="h-10 px-4 rounded-full inline-flex justify-between gap-2 items-center bg-primary text-inverse hover:bg-primary-hover">
                            {selectedLlm.label}
                            <ChevronDown />
                        </Listbox.Button>
                        <Listbox.Options className="absolute mt-1 z-20 w-40 rounded-xl bg-body border p-2">
                            {llmOptions.map(llm => (
                                <Listbox.Option
                                    className={({ active, selected }) =>
                                        `relative cursor-default select-none px-2 py-1 rounded-xl${
                                            active ? " bg-bg-1" : " bg-none"
                                        }${selected ? " font-bold bg-bg-2" : " font-normal"}`
                                    }
                                    key={llm.value}
                                    value={llm}>
                                    {llm.label}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </div>
                </Listbox>
                {/* User Selection Listbox */}
                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        value={selectedUserId}
                        onChange={e => setSelectedUserId(e.target.value)}
                        placeholder="Enter user_id"
                        className="h-10 rounded-full bg-primary text-inverse placeholder:text-inverse"
                        style={{
                            borderColor: "var(--background-body)",
                            borderWidth: "1px",
                            borderStyle: "solid",
                            paddingLeft: "14px",
                        }}
                    />
                    <button
                        onClick={handleChangeUser}
                        className="h-10 px-3 rounded-full text-primary hover:bg-secondary-hover"
                        style={{ backgroundColor: "var(--background-body)" }}>
                        Set User ID
                    </button>
                </div>
                <button id="app-tooltip" className="peer border rounded-full bg-body hover:bg-bg-1 w-10 h-10">
                    ?
                </button>
                <Tooltip
                    anchorSelect="#app-tooltip"
                    place="bottom-end"
                    clickable
                    className="max-w-sm md:max-w-2xl rounded-2xl z-30">
                    Chatting with SingaPore Airlines is a breeze! Simply type your questions or requests in a clear and
                    concise manner. Responses are sourced from{" "}
                    <a
                        className="text-link"
                        href="https://www.google.com/aclk?sa=l&ai=DChcSEwiIwtuUzNuIAxWXZEECHUlyCGMYABAAGgJ3cw&co=1&ase=2&gclid=Cj0KCQjwxsm3BhDrARIsAMtVz6PYuBwwCVPW9OByVdavGt6_txSh_UE1FFOKVMHA-_4uAWJxlRBDUdEaAtN9EALw_wcB&sig=AOD64_39Zw3XUj44Yl6peNkLVC8sgvaegg&q&nis=4&adurl&ved=2ahUKEwj14deUzNuIAxV_SKQEHQdZOwAQ0Qx6BAgJEAE"
                        rel="noreferrer noopener"
                        target="_blank">
                        SingaPore airline&apos;s
                    </a>
                </Tooltip>
            </div>
        </nav>
    );
};

export default Navbar;
