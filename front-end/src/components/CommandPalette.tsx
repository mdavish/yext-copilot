import { useState, useEffect } from "react";
import { Dialog, Combobox } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import cx from "classnames";
import Fuse from "fuse.js";
import { FaRobot } from "react-icons/fa";

export interface CommandPaletteItem {
  id?: string;
  name: string;
  icon?: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  href?: string;
  onSelect?: () => void;
}

interface CommandPaletteProps {
  onCopilotQuery: (query: string) => void;
  show: boolean;
  onClose: () => void;
  onSelect: (item: CommandPaletteItem) => void;
  items: CommandPaletteItem[];
  defaultItems?: CommandPaletteItem[];
}

const CommandPalette = ({
  onCopilotQuery,
  items,
  defaultItems,
  show,
  onSelect,
  onClose,
}: CommandPaletteProps) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (show) {
      setQuery("");
    }
  }, [show]);

  const fuse = new Fuse(items, {
    keys: ["name"],
  });
  let filteredResults: CommandPaletteItem[];
  if (query.length > 2) {
    const fuseResults = fuse.search(query);
    filteredResults = fuseResults.map((i) => {
      return i.item;
    });
  } else {
    filteredResults = defaultItems ?? [];
  }

  return (
    <Dialog
      onClose={onClose}
      open={show}
      className="fixed inset-0 p-4 pt-[15vh] overflow-y-auto z-20"
    >
      <Dialog.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
      <Combobox
        value={undefined}
        onChange={(value) => {
          if (value === "copilot") {
            onCopilotQuery(query);
          } else {
            onSelect(value!);
          }
        }}
        as="div"
        className="rounded-xl shadow-2xl relative text-black bg-slate-100 max-w-2xl mx-auto ring-1 ring-slate-300 divide-y divide-slate-200 overflow-hidden"
      >
        <div className="px-4 py-2 flex items-center text-slate-600">
          <MagnifyingGlassIcon className="h-4" />
          <Combobox.Input
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="border-none bg-slate-100 text-slate-600 placeholder:text-slate-400 w-full focus:ring-0"
            placeholder="Search..."
          ></Combobox.Input>
        </div>
        <Combobox.Options
          static
          className="py-2 max-h-96 flex flex-col overflow-y-auto"
        >
          {filteredResults.length > 0 &&
            filteredResults.map((item) => (
              <Combobox.Option key={item.id ?? item.href} value={item}>
                {({ active }) => (
                  <div
                    className={cx(
                      active ? "bg-slate-200" : "bg-slate-100",
                      "px-4 py-2 text-slate-600 flex items-center"
                    )}
                  >
                    {item.icon && (
                      <item.icon className="h-4 mr-4" aria-hidden="true" />
                    )}
                    {item.name}
                  </div>
                )}
              </Combobox.Option>
            ))}
          {query && (
            <Combobox.Option value="copilot">
              {({ active }) => (
                <div
                  className={cx(
                    active ? "bg-indigo-100" : "bg-slate-100",
                    "px-4 py-2 text-slate-600 flex items-center"
                  )}
                >
                  <FaRobot
                    className="h-4 mr-4 text-indigo-700"
                    aria-hidden="true"
                  />
                  <span className="font-medium">Ask Copilot</span> &nbsp;{" "}
                  <span className="">{` ${query}`}</span>
                </div>
              )}
            </Combobox.Option>
          )}
        </Combobox.Options>
        {query && filteredResults.length === 0 && (
          <p className="p-4 text-sm">No Results Found</p>
        )}
      </Combobox>
    </Dialog>
  );
};

export default CommandPalette;
