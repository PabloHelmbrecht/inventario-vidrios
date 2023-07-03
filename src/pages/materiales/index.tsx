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
import { DataGridPremium as DataGrid, GridToolbar, GridActionsCellItem, type GridColDef, type GridValidRowModel } from '@mui/x-data-grid-premium'

//Axios
import axios from 'axios'

//Day JS
import dayjs from 'dayjs'

//Prisma
import { type User, type GlassMaterial } from '@prisma/client'

//Env variables
import { env } from '~/env.mjs'

//Custom Components
import TextLine from '../../components/inputFields/textlineField'
import Numeric from '../../components/inputFields/numericField'
import DialogForm from '../../components/dialogForm'
import Snackbar, { type AlertProps } from '../../components/snackbarAlert'

//Custom Functions
import { isNotNullUndefinedOrEmpty } from '../../utils/variableChecker'
import eliminateLicenseKey from '~/utils/eliminateLicenseKey'


//Custom Constants
import GRID_DEFAULT_LOCALE_TEXT from '../../constants/localeTextConstants'

interface formResponseType {
    id?: number
    name: string
    description: string
    density?: number
}

/*eslint-disable @typescript-eslint/no-misused-promises*/
/*eslint-disable @typescript-eslint/no-floating-promises*/

const Home: NextPage = () => {
    const { data: session } = useSession()

    //States
    const [materialSelection, setMaterialSelection] = useState<GlassMaterial | null>(null)
    const [snackbar, setSnackbar] = useState<AlertProps | null>(null)

    const [isMaterialCreatorOpen, setIsMaterialCreatorOpen] = useState<boolean>(false)

    const [materialToDelete, setMaterialToDelete] = useState<GlassMaterial | null>(null)
    const [materialToEdit, setMaterialToEdit] = useState<GlassMaterial | null>(null)

    const [materialsData, setMaterialsData] = useState<GlassMaterial[] | null>(null)
    const [usersData, setUsersData] = useState<User[] | null>(null)

    //User admin verification
    const foundUser = usersData?.find((user: User) => user.id === session?.user?.id)
    const isAdmin = env.NEXT_PUBLIC_NODE_ENV !== 'development' ? foundUser?.role === 'ADMIN' : true

    //Functions
    //- Submit Functions
    const onMaterialCreation = async (formResponse: object) => {
        try {
            const { name, description, density } = formResponse as formResponseType

            const response = await axios.post(`/api/materials`, {
                name,
                description,
                density: Number(density)
            })
            if (response.data === null) throw new Error('No se obtuvo respuesta')
            setSnackbar({ type: 'success', message: 'Material cargado exitosamente' })

            fetchMaterialsData()
        } catch (error) {
            console.error('Error creating material:', error)
            setSnackbar({ type: 'warning', message: 'Error al crear el material' })
        }
    }

    const onMaterialDelete = async (formResponse: object) => {
        try {
            const { id } = formResponse as formResponseType
            const response = await axios.delete(`/api/materials/${Number(id)}`)
            if (response.data === null) throw new Error('No se obtuvo respuesta')
            setSnackbar({ type: 'success', message: 'Material eliminado exitosamente' })

            fetchMaterialsData()
        } catch (error) {
            console.error('Error deleting material:', error)
            setSnackbar({ type: 'warning', message: 'Error al eliminar el material' })
        }
    }

    const onMaterialEdit = async (formResponse: object) => {
        try {
            const { id, name, description, density } = formResponse as formResponseType

            const response = await axios.patch(`/api/materials/${Number(id)}`, {
                name,
                description,
                density: Number(density)
            })
            if (response.data === null) throw new Error('No se obtuvo respuesta')
            setSnackbar({ type: 'success', message: 'Material editado exitosamente' })

            fetchMaterialsData()
        } catch (error) {
            console.error('Error deleting material:', error)
            setSnackbar({ type: 'warning', message: 'Error al editar el material de vidrio' })
        }
    }

    //- Fetch Functions

    const fetchMaterialsData = async () => {
        try {
            const cachedResponse: GlassMaterial[] = JSON.parse(localStorage.getItem('materialsData') ?? '{}') as GlassMaterial[]
            setMaterialsData(cachedResponse)

            const response = await axios.get(`/api/materials`)
            if (response.data === null) throw new Error('No hay materiales')
            localStorage.setItem('materialsData', JSON.stringify(response.data))
            setMaterialsData(response.data as GlassMaterial[])
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
        eliminateLicenseKey()
        fetchMaterialsData()
        fetchUsersData()
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    //DataGrid Definitions
    const rows: GlassMaterial[] = useMemo(() => materialsData as GlassMaterial[], [materialsData])

    let columns: GridColDef[] = [
        {
            headerName: 'Id',
            field: 'id',
            width: 70,
            type: 'number',
            valueFormatter: (params) => (params?.value ? `#${String(params?.value)}` : undefined),
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
            headerName: 'Densidad',
            field: 'density',
            type: 'number',
            width: 100,
            valueFormatter: ({ value }: { value: string }) => (value ? `${value} kg/m²` : undefined),
        },
        {
            headerName: 'Creado En',
            field: 'createdAt',
            width: 150,
            type: 'dateTime',
            valueFormatter: ({ value }: { value: string }) => (value ? dayjs(value).format('D/M/YYYY, HH:mm') : undefined),
        },
        {
            headerName: 'Actualizado En',
            field: 'updatedAt',
            width: 150,
            type: 'dateTime',
            valueFormatter: ({ value }: { value: string }) => (value ? dayjs(value).format('D/M/YYYY, HH:mm') : undefined),
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
                        onClick={() => setMaterialToDelete(row as GlassMaterial)}
                    />,
                    <GridActionsCellItem
                        key={1}
                        icon={<PencilSquareIcon className="w-4" />}
                        label="Delete"
                        onClick={() => setMaterialToEdit(row as GlassMaterial)}
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
                                            setIsMaterialCreatorOpen(true)
                                        }}
                                        disabled={!materialsData}
                                        className=" rounded-md border border-transparent bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:bg-slate-500">
                                        Crear Material
                                    </button>
                                </div>
                            )}
                        </div>
                        {materialsData && (
                            <DataGrid
                                disableDensitySelector
                                localeText={GRID_DEFAULT_LOCALE_TEXT}
                                rows={rows}
                                columns={columns}
                                slots={{ toolbar: GridToolbar }}
                                onRowSelectionModelChange={(ids) =>
                                    setMaterialSelection(rows.find((row) => row.id === ids[0]) as GlassMaterial)
                                }
                                slotProps={{
                                    toolbar: {
                                        showQuickFilter: true,
                                        quickFilterProps: { debounceMs: 500 },
                                    },
                                }}
                                groupingColDef={{
                                    headerName: 'Grupo',
                                }}
                                initialState={{
                                    columns: {
                                        columnVisibilityModel: {
                                            
                                        },
                                    },
                                    aggregation: {
                                        model: {
                                            
                                        },
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
                isOpen={isMaterialCreatorOpen}
                setIsOpen={setIsMaterialCreatorOpen}
                onSubmit={onMaterialCreation}
                initialValues={materialSelection}
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
                            <Numeric
                                suffix='kg/m²'
                                label="Densidad"
                                name="density"
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
                        {isNotNullUndefinedOrEmpty(materialToEdit) ? (
                            <span className="text-sm font-normal text-slate-500">{`   ${materialToEdit?.name ?? ''}`}</span>
                        ) : (
                            ''
                        )}
                    </>
                }
                buttonText="Editar"
                isOpen={isNotNullUndefinedOrEmpty(materialToEdit)}
                setIsOpen={(value) => {
                    value || setMaterialToEdit(null)
                }}
                onSubmit={onMaterialEdit}
                initialValues={materialToEdit}
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
                            <Numeric
                                suffix='kg/m²'
                                label="Densidad"
                                name="density"
                            />
                        </>
                    )
                }}
            />

            {/*Formulario de Eliminación*/}
            <DialogForm
                title={`¿Desea eliminar el material ${isNotNullUndefinedOrEmpty(materialToDelete) ? `${materialToDelete?.name ?? ''}` : ''
                    }?`}
                titleStyles="text-center"
                buttonText={`Eliminar ${isNotNullUndefinedOrEmpty(materialToDelete) ? `${materialToDelete?.name ?? ''}` : ''}`}
                buttonStyles="bg-red-500 hover:bg-red-600 w-full"
                isOpen={isNotNullUndefinedOrEmpty(materialToDelete)}
                setIsOpen={(value) => {
                    value || setMaterialToDelete(null)
                }}
                onSubmit={onMaterialDelete}
                initialValues={materialToDelete}
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
