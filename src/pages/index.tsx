/*
- Dialog de ¿Seguro quieres eliminar el vidrio?
- Dialog para editar vidrio
- Dialog para cargar vidrio
- Dialog para mover vidrio
- Dialog para borrar vidrio
- Dialog para consumir vidrio

- Funcion de editar vidrio
- Función de mover vidrio (que al estar parado sobre un vidrio me seleccione ese por defecto)
- Función de consumir vidrio (que al estar parado sobre un vidrio me seleccione ese)
*/

//React
import React, { Fragment, useState } from 'react'

//Next
import { type NextPage } from 'next'
import Head from 'next/head'

//Hero Icons
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline'

//Material UI
import {
    DataGrid,
    GridToolbar,
    GridActionsCellItem,
    type GridColDef,
    type GridValidRowModel,
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

//Types and Interfaces
interface Glass {
    id: number
    type: {
        id: string
        name: string
        description: string
    }
    status: string
    quantity: number
    createdAt: Date
    updatedAt: Date
    location: {
        id: string
        position: string
        warehouse: string
    }
    width: number
    height: number
    vendor: {
        id: string
        name: string
    }
    lastComment: {
        id: string
        comment: string
    }
}

const Home: NextPage = () => {
    //States
    const [isGlassCreatorOpen, setIsGlassCreatorOpen] = useState<boolean>(false)

    const [snackbar, setSnackbar] = useState<AlertProps | null>(null)

    const [glassToDelete, setGlassToDelete] = useState<Glass | null>(null)
    const [glassToEdit, setGlassToEdit] = useState<Glass | null>(null)
    const [glassSelection, setGlassSelection] = useState<Glass | null>(null)

    //Functions
    const onGlassCreation = (values: string) => {
        console.log(values)
    }
    /*
    REACTIVAR
    const onDelete = (row: GridRowModel) => {
        console.log(row)
    }*/

    const onRowClick = ({ row }: { row: GridRowModel }) => {
        console.log(row)
    }

    console.log(glassToDelete)
    console.log(glassToEdit)
    console.log(glassSelection)

    //DataGrid Definitions
    const rows: Glass[] = [
        {
            id: 1,
            type: { id: '1', name: 'INC', description: 'ICNOLORO BLANCO' },
            status: 'TRANSIT',
            quantity: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
            location: {
                id: '1',
                position: 'A123',
                warehouse: 'A',
            },
            width: 1000,
            height: 1000,
            vendor: { id: '1', name: 'VASA' },
            lastComment: { id: '2', comment: 'comentario' },
        },
    ]

    const columns: GridColDef[] = [
        {
            headerName: 'Descripción',
            field: 'type',
            width: 200,
            valueFormatter: ({ value }: { value: { description: string } }) => value?.description,
            //Agregar value como tiene arriba,
        },
        {
            field: 'actions',
            type: 'actions',
            width: 80,
            getActions: ({ row }: { row: GridValidRowModel }) => [
                <GridActionsCellItem
                    key={1}
                    icon={<TrashIcon className="w-4" />}
                    label="Delete"
                    onClick={() => setGlassToDelete(row as Glass)}
                />,
                <GridActionsCellItem
                    key={1}
                    icon={<PencilSquareIcon className="w-4" />}
                    label="Delete"
                    onClick={() => setGlassToEdit(row as Glass)}
                />,
            ],
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
                                    setSnackbar({ type: 'success', message: 'mensaje' })
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
                            onRowClick={onRowClick}
                            onRowSelectionModelChange={(ids) =>
                                setGlassSelection(rows.find((row) => row.id === ids[0]) as Glass)
                            }
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
