//Reacts
import React, { useState, useEffect, useMemo } from 'react'

//Next Auth
//import { useSession } from 'next-auth/react'

//Next
import { type NextPage } from 'next'
import Head from 'next/head'

//Hero Icons
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline'

//Material UI
import { DataGrid, GridToolbar, GridActionsCellItem, type GridColDef, type GridValidRowModel } from '@mui/x-data-grid'

//Axios
import axios from 'axios'

//Prisma
import { type Glass, type GlassType, type GlassLocation, type GlassVendor } from '@prisma/client'

//Custom Components
import Combobox from '../components/inputFields/comboboxField'
import Numeric from '../components/inputFields/numericField'
import TextArea from '../components/inputFields/textareaField'
import TextLine from '../components/inputFields/textlineField'
import DialogForm from '../components/dialogForm'
// import {useDialogFormContext} from '../components/dialogForm'
import Snackbar, { type AlertProps } from '../components/snackbarAlert'

//Custom Functions
import { isNotNullUndefinedOrEmpty } from '../server/variableChecker'

//Custom Constants
import GRID_DEFAULT_LOCALE_TEXT from '../constants/localeTextConstants'

//Custom Types
interface SuperGlass extends Glass {
    type?: GlassType | null
    location?: GlassLocation | null
    vendor?: GlassVendor | null
}

