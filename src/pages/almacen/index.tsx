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
import {
    DataGridPremium as DataGrid,
    GridToolbar,
    GridActionsCellItem,
    type GridColDef,
    type GridValidRowModel,
} from '@mui/x-data-grid-premium'

//Axios
import axios from 'axios'

//Day JS
//import dayjs from 'dayjs'

//Prisma
import { type User, type GlassLocation } from '@prisma/client'

//Env variables
import { env } from '~/env.mjs'

//Zod
import { z } from 'zod'

//Custom Components
import Numeric from '../../components/inputFields/numericField'
import TextLine from '../../components/inputFields/textlineField'
import DialogForm from '../../components/dialogForm'
import Snackbar, { type AlertProps } from '../../components/snackbarAlert'

//Custom Functions
import { isNotNullUndefinedOrEmpty } from '../../utils/variableChecker'
import eliminateLicenseKey from '~/utils/eliminateLicenseKey'
import convertFloat from '~/utils/convertFloat'


//Custom Constants
import GRID_DEFAULT_LOCALE_TEXT from '../../constants/localeTextConstants'

interface formResponseType {
    id?: number
    position: string
    warehouse: string
    maxCapacityJumbo?: number
    maxCapacitySmall?: number
    usedCapacity?: number
}

interface SuperGlassLocation extends GlassLocation {
    usedCapacity?: number
}

/*eslint-disable @typescript-eslint/no-misused-promises*/
/*eslint-disable @typescript-eslint/no-floating-promises*/

