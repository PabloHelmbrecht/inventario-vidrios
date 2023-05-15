//React
import React, { Fragment, createContext, useContext } from 'react'

//Headless UI
import { Dialog, Transition } from '@headlessui/react'

//Final Form
import { Form, type FormRenderProps } from 'react-final-form'
import createDecorator, { type Calculation } from 'final-form-calculate'

interface dialogFormProps {
    title?: string
    buttonText?: string
    initialValues?: object
    children: React.ReactNode
    isOpen: boolean
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
    //eslint-disable-next-line no-unused-vars
    onSubmit: (values: string) => void
    decorator?: Calculation[]
}

const DialogFormContext = createContext<FormRenderProps<string, object> | null>(null)

export const useDialogFormContext = () => useContext(DialogFormContext)

export default function DialogForm({
    title = 'Título del Form',
    buttonText = 'Enviar',
    children,
    isOpen,
    setIsOpen,
    onSubmit,
    decorator,
    initialValues = {},
}: dialogFormProps) {
    return (
        <Transition
            appear
            show={isOpen}
            as={Fragment}
        >
            <Dialog
                as="div"
                className="relative z-10"
                onClose={() => setIsOpen(false)}
            >
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="min-h-102 w-full max-w-md transform overflow-hidden rounded-md bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Form
                                    onSubmit={onSubmit}
                                    /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
                                    //@ts-ignore
                                    decorators={decorator ? [createDecorator(...decorator)] : null}
                                    initialValues={initialValues}
                                    render={(props) => (
                                        <DialogFormContext.Provider value={props}>
                                            <form>
                                                <Dialog.Title
                                                    as="h3"
                                                    className="text-lg font-medium leading-6 text-gray-900"
                                                >
                                                    {title}
                                                </Dialog.Title>

                                                <div className="mt-2 grid grid-cols-6 gap-4">{children}</div>

                                                <div className="mt-4">
                                                    <button
                                                        type="button"
                                                        className="rounded-md border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:bg-slate-400"
                                                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                                            if (e) {
                                                                props
                                                                    .handleSubmit(e)
                                                                    ?.then((val) => val)
                                                                    .catch((e) => {
                                                                        console.log(e)
                                                                    })

                                                                setIsOpen(false)
                                                            }
                                                        }}
                                                        disabled={props.submitting || props.hasValidationErrors}
                                                    >
                                                        {buttonText}
                                                    </button>
                                                </div>
                                            </form>
                                        </DialogFormContext.Provider>
                                    )}
                                />
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
