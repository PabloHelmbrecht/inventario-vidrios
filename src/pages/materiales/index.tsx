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
import { type User, type GlassType } from '@prisma/client'

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
    description: string
}

/*eslint-disable @typescript-eslint/no-misused-promises*/
/*eslint-disable @typescript-eslint/no-floating-promises*/

const Home: NextPage = () => {
    const { data: session } = useSession()

    //States
    const [typeSelection, setTypeSelection] = useState<GlassType | null>(null)
    const [snackbar, setSnackbar] = useState<AlertProps | null>(null)

    const [isTypeCreatorOpen, setIsTypeCreatorOpen] = useState<boolean>(false)

    const [typeToDelete, setTypeToDelete] = useState<GlassType | null>(null)
    const [typeToEdit, setTypeToEdit] = useState<GlassType | null>(null)

    const [typesData, setTypesData] = useState<GlassType[] | null>(null)
    const [usersData, setUsersData] = useState<User[] | null>(null)

    //User admin verification
    const foundUser = usersData?.find((user: User) => user.id === session?.user?.id)
    const isAdmin = foundUser?.role === 'ADMIN'
    

    //Functions
    //- Submit Functions
    const onTypeCreation = async (formResponse: object) => {
        try {
            const { name, description } = formResponse as formResponseType

            const response = await axios.post(`/api/type`, {
                name,
                description,
            })
            if (response.data === null) throw new Error('No se obtuvo respuesta')
            setSnackbar({ type: 'success', message: 'Material cargado exitosamente' })

            fetchTypesData()
        } catch (error) {
            console.error('Error creating type:', error)
            setSnackbar({ type: 'warning', message: 'Error al crear el material' })
        }
    }

    const onTypeDelete = async (formResponse: object) => {
        try {
            const { id } = formResponse as formResponseType
            const response = await axios.delete(`/api/type/${Number(id)}`)
            if (response.data === null) throw new Error('No se obtuvo respuesta')
            setSnackbar({ type: 'success', message: 'Material eliminado exitosamente' })

            fetchTypesData()
        } catch (error) {
            console.error('Error deleting type:', error)
            setSnackbar({ type: 'warning', message: 'Error al eliminar el material' })
        }
    }

    const onTypeEdit = async (formResponse: object) => {
        try {
            const { id, name, description } = formResponse as formResponseType

            const response = await axios.patch(`/api/type/${Number(id)}`, {
                name,
                description,
            })
            if (response.data === null) throw new Error('No se obtuvo respuesta')
            setSnackbar({ type: 'success', message: 'Material editado exitosamente' })

            fetchTypesData()
        } catch (error) {
            console.error('Error deleting glass:', error)
            setSnackbar({ type: 'warning', message: 'Error al editar el material de vidrio' })
        }
    }

    //- Fetch Functions

    const fetchTypesData = async () => {
        try {
            const cachedResponse: GlassType[] = JSON.parse(localStorage.getItem('typesData') ?? '{}') as GlassType[]
            setTypesData(cachedResponse)

            const response = await axios.get(`/api/type`)
            if (response.data === null) throw new Error('No hay materiales')
            localStorage.setItem('typesData', JSON.stringify(response.data))
            setTypesData(response.data as GlassType[])
            setSnackbar({ type: 'success', message: 'Materiales Actualizados' })
        } catch (error) {
            console.error('Error fetching data:', error)
            setSnackbar({
                type: 'warning',
                message: 'Error al obtener los materiales de vidrio',
            })
        }
    }

    const fetchUsersData = async () => {
        try {
            const cachedResponse: User[] = JSON.parse(localStorage.getItem('usersData') ?? '{}') as User[]
            setUsersData(cachedResponse)

            const response = await axios.get(`/api/user`)
            if (response.data === null) throw new Error('No hay usuarios')
            localStorage.setItem('usersData', JSON.stringify(response.data))
            setUsersData(response.data as User[])
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    }

    //useEffect
    useEffect(() => {
        fetchTypesData()
        fetchUsersData()
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    //DataGrid Definitions
    const rows: GlassType[] = useMemo(() => typesData as GlassType[], [typesData])

    let columns: GridColDef[] = [
        {
            headerName: 'Id',
            field: 'id',
            width: 70,
            type: 'number',
            valueFormatter: (params) => `#${(params?.value as string) ?? ''}`,
        },
        {
            headerName: 'Código',
            width: 160,
            field: 'name',
        },

        {
            headerName: 'Descripción',
            field: 'description',
            width: 400,
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
                        onClick={() => setTypeToDelete(row as GlassType)}
                    />,
                    <GridActionsCellItem
                        key={1}
                        icon={<PencilSquareIcon className="w-4" />}
                        label="Delete"
                        onClick={() => setTypeToEdit(row as GlassType)}
                    />,
                ],
            },
        ]
    }

    return (
        <>
            <Head>
                <title>Materiales de Vidrios</title>
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
                    <h1 className="text-2xl font-semibold text-gray-700 sm:text-[2rem]">Materiales</h1>
                    <div className="flex h-screen_3/4  w-auto max-w-full  flex-col justify-center gap-4">
                        <div className="flex w-full items-end justify-between">
                            {isAdmin && (
                                <div className="flex w-full justify-end gap-3">
                                    <button
                                        onClick={() => {
                                            setIsTypeCreatorOpen(true)
                                        }}
                                        disabled={!typesData}
                                        className=" rounded-md border border-transparent bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:bg-slate-500">
                                        Crear Material
                                    </button>
                                </div>
                            )}
                        </div>
                        {typesData && (
                            <DataGrid
                                disableDensitySelector
                                localeText={GRID_DEFAULT_LOCALE_TEXT}
                                rows={rows}
                                columns={columns}
                                slots={{ toolbar: GridToolbar }}
                                onRowSelectionModelChange={(ids) =>
                                    setTypeSelection(rows.find((row) => row.id === ids[0]) as GlassType)
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
                title="Crear Material de Vidrio"
                buttonText="Crear"
                buttonStyles="bg-emerald-500 hover:bg-emerald-600"
                isOpen={isTypeCreatorOpen}
                setIsOpen={setIsTypeCreatorOpen}
                onSubmit={onTypeCreation}
                initialValues={typeSelection}
                render={() => {
                    return (
                        <>
                            <TextLine
                                label="Código"
                                name="name"
                            />
                            <TextLine
                                label="Descripción"
                                name="description"
                            />
                        </>
                    )
                }}
            />

            {/*Formulario de Edición*/}
            <DialogForm
                title={
                    <>
                        Editar Material de Vidrio
                        {isNotNullUndefinedOrEmpty(typeToEdit) ? (
                            <span className="text-sm font-normal text-slate-500">{`   ${typeToEdit?.name ?? ''}`}</span>
                        ) : (
                            ''
                        )}
                    </>
                }
                buttonText="Editar"
                isOpen={isNotNullUndefinedOrEmpty(typeToEdit)}
                setIsOpen={(value) => {
                    value || setTypeToEdit(null)
                }}
                onSubmit={onTypeEdit}
                initialValues={typeToEdit}
                render={() => {
                    return (
                        <>
                            <TextLine
                                label="Código"
                                name="name"
                            />
                            <TextLine
                                label="Descripción"
                                name="description"
                            />
                        </>
                    )
                }}
            />

            {/*Formulario de Eliminación*/}
            <DialogForm
                title={`¿Desea eliminar el material ${
                    isNotNullUndefinedOrEmpty(typeToDelete) ? `${typeToDelete?.name ?? ''}` : ''
                }?`}
                titleStyles="text-center"
                buttonText={`Eliminar ${isNotNullUndefinedOrEmpty(typeToDelete) ? `${typeToDelete?.name ?? ''}` : ''}`}
                buttonStyles="bg-red-500 hover:bg-red-600 w-full"
                isOpen={isNotNullUndefinedOrEmpty(typeToDelete)}
                setIsOpen={(value) => {
                    value || setTypeToDelete(null)
                }}
                onSubmit={onTypeDelete}
                initialValues={typeToDelete}
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