const Home: NextPage = () => {
    const { data: session } = useSession()

    //States
    const [usersData, setUsersData] = useState<User[] | null>(null)
    const [locationSelection, setLocationSelection] = useState<SuperGlassLocation | null>(null)
    const [snackbar, setSnackbar] = useState<AlertProps | null>(null)

    const [isLocationCreatorOpen, setIsLocationCreatorOpen] = useState<boolean>(false)

    const [locationToDelete, setLocationToDelete] = useState<SuperGlassLocation | null>(null)
    const [locationToEdit, setLocationToEdit] = useState<SuperGlassLocation | null>(null)

    const [locationsData, setLocationsData] = useState<SuperGlassLocation[] | null>(null)

    //User admin verification
    const foundUser = usersData?.find((user: User) => user.id === session?.user?.id)
    const isAdmin = env.NEXT_PUBLIC_NODE_ENV !== 'development' ? foundUser?.role === 'ADMIN' : true

    //Functions
    //- Submit Functions
    const onLocationCreation = async (formResponse: object) => {
        try {
            const { position, warehouse } = formResponse as formResponseType

            const response = await axios.post(`/api/locations`, {
                position,
                warehouse,
            })
            if (response.data === null) throw new Error('No se obtuvo respuesta')
            setSnackbar({ type: 'success', message: 'Posición cargada exitosamente' })

            fetchLocationsData()
        } catch (error) {
            console.error('Error creating type:', error)
            setSnackbar({ type: 'warning', message: 'Error al crear la posición' })
        }
    }

    const onLocationDelete = async (formResponse: object) => {
        try {
            const { id } = formResponse as formResponseType
            const response = await axios.delete(`/api/locations/${Number(id)}`)
            if (response.data === null) throw new Error('No se obtuvo respuesta')
            setSnackbar({ type: 'success', message: 'Posición eliminada exitosamente' })

            fetchLocationsData()
        } catch (error) {
            console.error('Error deleting type:', error)
            setSnackbar({ type: 'warning', message: 'Error al eliminar la posición' })
        }
    }

    const onLocationEdit = async (formResponse: object) => {
        try {
            const { id, position, warehouse } = formResponse as formResponseType

            const response = await axios.patch(`/api/locations/${Number(id)}`, {
                position,
                warehouse,
            })
            if (response.data === null) throw new Error('No se obtuvo respuesta')
            setSnackbar({ type: 'success', message: 'Posición editada exitosamente' })

            fetchLocationsData()
        } catch (error) {
            console.error('Error deleting glass:', error)
            setSnackbar({ type: 'warning', message: 'Error al editar la posición' })
        }
    }

    //- Fetch Functions

    const fetchLocationsData = async () => {
        try {
            const cachedResponse: SuperGlassLocation[] = JSON.parse(
                localStorage.getItem('locationsData') ?? '{}',
            ) as SuperGlassLocation[]
            setLocationsData(cachedResponse)

            const response = await axios.get(`/api/locations`)
            if (response.data === null) throw new Error('No hay posiciones')
            localStorage.setItem('locationsData', JSON.stringify(response.data))
            setLocationsData(response.data as SuperGlassLocation[])
            setSnackbar({ type: 'success', message: 'Posiciones Actualizadas' })
        } catch (error) {
            console.error('Error fetching data:', error)
            setSnackbar({
                type: 'warning',
                message: 'Error al obtener las posiciones',
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
        fetchLocationsData()
        fetchUsersData()
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    //DataGrid Definitions
    const rows: SuperGlassLocation[] = useMemo(() => locationsData as SuperGlassLocation[], [locationsData])

    let columns: GridColDef[] = [
        {
            headerName: 'Id',
            field: 'id',
            width: 70,
            type: 'number',
            valueFormatter: (params) => (params?.value ? `#${String(params?.value)}` : undefined),
        },
        {
            headerName: 'Posición',
            width: 100,
            field: 'position',
        },

        {
            headerName: 'Almacén',
            field: 'warehouse',
            width: 120,
        },
        {
            headerName: 'Max Jumbo',
            field: 'maxCapacityJumbo',
            type: 'number',
            width: 100,
            valueFormatter: ({ value }: { value: number }) => (value ? `${convertFloat(value)} T` : undefined),

        },
        {
            headerName: 'Max Small',
            field: 'maxCapacitySmall',
            type: 'number',
            width: 100,
            valueFormatter: ({ value }: { value: number }) => (value ? `${convertFloat(value)} T` : undefined),

        },
        {
            headerName: '% Ocupación',
            field: 'usedCapacity',
            type: 'number',
            width: 120,
            valueFormatter: ({ value }: { value: number }) => (value * 100).toFixed(2),
            renderCell: (params) => {
                const capacitySchema = z.number()

               try {
                const capacity = capacitySchema.parse(params?.value)

                if (capacity === undefined) {
                    return undefined
                }
                const cssCapacity = Number(capacity > 1 ? 1 : capacity)

                return (
                    <div className="row flex items-center gap-2">
                        {`${(capacity * 100).toFixed(0)}%`}
                        <div className="relative h-4 w-4  overflow-hidden rounded-full bg-slate-200">
                            <div
                                style={{
                                    width: '40rem',
                                    height: `${(cssCapacity * 100).toFixed(0)}%`,
                                    left: `-${(39 * cssCapacity).toFixed(2)}rem`,
                                }}
                                className={`absolute bottom-0 bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500`}
                            />
                        </div>
                    </div>
                )

               }
               catch(e){
                return undefined
               }
            },
        },
        {
            headerName: 'Creado En',
            field: 'createdAt',
            width: 150,
            type: 'dateTime',
            valueGetter: ({ value }: { value: string }) => value ? new Date(value) : undefined,

        },
        {
            headerName: 'Actualizado En',
            field: 'updatedAt',
            width: 150,
            type: 'dateTime',
            valueGetter: ({ value }: { value: string }) => value ? new Date(value) : undefined,

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
                        onClick={() => setLocationToDelete(row as SuperGlassLocation)}
                    />,
                    <GridActionsCellItem
                        key={1}
                        icon={<PencilSquareIcon className="w-4" />}
                        label="Delete"
                        onClick={() => setLocationToEdit(row as SuperGlassLocation)}
                    />,
                ],
            },
        ]
    }

    return (
        <>
            <Head>
                <title>Listado de Posiciones</title>

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
                    <h1 className="text-2xl font-semibold text-gray-700 sm:text-[2rem]">Listado de Posiciones</h1>
                    <div className="flex h-screen_3/4 w-auto max-w-full flex-col justify-center gap-4 transition-all duration-500">
                        <div className="flex w-full items-end justify-between">
                            {isAdmin && (
                                <div className="flex w-full justify-end gap-3">
                                    <button
                                        onClick={() => {
                                            setIsLocationCreatorOpen(true)
                                        }}
                                        disabled={!locationsData}
                                        className=" rounded-md border border-transparent bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:bg-slate-500">
                                        Crear Posición
                                    </button>
                                </div>
                            )}
                        </div>
                        {locationsData && (
                            <DataGrid
                                disableDensitySelector
                                localeText={GRID_DEFAULT_LOCALE_TEXT}
                                rows={rows}
                                columns={columns}
                                slots={{ toolbar: GridToolbar }}
                                onRowSelectionModelChange={(ids) =>
                                    setLocationSelection(rows.find((row) => row.id === ids[0]) as SuperGlassLocation)
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
                                            maxCapacitySmall: false,
                                            maxCapacityJumbo: false,
                                        },
                                    },
                                    aggregation: {
                                        model: {
                                            usedCapacity: 'avg',
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
                title="Crear Posición"
                buttonText="Crear"
                buttonStyles="bg-emerald-500 hover:bg-emerald-600"
                isOpen={isLocationCreatorOpen}
                setIsOpen={setIsLocationCreatorOpen}
                onSubmit={onLocationCreation}
                initialValues={locationSelection}
                render={() => {
                    return (
                        <>
                            <TextLine
                                label="Posición"
                                name="position"
                            />
                            <TextLine
                                label="Almacén"
                                name="warehouse"
                            />
                            <Numeric
                                suffix="toneladas"
                                label="Capacidad Máxima de Jumbo"
                                name="maxCapacityJumbo"
                                className=" sm:col-span-3"
                            />
                            <Numeric
                                suffix="toneladas"
                                label="Capacidad Máxima de Small"
                                name="maxCapacitySmall"
                                className=" sm:col-span-3"
                            />
                        </>
                    )
                }}
            />

            {/*Formulario de Edición*/}
            <DialogForm
                title={
                    <>
                        Editar Posición
                        {isNotNullUndefinedOrEmpty(locationToEdit) ? (
                            <span className="text-sm font-normal text-slate-500">{`   ${
                                locationToEdit?.position ?? ''
                            }`}</span>
                        ) : (
                            ''
                        )}
                    </>
                }
                buttonText="Editar"
                isOpen={isNotNullUndefinedOrEmpty(locationToEdit)}
                setIsOpen={(value) => {
                    value || setLocationToEdit(null)
                }}
                onSubmit={onLocationEdit}
                initialValues={locationToEdit}
                render={() => {
                    return (
                        <>
                            <TextLine
                                label="Posición"
                                name="position"
                            />
                            <TextLine
                                label="Almacén"
                                name="warehouse"
                            />
                            <Numeric
                                suffix="toneladas"
                                label="Capacidad Máxima de Jumbo"
                                name="maxCapacityJumbo"
                                className=" sm:col-span-3"
                            />
                            <Numeric
                                suffix="toneladas"
                                label="Capacidad Máxima de Small"
                                name="maxCapacitySmall"
                                className=" sm:col-span-3"
                            />
                        </>
                    )
                }}
            />

            {/*Formulario de Eliminación*/}
            <DialogForm
                title={`¿Desea eliminar la posición ${
                    isNotNullUndefinedOrEmpty(locationToDelete) ? `${locationToDelete?.position ?? ''}` : ''
                }?`}
                titleStyles="text-center"
                buttonText={`Eliminar ${
                    isNotNullUndefinedOrEmpty(locationToDelete) ? `${locationToDelete?.position ?? ''}` : ''
                }`}
                buttonStyles="bg-red-500 hover:bg-red-600 w-full"
                isOpen={isNotNullUndefinedOrEmpty(locationToDelete)}
                setIsOpen={(value) => {
                    value || setLocationToDelete(null)
                }}
                onSubmit={onLocationDelete}
                initialValues={locationToDelete}
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
