//React
import React, { Fragment, useState } from 'react'

//Next
import { type NextPage } from 'next'
import Head from 'next/head'

//Material UI
import { DataGrid, GridToolbar, type GridRowsProp, type GridColDef } from '@mui/x-data-grid'

//Headless UI
import { Dialog, Transition } from '@headlessui/react'

//Final Form
import { Form } from 'react-final-form'

//Custom components
import Combobox from '../components/comboboxField'
import Numeric from '../components/numericField'
import TextArea from '../components/textareaField'

const rows: GridRowsProp = [
    { id: 1, col1: 'Hello', col2: 'World' },
    { id: 2, col1: 'DataGridPro', col2: 'is Awesome' },
    { id: 3, col1: 'MUI', col2: 'is Amazing' },
]

const columns: GridColDef[] = [
    { field: 'col1', headerName: 'Column 1', width: 150 },
    { field: 'col2', headerName: 'Column 2', width: 150 },
]

const Home: NextPage = () => {
    const [isGlassCreatorOpen, setIsGlassCreatorOpen] = useState<boolean>(false)

    const onGlassCreation = (values: string) => {
        console.log(values)
    }

    return (
        <>
            <Head>
                <title>Inventario de Vidrios</title>
                <meta
                    name="description"
                    content="Gestor de inventario"
                />
                <link
                    rel="icon"
                    href="/favicon.ico"
                />
            </Head>
            <main className="flex flex-col justify-center px-4 py-16">
                <div className="container flex flex-col items-center justify-center gap-12">
                    <h1 className="text-lg font-semibold text-gray-700 sm:text-[2rem]">Inventario de Vidrios</h1>
                    <div className="flex flex-col justify-center gap-4">
                        <div className="flex w-full justify-end">
                            <button
                                onClick={() => {
                                    setIsGlassCreatorOpen(true)
                                }}
                                className=" rounded-md border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
                            >
                                Cargar Vidrio
                            </button>
                        </div>
                        <DataGrid
                            disableDensitySelector
                            rows={rows}
                            columns={columns}
                            slots={{ toolbar: GridToolbar }}
                            slotProps={{
                                toolbar: {
                                    showQuickFilter: true,
                                    quickFilterProps: { debounceMs: 500 },
                                },
                            }}
                            sx={{
                                backgroundColor: 'white',
                                p: 3,
                                borderRadius: '0.5rem',
                                '& .MuiButtonBase-root': {
                                    color: 'rgb(2 132 199)',
                                },
                            }}
                        />
                    </div>
                </div>
            </main>

            <Transition
                appear
                show={isGlassCreatorOpen}
                as={Fragment}
            >
                <Dialog
                    as="div"
                    className="relative z-10"
                    onClose={() => setIsGlassCreatorOpen(false)}
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
                                        onSubmit={onGlassCreation}
                                        initialValues={{
                                            textarea: 'prueba',
                                            numeric: 2,
                                            combobox: { id: 1, value: 'Insert options' },
                                        }}
                                        render={({ handleSubmit, submitting }) => (
                                            <form>
                                                <Dialog.Title
                                                    as="h3"
                                                    className="text-lg font-medium leading-6 text-gray-900"
                                                >
                                                    Crear un vidrio nuevo
                                                </Dialog.Title>

                                                <div className="mt-2 flex flex-col gap-4">
                                                    <Combobox />
                                                    <Numeric />
                                                    <TextArea />
                                                </div>

                                                <div className="mt-4">
                                                    <button
                                                        type="button"
                                                        className="rounded-md border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
                                                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                                            if (e) {
                                                                handleSubmit(e)
                                                                    ?.then((val) => val)
                                                                    .catch((e) => {
                                                                        console.log(e)
                                                                    })

                                                                setIsGlassCreatorOpen(false)
                                                            }
                                                        }}
                                                        disabled={submitting}
                                                    >
                                                        Crear Vidrio
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    />
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}

export default Home
