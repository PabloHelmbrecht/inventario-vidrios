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
import { type GlassLocation } from '@prisma/client'

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
    position: string
    warehouse: string
}

/*eslint-disable @typescript-eslint/no-misused-promises*/
/*eslint-disable @typescript-eslint/no-floating-promises*/

const Home: NextPage = () => {
    const { data: session } = useSession()
    const isAdmin = session?.user?.role === 'ADMIN'

    //States
    const [locationSelection, setLocationSelection] = useState<GlassLocation | null>(null)
    const [snackbar, setSnackbar] = useState<AlertProps | null>(null)

    const [isLocationCreatorOpen, setIsLocationCreatorOpen] = useState<boolean>(false)

    const [locationToDelete, setLocationToDelete] = useState<GlassLocation | null>(null)
    const [locationToEdit, setLocationToEdit] = useState<GlassLocation | null>(null)

    const [locationsData, setLocationsData] = useState<GlassLocation[] | null>(null)

    //Functions
    //- Submit Functions
    const onLocationCreation = async (formResponse: object) => {
        try {
            const { position, warehouse } = formResponse as formResponseType

            const response = await axios.post(`/api/location`, {
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
            const response = await axios.delete(`/api/location/${Number(id)}`)
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

            const response = await axios.patch(`/api/location/${Number(id)}`, {
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
            const cachedResponse: GlassLocation[] = JSON.parse(
                localStorage.getItem('locationsData') ?? '{}',
            ) as GlassLocation[]
            setLocationsData(cachedResponse)

            const response = await axios.get(`/api/location`)
            if (response.data === null) throw new Error('No hay posiciones')
            localStorage.setItem('locationsData', JSON.stringify(response.data))
            setLocationsData(response.data as GlassLocation[])
            setSnackbar({ type: 'success', message: 'Posiciones Actualizadas' })
        } catch (error) {
            console.error('Error fetching data:', error)
            setSnackbar({
                type: 'warning',
                message: 'Error al obtener las posiciones',
            })
        }
    }

    //useEffect
    useEffect(() => {
        fetchLocationsData()
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    //DataGrid Definitions
    const rows: GlassLocation[] = useMemo(() => locationsData as GlassLocation[], [locationsData])

    let columns: GridColDef[] = [
        {
            headerName: 'Id',
            field: 'id',
            width: 70,
            type: 'number',
            valueFormatter: (params) => `#${(params?.value as string) ?? ''}`,
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
                        onClick={() => setLocationToDelete(row as GlassLocation)}
                    />,
                    <GridActionsCellItem
                        key={1}
                        icon={<PencilSquareIcon className="w-4" />}
                        label="Delete"
                        onClick={() => setLocationToEdit(row as GlassLocation)}
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
                    <div className="flex h-screen_3/4 w-auto max-w-full flex-col justify-center gap-4">
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
                                    setLocationSelection(rows.find((row) => row.id === ids[0]) as GlassLocation)
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
