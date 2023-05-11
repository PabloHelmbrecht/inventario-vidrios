//Agregar el paráemtro de que se pueda selecionar que camp se quiere usar y eliminar el type option

//React
import React, { Fragment, useState } from 'react'

//Headless UI
import { Combobox, Transition } from '@headlessui/react'

//Hero Icons
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'

export type Option = {
    id: string
    [inputField: string]: string
}


export default function ComboboxField({
    name = 'combobox',
    options = [
        { id: '1', name: 'glasstype1', description: 'Glass Type 1' },
        { id: '2', name: 'glasstype2', description: 'Glass Type 2' },
    ],
    defaultValue = { id: '1', name: 'glasstype1', description: 'Glass Type 1' },
    inputField = 'description',
    className = '',
}: {
    name?: string
    options?: Option[]
    defaultValue?: Option
    inputField?: string
    className?: string
}) {
    const [query, setQuery] = useState<string>('')
    const filteredOptions: Option[] =
        query === ''
            ? options
            : options.filter((option) =>
                  option[inputField]
                      ?.toLowerCase()
                      .replace(/\s+/g, '')
                      .includes(query.toLowerCase().replace(/\s+/g, '')),
              )

    return (
        <div className={className}>
            <Combobox
                name={name}
                /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
                value={defaultValue}
                //onChange={onChange}
            >
                <div className="relative z-30 overflow-visible">
                    <div className="relative w-full cursor-default  overflow-hidden rounded-lg bg-white text-left  sm:text-sm">
                        <Combobox.Input
                            className="m-px w-fit rounded-md border-0 py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 focus-visible:outline-0 sm:text-sm sm:leading-6 "
                            displayValue={(option: Option) => option[inputField] as string}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
                        />

                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                            />
                        </Combobox.Button>
                    </div>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                        afterLeave={() => setQuery('')}
                    >
                        <Combobox.Options className="absolute z-40 mt-1 max-h-64 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {filteredOptions.length === 0 && query !== '' ? (
                                <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                                    Nothing found.
                                </div>
                            ) : (
                                filteredOptions.map((option) => (
                                    <Combobox.Option
                                        key={option.id}
                                        className={({ active }: { active: boolean }) =>
                                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                active ? 'bg-sky-600 text-white' : 'text-gray-900'
                                            }`
                                        }
                                        value={option}
                                    >
                                        {({ selected, active }) => (
                                            <>
                                                <span
                                                    className={`block truncate ${
                                                        selected ? 'font-medium' : 'font-normal'
                                                    }`}
                                                >
                                                    {option[inputField]}
                                                </span>
                                                {selected ? (
                                                    <span
                                                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                            active ? 'text-white' : 'text-sky-600'
                                                        }`}
                                                    >
                                                        <CheckIcon
                                                            className="h-5 w-5"
                                                            aria-hidden="true"
                                                        />
                                                    </span>
                                                ) : null}
                                            </>
                                        )}
                                    </Combobox.Option>
                                ))
                            )}
                        </Combobox.Options>
                    </Transition>
                </div>
            </Combobox>
        </div>
    )
}
