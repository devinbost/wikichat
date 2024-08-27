import { Tooltip } from 'react-tooltip';
import { Listbox } from '@headlessui/react';
import { useState } from 'react';
import { ChevronDown } from 'react-bootstrap-icons';

interface Props {
  llm: string;
  setConfiguration: (llm: string) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const Navbar = ({ llm, setConfiguration, theme, setTheme }: Props): JSX.Element => {
    const llmOptions = [
      { label: 'GPT 3.5 Turbo', value: 'gpt-3.5-turbo' },
      { label: 'GPT 4', value: 'gpt-4' },
      { label: 'GPT 4 Turbo', value: 'gpt-4-1106-preview' },
    ];

    const [selectedLlm, setSelectedLlm] = useState(llmOptions.find(opt => opt.value === llm));
  
    const handleChange = (llm) => {
      setSelectedLlm(llm)
      setConfiguration(
          llm.value,
      );
    };

    const handleToggle = () => {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    };

  
    return <nav className="flex flex-col md:flex-row gap-3 md:gap-6 rounded-t-3xl bg-primary items-center md:items-start sticky top-0 z-10 p-6 md:px-16 md:pt-16">
      {/* Singapore Airlines logo */}
      <svg xmlns="http://www.w3.org/2000/svg" width="124" height="46" viewBox="0 0 124 46"><g fill-rule="evenodd" clip-rule="evenodd"><path fill="#fff" d="M43.223 30.547h1.835v7.266h4.478v1.557h-6.313v-8.823zM50.945 30.547h1.82v8.823h-1.82v-8.823zM28.6 30.547h1.805v8.823H28.6v-8.823zM59.196 18.14c2.656 0 4.8 2.16 4.8 4.816 0 2.643-2.144 4.8-4.8 4.8-2.657 0-4.816-2.157-4.816-4.8 0-2.657 2.16-4.815 4.816-4.815zM65.787 30.547h6.915V32h-5.08v2.157h4.317v1.602h-4.317v2.14h5.08v1.47h-6.916v-8.823zM75.522 18.684h6.915v1.454h-5.08v2.143h4.33v1.6h-4.33v2.144h5.08v1.454h-6.915v-8.794zM33.21 39.37v-8.823h5.24s2.526.043 2.526 2.568c0 0 .234 2.1-1.91 2.95l2.658 3.305h-2.26l-3.67-4.58H37.7s1.365-.03 1.365-1.41c0-1.307-1.102-1.41-1.44-1.41h-2.583v7.4H33.21zM65.465 27.478v-8.794h5.24s2.526.044 2.526 2.57c0 0 .22 2.084-1.907 2.936l2.656 3.288h-2.26l-3.672-4.55h1.908s1.366-.03 1.366-1.41c0-1.32-1.102-1.41-1.44-1.41H67.3v7.37h-1.835zM45.615 27.478v-8.794h5.14s2.568.176 2.568 2.73c0 2.54-1.865 3.128-2.79 3.128h-2.07l-.983-1.337v4.272h-1.865zM16.958 39.37l4.198-8.823h1.997l4.125 8.823h-2.026l-1.116-2.585H20.07l-1.145 2.585h-1.967zM34.15 27.478l4.183-8.794h2.012l4.125 8.794h-2.04l-1.1-2.57H37.26l-1.145 2.57H34.15zM28.732 25.95h2.48v-4.036h1.762v5.563H28.35c-.69 0-4.023-.778-4.052-4.286-.03-3.478 3.01-4.507 4.185-4.507h4.537v1.557h-4.096s-2.746 0-2.746 2.892c0 2.246 2.275 2.82 2.554 2.82zM55.158 30.547h1.85v1.364l1.16-1.363h2.188s2.994-.163 2.994 3.038v5.785h-1.864v-6.063s-.06-1.204-1.32-1.204h-3.158v7.268h-1.85v-8.823zM14.432 18.684h1.835v1.35l1.16-1.35h2.187s3.01-.16 3.01 3.04v5.754H20.76v-6.033s-.073-1.204-1.336-1.204h-3.156v7.238h-1.835v-8.794zM10.086 18.684h1.806v8.794h-1.806v-8.794zM74.715 39.355v-1.498h5.108s1.013.19 1.013-1.042-.763-1.1-1.042-1.1h-2.95s-2.276.16-2.276-2.512c0-2.657 2.246-2.657 2.246-2.657h5.608v1.556h-4.918s-1.07 0-1.07 1.013.718 1.204 1.394 1.204h2.628s2.217-.236 2.217 2.407-2.275 2.628-2.275 2.628h-5.683zM.19 27.478V25.98H5.3s1.013.192 1.013-1.04-.763-1.103-1.042-1.103H2.32S.043 24 .043 21.342c0-2.673 2.246-2.658 2.246-2.658h5.608v1.557H2.98s-1.072 0-1.072 1.014.734 1.204 1.395 1.204H5.93s2.218-.234 2.218 2.393c0 2.645-2.276 2.63-2.276 2.63H.192v-.002z"></path><path fill="#F99F1C" d="M0 43.084h85.843L84.14 45.74H0v-2.656zM101.48 41.88h-3.157l6.37-10.056s.956-2.085-.292-4.287l-8.882-14.71s-.777-1.366 0-2.673l2.628-3.936L108.57 23.25s2.687 3.567-.235 7.985L101.48 41.88zM109.1 38.797l3.875-5.902s1.13-2.436 4.052-2.436h4.11L124 34.98s-2.26-.234-3.274 1.38l-4.228 6.37s-1.38 2.98-5.065 2.98h-19.91L99.1 34.084s1.07-1.365-.426-3.625l-6.74-10.835s-1.658-1.6.06-4.347l1.968-2.98 9.367 15.18s1.657 2.086 0 4.582l-7.034 10.966h14.828s1.674.31 3.112-1.834l3.686-5.668s.837-1.908 2.687-2.686h-2.98s-1.557.058-2.746 1.91l-3.274 5.062s-1.19 2.145-3.816 2.145h-5.184l6.255-9.705s3.406-4.478 1.014-8.588L99.51 6.513s-.778-1.482.117-2.862l2.26-3.39 11.804 19.012s1.732 2.848 1.732 5.05c0 2.2-1.38 4.698-2.144 5.96l-5.197 8.105s-.587.777-.176 1.072c.425.292.836-.237 1.19-.663z"></path><path fill="#232F67" d="M59.196 19.902c1.674 0 3.054 1.365 3.054 3.054 0 1.66-1.38 3.04-3.054 3.04-1.688 0-3.054-1.38-3.054-3.04 0-1.688 1.366-3.054 3.054-3.054zM47.45 22.927v-2.893h2.453s1.645-.088 1.645 1.483c0 1.38-1.336 1.41-1.645 1.41H47.45zM40.683 23.396l-1.366-3.126-1.395 3.126h2.76zM23.49 35.288l-1.35-3.156-1.395 3.156h2.745z"></path></g></svg>
      <div className="flex gap-2 md:ml-auto">
        <Listbox value={selectedLlm} by="value" onChange={handleChange}>
          <div className="relative">
            <Listbox.Button className="h-10 px-4 rounded-full inline-flex justify-between gap-2 items-center bg-primary text-inverse hover:bg-primary-hover">
              {selectedLlm.label}
              <ChevronDown />
            </Listbox.Button>
            <Listbox.Options className="absolute mt-1 z-20 w-40 rounded-xl bg-body border p-2">
                {llmOptions.map((llm) => (
                <Listbox.Option
                  className={({ active, selected }) =>
                    `relative cursor-default select-none px-2 py-1 rounded-xl${active ? ' bg-bg-1' : ' bg-none'}${selected ? ' font-bold bg-bg-2' : ' font-normal'}`
                  }
                  key={llm.value}
                  value={llm}
                >
                    {llm.label}
                </Listbox.Option>
                ))}
            </Listbox.Options>
          </div>
        </Listbox>

        {/* <button onClick={handleToggle} className="inline-flex border items-center justify-center rounded-full bg-body hover:bg-bg-1 w-10 h-10">
          {theme === 'dark' ? (
              <svg aria-label="Light Mode" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="M12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7ZM2 13H4C4.55 13 5 12.55 5 12C5 11.45 4.55 11 4 11H2C1.45 11 1 11.45 1 12C1 12.55 1.45 13 2 13ZM20 13H22C22.55 13 23 12.55 23 12C23 11.45 22.55 11 22 11H20C19.45 11 19 11.45 19 12C19 12.55 19.45 13 20 13ZM11 2V4C11 4.55 11.45 5 12 5C12.55 5 13 4.55 13 4V2C13 1.45 12.55 1 12 1C11.45 1 11 1.45 11 2ZM11 20V22C11 22.55 11.45 23 12 23C12.55 23 13 22.55 13 22V20C13 19.45 12.55 19 12 19C11.45 19 11 19.45 11 20ZM5.99 4.58C5.6 4.19 4.96 4.19 4.58 4.58C4.19 4.97 4.19 5.61 4.58 5.99L5.64 7.05C6.03 7.44 6.67 7.44 7.05 7.05C7.43 6.66 7.44 6.02 7.05 5.64L5.99 4.58ZM18.36 16.95C17.97 16.56 17.33 16.56 16.95 16.95C16.56 17.34 16.56 17.98 16.95 18.36L18.01 19.42C18.4 19.81 19.04 19.81 19.42 19.42C19.81 19.03 19.81 18.39 19.42 18.01L18.36 16.95ZM19.42 5.99C19.81 5.6 19.81 4.96 19.42 4.58C19.03 4.19 18.39 4.19 18.01 4.58L16.95 5.64C16.56 6.03 16.56 6.67 16.95 7.05C17.34 7.43 17.98 7.44 18.36 7.05L19.42 5.99ZM7.05 18.36C7.44 17.97 7.44 17.33 7.05 16.95C6.66 16.56 6.02 16.56 5.64 16.95L4.58 18.01C4.19 18.4 4.19 19.04 4.58 19.42C4.97 19.8 5.61 19.81 5.99 19.42L7.05 18.36Z" />
              </svg>
            ): (
              <svg aria-label="Dark Mode" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="M12 3.46057C7.03 3.46057 3 7.49057 3 12.4606C3 17.4306 7.03 21.4606 12 21.4606C16.97 21.4606 21 17.4306 21 12.4606C21 12.0006 20.96 11.5406 20.9 11.1006C19.92 12.4706 18.32 13.3606 16.5 13.3606C13.52 13.3606 11.1 10.9406 11.1 7.96057C11.1 6.15057 11.99 4.54057 13.36 3.56057C12.92 3.50057 12.46 3.46057 12 3.46057Z" />
              </svg>
            )
          }
          </button> */}

        <button id="app-tooltip" className="peer border rounded-full bg-body hover:bg-bg-1 w-10 h-10">?</button>
        <Tooltip anchorSelect="#app-tooltip" place="bottom-end" clickable className="max-w-sm md:max-w-2xl rounded-2xl z-30">
          Chatting with WikiChat is a breeze!
          Simply type your questions or requests in a clear and concise manner.
          Responses are sourced from{' '}
          <a
              className='text-link'
              href="https://en.wikipedia.org/wiki/Wikipedia:Popular_pages#Top-100_list"
              rel="noreferrer noopener"
              target="_blank"
          >
              Wikipedia&apos;s most popular pages
          </a>
          {' '}and a link to further reading is provided.
        </Tooltip>
      </div>
  </nav>
}

export default Navbar