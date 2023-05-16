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

/*Terminar de configurar estilos de títulos */

//React
import React, { Fragment, useState } from 'react'

//Next
import { type NextPage } from 'next'
import Head from 'next/head'

//Hero Icons
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline'

//Material UI
import { DataGrid, GridToolbar, GridActionsCellItem, type GridColDef, type GridValidRowModel } from '@mui/x-data-grid'

//Custom Components
import Combobox from '../components/inputFields/comboboxField'
import Numeric from '../components/inputFields/numericField'
import TextArea from '../components/inputFields/textareaField'
import TextLine from '../components/inputFields/textlineField'
import DialogForm from '../components/dialogForm'
import Snackbar, { type AlertProps } from '../components/snackbarAlert'

//Cusom Functions
import { isNotNullUndefinedOrEmpty } from '../server/variableChecker'

//Types and Interfaces
interface Glass {
    id: number
    type: {
        id: number
        name: string
        description: string
    }
    status: string
    quantity: number
    createdAt: Date
    updatedAt: Date
    location: {
        id: number
        position: string
        warehouse: string
    }
    width: number
    height: number
    vendor: {
        id: number
        name: string
    }
    lastComment: string
}

const Home: NextPage = () => {
    //States
    const [glassSelection, setGlassSelection] = useState<Glass | null>(null)
    const [snackbar, setSnackbar] = useState<AlertProps | null>(null)

    const [isGlassCreatorOpen, setIsGlassCreatorOpen] = useState<boolean>(false)
    const [isGlassMoverOpen, setIsGlassMoverOpen] = useState<boolean>(false)
    const [isGlassConsumerOpen, setIsGlassConsumerOpen] = useState<boolean>(false)

    const [glassToDelete, setGlassToDelete] = useState<Glass | null>(null)
    const [glassToEdit, setGlassToEdit] = useState<Glass | null>(null)

    //Functions
    const onGlassCreation = (values: string) => {
        console.log(values)
    }
    const onGlassMovement = (values: string) => {
        console.log(values)
    }
    const onGlassConsumption = (values: string) => {
        console.log(values)
    }

    const onGlassDelete = (values: string) => {
        console.log(values)
    }
    const onGlassEdit = (values: string) => {
        console.log(values)
    }

    //DataGrid Definitions
    const rows: Glass[] = [
        {
            id: 1,
            type: {
                id: 1,
                name: 'GL060.CL.LAMI.-',
                description: '8 mm (5/16") INCOLORO + PVB 038 ESMERILADO + INCOLORO',
            },
            status: 'TRANSIT',
            quantity: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
            location: {
                id: 1,
                position: 'A123',
                warehouse: 'A',
            },
            width: 11000,
            height: 11000,
            vendor: { id: 1, name: 'VASA' },
            lastComment: 'comentario',
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
                                className=" rounded-md border border-transparent bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600">
                                Cargar
                            </button>
                            <button
                                onClick={() => {
                                    setIsGlassMoverOpen(true)
                                }}
                                className=" rounded-md border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700">
                                Mover
                            </button>

                            <button
                                onClick={() => {
                                    setIsGlassConsumerOpen(true)
                                }}
                                className=" rounded-md border border-transparent bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600">
                                Consumir
                            </button>
                        </div>
                        <DataGrid
                            disableDensitySelector
                            rows={rows}
                            columns={columns}
                            slots={{ toolbar: GridToolbar }}
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

            {/*Snackbar de alertar, información y más*/}
            <Snackbar
                state={snackbar}
                setState={setSnackbar}
            />

            {/*Formulario de Carga tipo, descripcion, cantidad*/}
            <DialogForm
                title="Carga de Vidrios"
                buttonText="Cargar"
                buttonStyles="bg-emerald-500 hover:bg-emerald-600"
                isOpen={isGlassCreatorOpen}
                setIsOpen={setIsGlassCreatorOpen}
                onSubmit={onGlassCreation}
                initialValues={glassSelection}>
                <Combobox
                    label="Tipo"
                    name="type"
                    inputField="name"
                />
                <Combobox
                    label="Descripción"
                    name="type"
                    inputField="description"
                />
                <Numeric
                    label="Ancho"
                    name="width"
                    className=" sm:col-span-2"
                />
                <Numeric
                    label="Alto"
                    name="height"
                    className=" sm:col-span-2"
                />

                <Numeric
                    label="Cantidad"
                    name="quantity"
                    className=" sm:col-span-2"
                />

                <Combobox
                    label="Almacén"
                    name="location"
                    inputField="position"
                />
                <Combobox
                    label="Posición"
                    name="location"
                    inputField="warehouse"
                />
                <Combobox
                    label="Proovedor"
                    name="vendor"
                    inputField="name"
                />

                <TextArea
                    label="Comentarios"
                    name="comment"
                />
            </DialogForm>

            {/*Formulario de Movimiento*/}
            <DialogForm
                title={
                    <>
                        Mover Vidrio
                        {isNotNullUndefinedOrEmpty(glassSelection) ? (
                            <span className="text-sm font-normal text-slate-500">{`${` #${glassSelection?.id ?? ''} ${
                                glassSelection?.type?.name ?? ''
                            } ${glassSelection?.width ?? ''}X${glassSelection?.height ?? ''}`}`}</span>
                        ) : (
                            ''
                        )}
                    </>
                }
                buttonText="Mover"
                buttonStyles="bg-sky-600 hover:bg-sky-700"
                isOpen={isGlassMoverOpen}
                setIsOpen={setIsGlassMoverOpen}
                onSubmit={onGlassMovement}
                initialValues={glassSelection}>
                <Combobox
                    label="Tipo"
                    name="type"
                    inputField="name"
                />
                <Combobox
                    label="Descripción"
                    name="type"
                    inputField="description"
                />
                <Numeric
                    label="Ancho"
                    name="width"
                    className=" sm:col-span-2"
                />
                <Numeric
                    label="Alto"
                    name="height"
                    className=" sm:col-span-2"
                />

                <Numeric
                    label="Cantidad"
                    name="quantity"
                    className=" sm:col-span-2"
                />

                <Combobox
                    label="Almacén"
                    name="location"
                    inputField="position"
                />
                <Combobox
                    label="Posición"
                    name="location"
                    inputField="warehouse"
                />
                <Combobox
                    label="Proovedor"
                    name="vendor"
                    inputField="name"
                />

                <TextArea
                    label="Comentarios"
                    name="comment"
                />
            </DialogForm>

            {/*Formulario de Consumo*/}
            <DialogForm
                title={
                    <>
                        Consumir Vidrio
                        {isNotNullUndefinedOrEmpty(glassSelection) ? (
                            <span className="text-sm font-normal text-slate-500">{`${` #${glassSelection?.id ?? ''} ${
                                glassSelection?.type?.name ?? ''
                            } ${glassSelection?.width ?? ''}X${glassSelection?.height ?? ''}`}`}</span>
                        ) : (
                            ''
                        )}
                    </>
                }
                buttonText="Consumir"
                buttonStyles="bg-red-500 hover:bg-red-600"
                isOpen={isGlassConsumerOpen}
                setIsOpen={setIsGlassConsumerOpen}
                onSubmit={onGlassConsumption}
                initialValues={glassSelection}>
                <Combobox
                    label="Tipo"
                    name="type"
                    inputField="name"
                />
                <Combobox
                    label="Descripción"
                    name="type"
                    inputField="description"
                />
                <Numeric
                    label="Ancho"
                    name="width"
                    className=" sm:col-span-2"
                />
                <Numeric
                    label="Alto"
                    name="height"
                    className=" sm:col-span-2"
                />

                <Numeric
                    label="Cantidad"
                    name="quantity"
                    className=" sm:col-span-2"
                />

                <Combobox
                    label="Almacén"
                    name="location"
                    inputField="position"
                />
                <Combobox
                    label="Posición"
                    name="location"
                    inputField="warehouse"
                />
                <Combobox
                    label="Proovedor"
                    name="vendor"
                    inputField="name"
                />

                <TextArea
                    label="Comentarios"
                    name="comment"
                />
            </DialogForm>

            {/*Formulario de Edición*/}
            <DialogForm
                title={
                    <>
                        Editar Vidrio
                        {isNotNullUndefinedOrEmpty(glassToEdit) ? (
                            <span className="text-sm font-normal text-slate-500">{`${` #${glassToEdit?.id ?? ''} ${
                                glassToEdit?.type?.name ?? ''
                            } ${glassToEdit?.width ?? ''}X${glassToEdit?.height ?? ''}`}`}</span>
                        ) : (
                            ''
                        )}
                    </>
                }
                buttonText="Editar"
                isOpen={isNotNullUndefinedOrEmpty(glassToEdit)}
                setIsOpen={(value) => {
                    value || setGlassToEdit(null)
                }}
                onSubmit={onGlassEdit}
                initialValues={glassToEdit}>
                <Combobox
                    label="Tipo"
                    name="type"
                    inputField="name"
                />
                <Combobox
                    label="Descripción"
                    name="type"
                    inputField="description"
                />
                <Numeric
                    label="Ancho"
                    name="width"
                    className=" sm:col-span-2"
                />
                <Numeric
                    label="Alto"
                    name="height"
                    className=" sm:col-span-2"
                />

                <Numeric
                    label="Cantidad"
                    name="quantity"
                    className=" sm:col-span-2"
                />

                <Combobox
                    label="Almacén"
                    name="location"
                    inputField="position"
                />
                <Combobox
                    label="Posición"
                    name="location"
                    inputField="warehouse"
                />
                <Combobox
                    label="Proovedor"
                    name="vendor"
                    inputField="name"
                />

                <TextArea
                    label="Comentarios"
                    name="comment"
                />
            </DialogForm>

            {/*Formulario de Eliminación*/}
            <DialogForm
                title={`¿Desea eliminar el vidrio #${
                    isNotNullUndefinedOrEmpty(glassToDelete) ? `${glassToDelete?.id ?? ''}` : ''
                }?`}
                titleStyles="text-center"
                buttonText={`Eliminar #${
                    isNotNullUndefinedOrEmpty(glassToDelete)
                        ? `${glassToDelete?.id ?? ''} ${glassToDelete?.type?.name ?? ''} ${
                              glassToDelete?.width ?? ''
                          }X${glassToDelete?.height ?? ''}`
                        : 'vidrio'
                }`}
                buttonStyles="bg-red-500 hover:bg-red-600 w-full"
                isOpen={isNotNullUndefinedOrEmpty(glassToDelete)}
                setIsOpen={(value) => {
                    value || setGlassToDelete(null)
                }}
                onSubmit={onGlassDelete}
                initialValues={glassToDelete}>
                <TextLine
                    label="Id"
                    name="id"
                    className="hidden"
                />
            </DialogForm>
        </>
    )
}

export default Home
