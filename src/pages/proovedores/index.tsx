//Reacts
import React, { useState, useEffect, useMemo } from 'react'

//Next Auth
import { useSession } from 'next-auth/react'

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
import { type User, type GlassVendor } from '@prisma/client'

//Env variables
import { env } from '~/env.mjs'

//Custom Components
import TextLine from '../../components/inputFields/textlineField'
import DialogForm from '../../components/dialogForm'
import Snackbar, { type AlertProps } from '../../components/snackbarAlert'

//Custom Functions
import { isNotNullUndefinedOrEmpty } from '../../server/variableChecker'

//Custom Constants
import GRID_DEFAULT_LOCALE_TEXT from '../../constants/localeTextConstants'

interface formResponseType {
    id?: number
    name: string
}

/*eslint-disable @typescript-eslint/no-misused-promises*/
/*eslint-disable @typescript-eslint/no-floating-promises*/

const Home: NextPage = () => {
    const { data: session } = useSession()

    //States
    const [vendorSelection, setVendorSelection] = useState<GlassVendor | null>(null)
    const [snackbar, setSnackbar] = useState<AlertProps | null>(null)

    const [isVendorCreatorOpen, setIsVendorCreatorOpen] = useState<boolean>(false)

    const [vendorToDelete, setVendorToDelete] = useState<GlassVendor | null>(null)
    const [vendorToEdit, setVendorToEdit] = useState<GlassVendor | null>(null)

    const [vendorsData, setVendorsData] = useState<GlassVendor[] | null>(null)
    const [usersData, setUsersData] = useState<User[] | null>(null)

    //User admin verification
    const foundUser = usersData?.find((user: User) => user.id === session?.user?.id)
    const isAdmin = env.NEXT_PUBLIC_NODE_ENV !== 'development' ? foundUser?.role === 'ADMIN' : true

    //Functions
    //- Submit Functions
    const onVendorCreation = async (formResponse: object) => {
        try {
            const { name } = formResponse as formResponseType

            const response = await axios.post(`/api/vendors`, {
                name,
            })
            if (response.data === null) throw new Error('No se obtuvo respuesta')
            setSnackbar({ type: 'success', message: 'Proovedor cargado exitosamente' })

            fetchVendorsData()
        } catch (error) {
            console.error('Error creating type:', error)
            setSnackbar({ type: 'warning', message: 'Error al crear el proovedor' })
        }
    }

    const onVendorDelete = async (formResponse: object) => {
        try {
            const { id } = formResponse as formResponseType
            const response = await axios.delete(`/api/vendors/${Number(id)}`)
            if (response.data === null) throw new Error('No se obtuvo respuesta')
            setSnackbar({ type: 'success', message: 'Proovedor eliminado exitosamente' })

            fetchVendorsData()
        } catch (error) {
            console.error('Error deleting type:', error)
            setSnackbar({ type: 'warning', message: 'Error al eliminar el proovedor' })
        }
    }

    const onVendorEdit = async (formResponse: object) => {
        try {
            const { id, name } = formResponse as formResponseType

            const response = await axios.patch(`/api/vendors/${Number(id)}`, {
                name,
            })
            if (response.data === null) throw new Error('No se obtuvo respuesta')
            setSnackbar({ type: 'success', message: 'Proovedor editado exitosamente' })

            fetchVendorsData()
        } catch (error) {
            console.error('Error deleting glass:', error)
            setSnackbar({ type: 'warning', message: 'Error al editar el proovedor' })
        }
    }

    //- Fetch Functions

    const fetchVendorsData = async () => {
        try {
            const cachedResponse: GlassVendor[] = JSON.parse(
                localStorage.getItem('vendorsData') ?? '{}',
            ) as GlassVendor[]
            setVendorsData(cachedResponse)

            const response = await axios.get(`/api/vendors`)
            if (response.data === null) throw new Error('No hay proovedores')
            localStorage.setItem('vendorsData', JSON.stringify(response.data))
            setVendorsData(response.data as GlassVendor[])
            setSnackbar({ type: 'success', message: 'Proovedores Actualizados' })
        } catch (error) {
            console.error('Error fetching data:', error)
            setSnackbar({
                type: 'warning',
                message: 'Error al obtener los proovedores',
            })
        }
    }

    const fetchUsersData = async () => {
        try {
            const cachedResponse: User[] = JSON.parse(localStorage.getItem('usersData') ?? '{}') as User[]
            setUsersData(cachedResponse)

            const response = await axios.get(`/api/users`)
            if (response.data === null) throw new Error('No hay usuarios')
            localStorage.setItem('usersData', JSON.stringify(response.data))
            setUsersData(response.data as User[])
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    }

    //useEffect
    useEffect(() => {
        fetchVendorsData()
        fetchUsersData()
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    //DataGrid Definitions
    const rows: GlassVendor[] = useMemo(() => vendorsData as GlassVendor[], [vendorsData])

    let columns: GridColDef[] = [
        {
            headerName: 'Id',
            field: 'id',
            width: 70,
            type: 'number',
            valueFormatter: (params) => `#${(params?.value as string) ?? ''}`,
        },
        {
            headerName: 'Proovedor',
            width: 120,
            field: 'name',
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
    ]

    if (isAdmin) {
        columns = [
            ...columns,
            {
                field: 'Acciones',
                type: 'actions',
                width: 80,
                getActions: ({ row }: { row: GridValidRowModel }) => [
                    <GridActionsCellItem
                        key={1}
                        icon={<TrashIcon className="w-4" />}
                        label="Delete"
                        onClick={() => setVendorToDelete(row as GlassVendor)}
                    />,
                    <GridActionsCellItem
                        key={1}
                        icon={<PencilSquareIcon className="w-4" />}
                        label="Delete"
                        onClick={() => setVendorToEdit(row as GlassVendor)}
                    />,
                ],
            },
        ]
    }

    return (
        <>
            <Head>
                <title>Listado de Proovedores</title>
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
                    <h1 className="text-2xl font-semibold text-gray-700 sm:text-[2rem]">Listado de Proovedores</h1>
                    <div className="flex h-screen_3/4 w-auto max-w-full flex-col justify-center gap-4">
                        <div className="flex w-full items-end justify-between">
                            {isAdmin && (
                                <div className="flex w-full justify-end gap-3">
                                    <button
                                        onClick={() => {
                                            setIsVendorCreatorOpen(true)
                                        }}
                                        disabled={!vendorsData}
                                        className=" rounded-md border border-transparent bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:bg-slate-500">
                                        Crear Proovedor
                                    </button>
                                </div>
                            )}
                        </div>
                        {vendorsData && (
                            <DataGrid
                                disableDensitySelector
                                localeText={GRID_DEFAULT_LOCALE_TEXT}
                                rows={rows}
                                columns={columns}
                                slots={{ toolbar: GridToolbar }}
                                onRowSelectionModelChange={(ids) =>
                                    setVendorSelection(rows.find((row) => row.id === ids[0]) as GlassVendor)
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
                title="Crear Proovedor"
                buttonText="Crear"
                buttonStyles="bg-emerald-500 hover:bg-emerald-600"
                isOpen={isVendorCreatorOpen}
                setIsOpen={setIsVendorCreatorOpen}
                onSubmit={onVendorCreation}
                initialValues={vendorSelection}
                render={() => {
                    return (
                        <>
                            <TextLine
                                label="Proovedor"
                                name="name"
                            />
                        </>
                    )
                }}
            />

            {/*Formulario de Edición*/}
            <DialogForm
                title={
                    <>
                        Editar Proovedor
                        {isNotNullUndefinedOrEmpty(vendorToEdit) ? (
                            <span className="text-sm font-normal text-slate-500">{`   ${
                                vendorToEdit?.name ?? ''
                            }`}</span>
                        ) : (
                            ''
                        )}
                    </>
                }
                buttonText="Editar"
                isOpen={isNotNullUndefinedOrEmpty(vendorToEdit)}
                setIsOpen={(value) => {
                    value || setVendorToEdit(null)
                }}
                onSubmit={onVendorEdit}
                initialValues={vendorToEdit}
                render={() => {
                    return (
                        <>
                            <TextLine
                                label="Proovedor"
                                name="name"
                            />
                        </>
                    )
                }}
            />

            {/*Formulario de Eliminación*/}
            <DialogForm
                title={`¿Desea eliminar el proovedor  ${
                    isNotNullUndefinedOrEmpty(vendorToDelete) ? `${vendorToDelete?.name ?? ''}` : ''
                }?`}
                titleStyles="text-center"
                buttonText={`Eliminar ${
                    isNotNullUndefinedOrEmpty(vendorToDelete) ? `${vendorToDelete?.name ?? ''}` : ''
                }`}
                buttonStyles="bg-red-500 hover:bg-red-600 w-full"
                isOpen={isNotNullUndefinedOrEmpty(vendorToDelete)}
                setIsOpen={(value) => {
                    value || setVendorToDelete(null)
                }}
                onSubmit={onVendorDelete}
                initialValues={vendorToDelete}
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
/*eslint-enable @typescript-eslint/no-floating-promises*/
/*eslint-enable @typescript-eslint/no-misused-promises*/