const Home: NextPage = () => {
    //States
    const [glassSelection, setGlassSelection] = useState<SuperGlass | null>(null)
    const [snackbar, setSnackbar] = useState<AlertProps | null>(null)

    const [isGlassCreatorOpen, setIsGlassCreatorOpen] = useState<boolean>(false)
    const [isGlassMoverOpen, setIsGlassMoverOpen] = useState<boolean>(false)
    const [isGlassConsumerOpen, setIsGlassConsumerOpen] = useState<boolean>(false)

    const [glassToDelete, setGlassToDelete] = useState<SuperGlass | null>(null)
    const [glassToEdit, setGlassToEdit] = useState<SuperGlass | null>(null)

    const [glassData, setGlassData] = useState<SuperGlass[] | null>(null)
    const [typesData, setTypesData] = useState<GlassType[] | null>(null)
    const [locationsData, setLocationsData] = useState<GlassLocation[] | null>(null)
    const [vendorsData, setVendorsData] = useState<GlassVendor[] | null>(null)

    //Functions
    //- Submit Functions
    const onGlassCreation = (formResponse: object) => {
        console.log({ evento: 'Vidrio Creado', ...formResponse })
    }
    const onGlassMovement = (formResponse: object) => {
        console.log({ evento: 'Vidrio Movido', ...formResponse })
    }
    const onGlassConsumption = (formResponse: object) => {
        console.log({ evento: 'Vidrio Consumido', ...formResponse })
    }

    const onGlassDelete = (formResponse: object) => {
        console.log({ evento: 'Vidrio Eliminado', ...formResponse })
    }
    const onGlassEdit = (formResponse: object) => {
        console.log({ evento: 'Vidrio Editado', ...formResponse })
    }

    //- Fetch Functions
    const fetchGlassData = async () => {
        try {
            //eslint-disable-next-line @typescript-eslint/no-floating-promises
            const response = await axios.get('/api/glass')
            if (response.data === null) throw new Error('No hay vidrios')
            setGlassData(response.data as SuperGlass[])
            setSnackbar({ type: 'success', message: 'Vidrios Actualizados' })
        } catch (error) {
            console.error('Error fetching data:', error)
            setSnackbar({ type: 'warning', message: 'Error al obtener los vidrios' })
        }
    }

    const fetchTypesData = async () => {
        try {
            //eslint-disable @typescript-eslint/no-floating-promises
            const response = await axios.get('/api/types')
            if (response.data === null) throw new Error('No hay tipos')
            setTypesData(response.data as GlassType[])
            setSnackbar({ type: 'success', message: 'Tipos de Vidrio Actualizados' })
        } catch (error) {
            console.error('Error fetching data:', error)
            setSnackbar({
                type: 'warning',
                message: 'Error al obtener los tipos de vidrio',
            })
        }
    }

    const fetchLocationsData = async () => {
        try {
            //eslint-disable @typescript-eslint/no-floating-promises
            const response = await axios.get('/api/locations')
            if (response.data === null) throw new Error('No hay ubicaciones')
            setLocationsData(response.data as GlassLocation[])
            setSnackbar({ type: 'success', message: 'Ubicaciones Actualizadas' })
        } catch (error) {
            console.error('Error fetching data:', error)
            setSnackbar({
                type: 'warning',
                message: 'Error al obtener las posiciones del almacén',
            })
        }
    }

    const fetchVendorsData = async () => {
        try {
            //eslint-disable @typescript-eslint/no-floating-promises
            const response = await axios.get('/api/vendors')
            if (response.data === null) throw new Error('No hay proovedores')
            setVendorsData(response.data as GlassType[])
            setSnackbar({ type: 'success', message: 'Proovedores Actualizados' })
        } catch (error) {
            console.error('Error fetching data:', error)
            setSnackbar({
                type: 'warning',
                message: 'Error al obtener los proovedores de vidrio',
            })
        }
    }

    //useEffect
    useEffect(() => {
        /*eslint-disable @typescript-eslint/no-floating-promises*/
        fetchGlassData()
        fetchTypesData()
        fetchLocationsData()
        fetchVendorsData()
        console.log({ glassData, typesData, locationsData, vendorsData })

        /*eslint-enable @typescript-eslint/no-floating-promises*/
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    //DataGrid Definitions
    const rows: SuperGlass[] = useMemo(() => glassData as SuperGlass[], [glassData])

    const columns: GridColDef[] = [
        {
            headerName: 'Id',
            field: 'id',
            width: 40,
            type: 'number',
            valueFormatter: (params) => `#${(params?.value as string) ?? ''}`,
        },
        {
            headerName: 'Estado',
            field: 'status',
            width: 100,
            renderCell: (params) => {
                let text: string
                let ringColor: string
                let backgroundColor: string
                let textColor: string
                switch (params?.value as string) {
                    case 'TRANSIT':
                        text = 'En Tránsito'
                        ringColor = 'ring-yellow-700/10'
                        backgroundColor = 'bg-yellow-50'
                        textColor = 'text-yellow-800'
                        break
                    case 'STORED':
                        text = 'Almacenado'
                        ringColor = 'ring-emerald-700/10'
                        backgroundColor = 'bg-emerald-50'
                        textColor = 'text-emerald-800'
                        break
                    case 'CONSUMED':
                        text = 'Consumido'
                        ringColor = 'ring-red-700/10'
                        backgroundColor = 'bg-red-50'
                        textColor = 'text-red-800'
                        break
                    default:
                        text = (params?.value as string) ?? ''
                        ringColor = 'ring-slate-700/10'
                        backgroundColor = 'bg-slate-50'
                        textColor = 'text-slate-800'
                }

                return (
                    <div
                        className={` ${ringColor} ${backgroundColor} ${textColor} inline-flex items-center  rounded-md  px-2 py-1 align-middle text-xs font-medium ring-1 ring-inset`}>
                        {text}
                    </div>
                )
            },
        },
        {
            headerName: 'Código',
            width: 140,
            field: 'type.code',
            valueGetter: ({ row }: { row: Record<string, Record<string, string>> }) => row?.type?.name,
        },

        {
            headerName: 'Descripción',
            field: 'type',
            width: 200,
            valueFormatter: ({ value }: { value: { description: string } }) => value?.description,
        },
        {
            headerName: 'Ancho',
            field: 'width',
            width: 100,
            type: 'number',
            valueFormatter: ({ value }: { value: string }) => `${value} mm`,
        },
        {
            headerName: 'Alto',
            field: 'height',
            width: 100,
            type: 'number',
            valueFormatter: ({ value }: { value: string }) => `${value} mm`,
        },

        {
            headerName: 'Cantidad',
            field: 'quantity',
            width: 100,
            type: 'number',
        },
        {
            headerName: 'Almacén',
            width: 100,
            field: 'location.warehouse',
            valueGetter: ({ row }: { row: Record<string, Record<string, string>> }) => row?.location?.warehouse,
        },

        {
            headerName: 'Posición',
            field: 'location',
            width: 100,
            valueFormatter: ({ value }: { value: { position: string } }) => value?.position,
        },
        {
            headerName: 'Proovedor',
            field: 'vendor',
            width: 100,
            valueFormatter: ({ value }: { value: { name: string } }) => value?.name,
        },
        {
            headerName: 'Comentario',
            field: 'lastComment',
            width: 100,
        },
        {
            headerName: 'Creado En',
            field: 'createdAt',
            width: 150,
            type: 'dateTime',
            valueGetter: ({ value }: { value: string }) => new Date(value),
        },
        {
            headerName: 'Actualizado En',
            field: 'updatedAt',
            width: 150,
            type: 'dateTime',
            valueGetter: ({ value }: { value: string }) => new Date(value),
        },
        {
            field: 'Acciones',
            type: 'actions',
            width: 80,
            getActions: ({ row }: { row: GridValidRowModel }) => [
                <GridActionsCellItem
                    key={1}
                    icon={<TrashIcon className="w-4" />}
                    label="Delete"
                    onClick={() => setGlassToDelete(row as SuperGlass)}
                />,
                <GridActionsCellItem
                    key={1}
                    icon={<PencilSquareIcon className="w-4" />}
                    label="Delete"
                    onClick={() => setGlassToEdit(row as SuperGlass)}
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

            <main className="flex flex-col items-center justify-center px-4 py-16">
                <div className="container flex flex-col items-center justify-center gap-12">
                    <h1 className="text-lg font-semibold text-gray-700 sm:text-[2rem]">Inventario de Vidrios</h1>
                    <div className="flex w-full flex-col justify-center gap-4">
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
                        {glassData && (
                            <DataGrid
                                disableDensitySelector
                                localeText={GRID_DEFAULT_LOCALE_TEXT}
                                rows={rows}
                                columns={columns}
                                slots={{ toolbar: GridToolbar }}
                                onRowSelectionModelChange={(ids) =>
                                    setGlassSelection(rows.find((row) => row.id === ids[0]) as SuperGlass)
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
                        )}
                    </div>
                </div>
            </main>

            {/*Snackbar de alertar, información y más*/}
            <Snackbar
                state={snackbar}
                setState={setSnackbar}
            />

            {/*Formulario de Carga en almacen traer solo almacen de esa posicion*/}
            <DialogForm
                title="Carga de Vidrios"
                buttonText="Cargar"
                buttonStyles="bg-emerald-500 hover:bg-emerald-600"
                isOpen={isGlassCreatorOpen}
                setIsOpen={setIsGlassCreatorOpen}
                onSubmit={onGlassCreation}
                initialValues={glassSelection}
                render={(props) => {
                    console.log(props?.values)

                    return (
                        <>
                            <Combobox
                                label="Tipo"
                                name="type"
                                inputField="name"
                                //options={typesData as GlassType[]}
                            />
                            <Combobox
                                label="Descripción"
                                name="type"
                                inputField="description"
                                //options={typesData as GlassType[]}
                            />
                            <Numeric
                                label="Ancho"
                                name="width"
                                className=" sm:col-span-3"
                            />
                            <Numeric
                                label="Alto"
                                name="height"
                                className=" sm:col-span-3"
                            />

                            <Numeric
                                label="Cantidad"
                                name="quantity"
                                className=" sm:col-span-3"
                            />
                            <Combobox
                                label="Proovedor"
                                name="vendor"
                                inputField="name"
                                className=" sm:col-span-3"
                                //options={vendorsData as GlassVendor[]}
                            />

                            <Combobox
                                label="Posición"
                                name="location"
                                inputField="warehouse"
                                className=" sm:col-span-3"
                                //options={locationsData as GlassLocation[]}
                            />

                            <TextArea
                                label="Comentarios"
                                name="comment"
                            />
                        </>
                    )
                }}
            />

            {/*Formulario de Movimiento  tipo, descripcion, ,ancho, alto, posicion, almacen cantidad a mover almacen destino posicion destino (limite cantidad actual)*/}
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
                initialValues={glassSelection}
                render={() => {
                    return (
                        <>
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
                            <Combobox
                                label="Ancho"
                                name="width"
                                inputField="width"
                                className=" sm:col-span-3"
                            />
                            <Combobox
                                label="Alto"
                                name="height"
                                inputField="height"
                                className=" sm:col-span-3"
                            />

                            <Combobox
                                label="Posición Origen"
                                name="location"
                                inputField="warehouse"
                                className=" sm:col-span-3"
                            />

                            <Combobox
                                label="Posición Destino"
                                name="destinyLocation"
                                inputField="warehouse"
                                className=" sm:col-span-3"
                            />
                            <Numeric
                                label="Cantidad a Mover"
                                name="difQuantity"
                                className=""
                            />

                            <TextArea
                                label="Comentarios"
                                name="comment"
                            />
                        </>
                    )
                }}
            />

            {/*Formulario de Consumo como*/}
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
                initialValues={glassSelection}
                render={() => {
                    return (
                        <>
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
                            <Combobox
                                label="Ancho"
                                name="width"
                                inputField="width"
                                className=" sm:col-span-3"
                            />
                            <Combobox
                                label="Alto"
                                name="height"
                                inputField="height"
                                className=" sm:col-span-3"
                            />

                            <Combobox
                                label="Posición"
                                name="location"
                                inputField="warehouse"
                                className=" sm:col-span-3"
                            />

                            <Numeric
                                label="Cantidad a Consumir"
                                name="difQuantity"
                                className=""
                            />

                            <TextArea
                                label="Comentarios"
                                name="comment"
                            />
                        </>
                    )
                }}
            />

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
                initialValues={glassToEdit}
                render={() => {
                    return (
                        <>
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
                                className=" sm:col-span-3"
                            />
                            <Numeric
                                label="Alto"
                                name="height"
                                className=" sm:col-span-3"
                            />

                            <Numeric
                                label="Cantidad"
                                disabled={true}
                                name="quantity"
                                className=" sm:col-span-3"
                            />
                            <Combobox
                                label="Proovedor"
                                name="vendor"
                                inputField="name"
                                className=" sm:col-span-3"
                            />
                            <Combobox
                                label="Posición"
                                name="location"
                                inputField="warehouse"
                                className=" sm:col-span-3"
                            />

                            <TextArea
                                label="Comentarios"
                                name="comment"
                            />
                        </>
                    )
                }}
            />

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
                initialValues={glassToDelete}
                render={() => {
                    return (
                        <>
                            <TextLine
                                label="Id"
                                name="id"
                                className="hidden"
                            />
                        </>
                    )
                }}
            />
        </>
    )
}

export default Home
