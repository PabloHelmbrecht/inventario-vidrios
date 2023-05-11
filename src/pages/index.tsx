//React
import React, { Fragment, useState } from 'react'

//Next
import { type NextPage } from 'next'
import Head from 'next/head'

//Hero Icons
import { TrashIcon } from '@heroicons/react/24/outline'

//Material UI
import {
    DataGrid,
    GridToolbar,
    type GridRowsProp,
    type GridColDef,
    type GridRenderCellParams,
    type GridRowModel,
} from '@mui/x-data-grid'

//Final Form
import { type Calculation } from 'final-form-calculate'

//Custom components
import Combobox, { type Option } from '../components/inputFields/comboboxField'
import Numeric from '../components/inputFields/numericField'
import TextArea from '../components/inputFields/textareaField'
import TextLine from '../components/inputFields/textlineField'
import DialogForm from '../components/dialogForm'
import Snackbar, { type AlertProps } from '../components/snackbarAlert'

//Functions
const onGlassCreation = (values: string) => {
    console.log(values)
}
const onDelete = (row: GridRowModel) => {
    console.log(row)
}

const onProcessRowUpdate = (newRow: GridRowModel, oldRow: GridRowModel) => {
    console.log(newRow)
    console.log(oldRow)

    return new Promise((resolve, reject) => {
        if (newRow.col1 === 'error') {
            reject(new Error('error'))
        } else {
            resolve(newRow)
        }
    })
}

const handleProcessRowError = (e: Error) => {
    console.log(e)
}

//DataGrid Definitions
const rows: GridRowsProp = [
    { id: 1, col1: 'Hello', col2: 'World' },
    { id: 2, col1: 'DataGridPro', col2: 'is Awesome' },
    { id: 3, col1: 'MUI', col2: 'is Amazi dfrger rgdtr g grgegrtgtrgr ng' },
]

const columns: GridColDef[] = [
    { field: 'col1', headerName: 'Columna Pablo2', editable: true },
    { field: 'col2', headerName: 'Column 2' },
    {
        field: 'action',
        headerName: 'Acción',
        filterable: false,
        hideable: false,
        sortable: false,
        disableColumnMenu: true,
        disableExport: true,
        width: 70,
        renderCell: ({ row }: GridRenderCellParams<GridRowModel>) => {
            return (
                <div className="flex w-full justify-center">
                    <button
                        className="flex items-center justify-center rounded-md border border-gray-300 bg-gray-100 px-1 py-1 text-gray-500 transition-colors duration-300 hover:border-red-200 hover:bg-red-200 hover:text-red-600"
                        onClick={() => onDelete(row)}
                    >
                        <TrashIcon className="w-4" />
                    </button>
                </div>
            )
        },
    },
]

//Form Decorations
const decorator: Calculation[] = [
    {
        field: 'type',
        updates: {
            description: (typeValue: Option) => typeValue,
        },
    },
    {
        field: 'description',
        updates: {
            type: (descriptionValue: Option) => descriptionValue,
        },
    },
]

const Home: NextPage = () => {
    const [isGlassCreatorOpen, setIsGlassCreatorOpen] = useState<boolean>(false)

    const [snackbar, setSnackbar] = useState<AlertProps | null>(null)

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
                        <div className="flex w-full justify-end gap-3">
                            <button
                                onClick={() => {
                                    setIsGlassCreatorOpen(true)
                                }}
                                className=" rounded-md border border-transparent bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                            >
                                Cargar
                            </button>
                            <button
                                onClick={() => {
                                    setIsGlassCreatorOpen(true)
                                }}
                                className=" rounded-md border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
                            >
                                Mover
                            </button>

                            <button
                                onClick={() => {
                                    setIsGlassCreatorOpen(true)
                                }}
                                className=" rounded-md border border-transparent bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                            >
                                Consumir
                            </button>
                        </div>
                        <DataGrid
                            disableDensitySelector
                            rows={rows}
                            columns={columns}
                            slots={{ toolbar: GridToolbar }}
                            processRowUpdate={onProcessRowUpdate}
                            onProcessRowUpdateError={handleProcessRowError}
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
            <Snackbar
                state={snackbar}
                setState={setSnackbar}
            />

            <DialogForm
                title="Prueba"
                isOpen={isGlassCreatorOpen}
                setIsOpen={setIsGlassCreatorOpen}
                onSubmit={onGlassCreation}
                decorator={decorator}
            >
                <Combobox
                    label="Tipo"
                    name="type"
                />
                <Combobox
                    label="Descripción"
                    name="description"
                />
                <Numeric />
                <TextLine />
                <TextArea />
            </DialogForm>
        </>
    )
}

export default Home
