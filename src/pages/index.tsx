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
import { type Calculation } from 'final-form-calculate'

//Custom Types
interface SuperGlass extends Glass {
    type?: GlassType | null
    location?: GlassLocation | null
    vendor?: GlassVendor | null
}

interface formResponseType {
    id?: number
    type: { id: number }
    location?: { id: number }
    vendor: { id: number }
    width: number
    height: number
    quantity: number
    newComment?: string
    difQuantity?: string | number
}

/*eslint-disable @typescript-eslint/no-misused-promises*/
/*eslint-disable @typescript-eslint/no-floating-promises*/

const Home: NextPage = () => {
    //States
    const [glassSelection, setGlassSelection] = useState<SuperGlass | null>(null)
    const [glassFiltered, setGlassFiltered] = useState<SuperGlass | null>(null)
    const [allowQuantityChange, setAllowQuantityChange] = useState<boolean>(false)
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
    const onGlassCreation = async (formResponse: object) => {
        try {
            const { type, width, height, vendor, location, quantity, newComment } = formResponse as formResponseType

            const response = await axios.post('/api/glass', {
                typeId: type.id,
                width,
                height,
                vendorId: vendor.id,
                locationId: location?.id !== null ? location?.id : undefined,
                quantity,
                Comment: newComment,
            })
            if (response.data === null) throw new Error('No se obtuvo respuesta')
            setSnackbar({ type: 'success', message: 'Vidrio cargado exitosamente' })

            fetchGlassData()
        } catch (error) {
            console.error('Error creating glass:', error)
            setSnackbar({ type: 'warning', message: 'Error al crear el vidrio' })
        }
    }

    const onGlassMovement = (formResponse: object) => {
        console.log({ evento: 'Vidrio Movido', ...formResponse })
    }
    const onGlassConsumption = async (formResponse: object) => {
        try {
            const { id, quantity, difQuantity, newComment } = formResponse as formResponseType

            const newQuantity = Number(quantity) - Number(difQuantity)

            if (newQuantity < 0) {
                setSnackbar({ type: 'warning', message: 'No se puede consumir más vidrio del existente' })

                return
            }

            const response = await axios.patch(
                '/api/glass',
                {
                    quantity: newQuantity,
                    Comment: newComment,
                },
                {
                    params: {
                        id,
                    },
                },
            )

            if (response.data === null) throw new Error('No se obtuvo respuesta')
            setSnackbar({ type: 'success', message: 'Vidrio consumido exitosamente' })

            fetchGlassData()
        } catch (error) {
            console.error('Error deleting glass:', error)
            setSnackbar({ type: 'warning', message: 'Error al consumir el vidrio' })
        }
    }

    const onGlassDelete = async (formResponse: object) => {
        try {
            const { id } = formResponse as formResponseType
            const response = await axios.delete('/api/glass', {
                params: {
                    id,
                },
            })
            if (response.data === null) throw new Error('No se obtuvo respuesta')
            setSnackbar({ type: 'success', message: 'Vidrio eliminado exitosamente' })

            fetchGlassData()
        } catch (error) {
            console.error('Error deleting glass:', error)
            setSnackbar({ type: 'warning', message: 'Error al eliminar el vidrio' })
        }
    }

    const onGlassEdit = async (formResponse: object) => {
        try {
            const { id } = formResponse as formResponseType

            const { type, width, height, vendor, location, newComment, quantity } = formResponse as formResponseType

            const response = await axios.patch(
                '/api/glass',
                {
                    typeId: type.id,
                    width,
                    height,
                    quantity,
                    vendorId: vendor.id,
                    locationId: location?.id !== null ? location?.id : undefined,
                    Comment: newComment,
                },
                {
                    params: {
                        id,
                    },
                },
            )
            if (response.data === null) throw new Error('No se obtuvo respuesta')
            setSnackbar({ type: 'success', message: 'Vidrio editado exitosamente' })

            fetchGlassData()
        } catch (error) {
            console.error('Error deleting glass:', error)
            setSnackbar({ type: 'warning', message: 'Error al editar el vidrio' })
        }
    }

    //- Fetch Functions
    const fetchGlassData = async () => {
        try {
            const cachedResponse: SuperGlass[] = JSON.parse(localStorage.getItem('glassData') ?? '{}') as SuperGlass[]
            setGlassData(cachedResponse)
            const response = await axios.get('/api/glass')
            if (response.data === null) throw new Error('No hay vidrios')
            localStorage.setItem('glassData', JSON.stringify(response.data))
            setGlassData(response.data as SuperGlass[])
            setSnackbar({ type: 'success', message: 'Vidrios Actualizados' })
        } catch (error) {
            console.error('Error fetching data:', error)
            setSnackbar({ type: 'warning', message: 'Error al obtener los vidrios' })
        }
    }

    const fetchTypesData = async () => {
        try {
            const cachedResponse: GlassType[] = JSON.parse(localStorage.getItem('typesData') ?? '{}') as GlassType[]
            setTypesData(cachedResponse)

            const response = await axios.get('/api/types')
            if (response.data === null) throw new Error('No hay tipos')
            localStorage.setItem('typesData', JSON.stringify(response.data))
            setTypesData(response.data as GlassType[])
            //setSnackbar({ type: 'success', message: 'Tipos de Vidrio Actualizados' })
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
            const cachedResponse: GlassLocation[] = JSON.parse(
                localStorage.getItem('locationsData') ?? '{}',
            ) as GlassLocation[]
            setLocationsData(cachedResponse)

            const response = await axios.get('/api/locations')
            if (response.data === null) throw new Error('No hay ubicaciones')
            localStorage.setItem('locationsData', JSON.stringify(response.data))
            setLocationsData(response.data as GlassLocation[])
            //setSnackbar({ type: 'success', message: 'Ubicaciones Actualizadas' })
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
            const cachedResponse: GlassVendor[] = JSON.parse(
                localStorage.getItem('vendorsData') ?? '{}',
            ) as GlassVendor[]
            setVendorsData(cachedResponse)

            const response = await axios.get('/api/vendors')
            if (response.data === null) throw new Error('No hay proovedores')
            localStorage.setItem('vendorsData', JSON.stringify(response.data))
            setVendorsData(response.data as GlassType[])
            //setSnackbar({ type: 'success', message: 'Proovedores Actualizados' })
        } catch (error) {
            console.error('Error fetching data:', error)
            setSnackbar({
                type: 'warning',
                message: 'Error al obtener los proovedores de vidrio',
            })
        }
    }

    //- useMemos to Filter Form Options

    const filteredTypesData = (filteredGlass: SuperGlass) =>
        glassData
            ?.filter((glass) => {
                const { location, width, height } = glass

                return filteredGlass?.location?.position
                    ? filteredGlass?.location?.position === location?.position
                    : true && filteredGlass?.width
                    ? filteredGlass?.width === width
                    : true && filteredGlass?.height
                    ? filteredGlass?.height === height
                    : true
            })
            .map((glass) => glass.type)

    const filteredLocationsData = (filteredGlass: SuperGlass) =>
        glassData
            ?.filter((glass) => {
                const { type, width, height } = glass

                return filteredGlass?.type?.name
                    ? filteredGlass?.type?.name === type?.name
                    : true && filteredGlass?.width
                    ? filteredGlass?.width === width
                    : true && filteredGlass?.height
                    ? filteredGlass?.height === height
                    : true
            })
            .map((glass) => glass.location)

    const filteredWidthData = (filteredGlass: SuperGlass) =>
        glassData
            ?.filter((glass) => {
                const { type, location, height } = glass

                return filteredGlass?.type?.name
                    ? filteredGlass?.type?.name === type?.name
                    : true && filteredGlass?.location?.position
                    ? filteredGlass?.location?.position === location?.position
                    : true && filteredGlass?.height
                    ? filteredGlass?.height === height
                    : true
            })
            .map((glass) => glass.width)

    const filteredHeightData = (filteredGlass: SuperGlass) =>
        glassData
            ?.filter((glass) => {
                const { type, location, width } = glass

                return filteredGlass?.type?.name
                    ? filteredGlass?.type?.name === type?.name
                    : true && filteredGlass?.location?.position
                    ? filteredGlass?.location?.position === location?.position
                    : true && filteredGlass?.width
                    ? filteredGlass?.width === width
                    : true
            })
            .map((glass) => glass.height)

    const filterGlassData = (filteredGlass: SuperGlass & { difQuantity: string }) => {
        const foundGlass: SuperGlass[] | undefined = glassData?.filter((glass) => {
            const { type, location, width, height } = glass

            return filteredGlass?.type?.name
                ? filteredGlass?.type?.name === type?.name
                : true && filteredGlass?.location?.position
                ? filteredGlass?.location?.position === location?.position
                : true && filteredGlass?.width
                ? filteredGlass?.width === width
                : true && filteredGlass?.height
                ? filteredGlass?.height === height
                : true
        })

        if (foundGlass?.length === 1 && foundGlass) {
            setGlassFiltered(foundGlass[0] as SuperGlass)
        } else {
            setGlassFiltered(null)
        }

        if (glassFiltered && foundGlass && Number(filteredGlass?.difQuantity) <= Number(foundGlass[0]?.quantity)) {
            setAllowQuantityChange(true)
        } else {
            setAllowQuantityChange(false)
        }
    }

    //useEffect
    useEffect(() => {
        fetchGlassData()
        fetchTypesData()
        fetchLocationsData()
        fetchVendorsData()
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
            field: 'Comment',
            width: 200,
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
                    icon={<TrashIcon className='w-4' />}
                    label='Delete'
                    onClick={() => setGlassToDelete(row as SuperGlass)}
                />,
                <GridActionsCellItem
                    key={1}
                    icon={<PencilSquareIcon className='w-4' />}
                    label='Delete'
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
                    name='description'
                    content='Gestor de inventario'
                />
                <link
                    rel='icon'
                    href='/favicon.ico'
                />
            </Head>

            <main className='flex flex-col items-center justify-center px-4 py-16'>
                <div className='container flex flex-col items-center justify-center gap-12'>
                    <h1 className='text-lg font-semibold text-gray-700 sm:text-[2rem]'>Inventario de Vidrios</h1>
                    <div className='flex w-full flex-col justify-center gap-4'>
                        <div className='flex w-full justify-end gap-3'>
                            <button
                                onClick={() => {
                                    setIsGlassCreatorOpen(true)
                                }}
                                disabled={!(glassData && typesData && vendorsData && locationsData)}
                                className=' rounded-md border border-transparent bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:bg-slate-500'>
                                Cargar
                            </button>
                            <button
                                onClick={() => {
                                    setIsGlassMoverOpen(true)
                                }}
                                disabled={!(glassData && typesData && vendorsData && locationsData)}
                                className=' rounded-md border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:bg-slate-500'>
                                Mover
                            </button>

                            <button
                                onClick={() => {
                                    setIsGlassConsumerOpen(true)
                                }}
                                disabled={!(glassData && typesData && vendorsData && locationsData)}
                                className=' rounded-md border border-transparent bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:bg-slate-500'>
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
                title='Carga de Vidrios'
                buttonText='Cargar'
                buttonStyles='bg-emerald-500 hover:bg-emerald-600'
                isOpen={isGlassCreatorOpen}
                setIsOpen={setIsGlassCreatorOpen}
                onSubmit={onGlassCreation}
                initialValues={glassSelection}
                render={() => {
                    return (
                        <>
                            <Combobox
                                label='Tipo'
                                name='type'
                                inputField='name'
                                options={typesData as GlassType[]}
                            />
                            <Combobox
                                label='Descripción'
                                name='type'
                                inputField='description'
                                options={typesData as GlassType[]}
                            />
                            <Numeric
                                label='Ancho'
                                name='width'
                                className=' sm:col-span-3'
                            />
                            <Numeric
                                label='Alto'
                                name='height'
                                className=' sm:col-span-3'
                            />
                            <Combobox
                                label='Proovedor'
                                name='vendor'
                                inputField='name'
                                className=' sm:col-span-3'
                                options={vendorsData as GlassVendor[]}
                            />

                            <Combobox
                                label='Posición'
                                name='location'
                                inputField='position'
                                className=' sm:col-span-3'
                                required={false}
                                options={locationsData as GlassLocation[]}
                            />
                            <Numeric
                                label='Cantidad'
                                name='quantity'
                            />
                            <TextArea
                                label='Comentarios'
                                name='newComment'
                            />
                        </>
                    )
                }}
            />

            {/*Formulario de Movimiento*/}
            <DialogForm
                title={
                    <>
                        Mover Vidrio
                        {isNotNullUndefinedOrEmpty(glassFiltered) ? (
                            <span className='text-sm font-normal text-slate-500'>{`${` #${glassFiltered?.id ?? ''} ${
                                glassFiltered?.type?.name ?? ''
                            } ${glassFiltered?.width ?? ''}X${glassFiltered?.height ?? ''}`}`}</span>
                        ) : (
                            ''
                        )}
                    </>
                }
                buttonText='Mover'
                buttonStyles='bg-sky-600 hover:bg-sky-700'
                buttonDisabled={!allowQuantityChange}
                isOpen={isGlassMoverOpen}
                setIsOpen={setIsGlassMoverOpen}
                onSubmit={(values) => {
                    const formResponse = values as { width: { width: number }; height: { height: number } }
                    onGlassMovement({
                        ...formResponse,
                        width: formResponse?.width?.width,
                        height: formResponse?.height?.height,
                    })
                }}
                initialValues={glassSelection}
                decorator={
                    [
                        {
                            field: 'type',
                            updates: (fieldValue, __, allValues) => {
                                if (!isNotNullUndefinedOrEmpty(fieldValue as object)) return {}
                                const values = allValues as {
                                    width: { width: number }
                                    height: { height: number }
                                    location?: object
                                    type?: object
                                }
                                const filteredGlass = {
                                    ...values,
                                    width: values?.width?.width,
                                    height: values?.height?.height,
                                } as SuperGlass

                                const filteredWidth = filteredWidthData(filteredGlass)
                                const filteredHeight = filteredHeightData(filteredGlass)
                                const filteredLocations = filteredLocationsData(filteredGlass)
                                //const filteredTypes = filteredTypesData(filteredGlass)

                                const newValues: {
                                    width?: { id: number; width: number | undefined }
                                    height?: { id: number; height: number | undefined }
                                    type?: object
                                    location?: object
                                    quantity?: number
                                    id?: number
                                } = {}

                                if (filteredWidth?.length === 1 && values?.width?.width !== filteredWidth[0]) {
                                    newValues.width = { id: 1, width: filteredWidth[0] }
                                }
                                if (filteredHeight?.length === 1 && values?.height?.height !== filteredHeight[0]) {
                                    newValues.height = { id: 1, height: filteredHeight[0] }
                                }
                                if (filteredLocations?.length === 1 && values?.location !== filteredLocations[0]) {
                                    newValues.location = filteredLocations[0] as GlassLocation
                                }
                                if (!isNaN(Number(glassFiltered?.quantity))) {
                                    newValues.quantity = Number(glassFiltered?.quantity)
                                }

                                if (!isNaN(Number(glassFiltered?.id))) {
                                    newValues.id = Number(glassFiltered?.id)
                                }

                                return newValues
                            },
                        },
                        {
                            field: 'width',
                            updates: (fieldValue, __, allValues) => {
                                if (!isNotNullUndefinedOrEmpty(fieldValue as object)) return {}
                                const values = allValues as {
                                    width: { width: number }
                                    height: { height: number }
                                    location?: object
                                    type?: object
                                }
                                const filteredGlass = {
                                    ...values,
                                    width: values?.width?.width,
                                    height: values?.height?.height,
                                } as SuperGlass

                                //const filteredWidth = filteredWidthData(filteredGlass)
                                const filteredHeight = filteredHeightData(filteredGlass)
                                const filteredLocations = filteredLocationsData(filteredGlass)
                                const filteredTypes = filteredTypesData(filteredGlass)

                                const newValues: {
                                    width?: { id: number; width: number | undefined }
                                    height?: { id: number; height: number | undefined }
                                    type?: object
                                    location?: object
                                    quantity?: number
                                    id?: number
                                } = {}

                                /*if(filteredWidth?.length===1&&values?.width?.width!==filteredWidth[0]) {
                                newValues.width =  {id:1,width:filteredWidth[0]}
                            }*/
                                if (filteredHeight?.length === 1 && values?.height?.height !== filteredHeight[0]) {
                                    newValues.height = { id: 1, height: filteredHeight[0] }
                                }
                                if (filteredLocations?.length === 1 && values?.location !== filteredLocations[0]) {
                                    newValues.location = filteredLocations[0] as GlassLocation
                                }
                                if (filteredTypes?.length === 1 && values?.type !== filteredTypes[0]) {
                                    newValues.type = filteredTypes[0] as GlassType
                                }

                                if (!isNaN(Number(glassFiltered?.quantity))) {
                                    newValues.quantity = Number(glassFiltered?.quantity)
                                }
                                if (!isNaN(Number(glassFiltered?.quantity))) {
                                    newValues.quantity = Number(glassFiltered?.quantity)
                                }

                                return newValues
                            },
                        },
                        {
                            field: 'height',
                            updates: (fieldValue, __, allValues) => {
                                if (!isNotNullUndefinedOrEmpty(fieldValue as object)) return {}
                                const values = allValues as {
                                    width: { width: number }
                                    height: { height: number }
                                    location?: object
                                    type?: object
                                    quantity?: number
                                }
                                const filteredGlass = {
                                    ...values,
                                    width: values?.width?.width,
                                    height: values?.height?.height,
                                } as SuperGlass

                                const filteredWidth = filteredWidthData(filteredGlass)
                                //const filteredHeight = filteredHeightData(filteredGlass)
                                const filteredLocations = filteredLocationsData(filteredGlass)
                                const filteredTypes = filteredTypesData(filteredGlass)

                                const newValues: {
                                    width?: { id: number; width: number | undefined }
                                    height?: { id: number; height: number | undefined }
                                    type?: object
                                    location?: object
                                    quantity?: number
                                    id?: number
                                } = {}

                                if (filteredWidth?.length === 1 && values?.width?.width !== filteredWidth[0]) {
                                    newValues.width = { id: 1, width: filteredWidth[0] }
                                }
                                /*if(filteredHeight?.length===1&&values?.height?.height!==filteredHeight[0]) {
                                newValues.height =  {id:1,height:filteredHeight[0]}
                            }*/
                                if (filteredLocations?.length === 1 && values?.location !== filteredLocations[0]) {
                                    newValues.location = filteredLocations[0] as GlassLocation
                                }
                                if (filteredTypes?.length === 1 && values?.type !== filteredTypes[0]) {
                                    newValues.type = filteredTypes[0] as GlassType
                                }

                                if (!isNaN(Number(glassFiltered?.quantity))) {
                                    newValues.quantity = Number(glassFiltered?.quantity)
                                }
                                if (!isNaN(Number(glassFiltered?.quantity))) {
                                    newValues.quantity = Number(glassFiltered?.quantity)
                                }

                                return newValues
                            },
                        },
                        {
                            field: 'location',
                            updates: (fieldValue, __, allValues) => {
                                if (!isNotNullUndefinedOrEmpty(fieldValue as object)) return {}
                                const values = allValues as {
                                    width: { width: number }
                                    height: { height: number }
                                    location?: object
                                    type?: object
                                }
                                const filteredGlass = {
                                    ...values,
                                    width: values?.width?.width,
                                    height: values?.height?.height,
                                } as SuperGlass

                                const filteredWidth = filteredWidthData(filteredGlass)
                                const filteredHeight = filteredHeightData(filteredGlass)
                                //const filteredLocations = filteredLocationsData(filteredGlass)
                                const filteredTypes = filteredTypesData(filteredGlass)

                                const newValues: {
                                    width?: { id: number; width: number | undefined }
                                    height?: { id: number; height: number | undefined }
                                    type?: object
                                    location?: object
                                    quantity?: number
                                    id?: number
                                } = {}

                                if (filteredWidth?.length === 1 && values?.width?.width !== filteredWidth[0]) {
                                    newValues.width = { id: 1, width: filteredWidth[0] }
                                }
                                if (filteredHeight?.length === 1 && values?.height?.height !== filteredHeight[0]) {
                                    newValues.height = { id: 1, height: filteredHeight[0] }
                                }
                                /*if(filteredLocations?.length===1&&values?.location!==filteredLocations[0]) {
                                newValues.location = filteredLocations[0] as GlassLocation
                            }*/
                                if (filteredTypes?.length === 1 && values?.type !== filteredTypes[0]) {
                                    newValues.type = filteredTypes[0] as GlassType
                                }

                                if (!isNaN(Number(glassFiltered?.quantity))) {
                                    newValues.quantity = Number(glassFiltered?.quantity)
                                }
                                if (!isNaN(Number(glassFiltered?.quantity))) {
                                    newValues.quantity = Number(glassFiltered?.quantity)
                                }

                                return newValues
                            },
                        },
                    ] as Calculation[]
                }
                render={(props) => {
                    const width = props.values?.width as { width: number }
                    const height = props.values?.height as { height: number }

                    const filteredGlass = {
                        ...props.values,
                        width: width?.width,
                        height: height?.height,
                    } as SuperGlass

                    filterGlassData({ ...filteredGlass, difQuantity: String(props.values?.difQuantity) })

                    return (
                        <>
                            <TextLine
                                label='Id'
                                name='id'
                                className='hidden'
                                required={false}
                            />
                            <Combobox
                                label='Tipo'
                                name='type'
                                inputField='name'
                                options={filteredTypesData(filteredGlass) as GlassType[]}
                            />
                            <Combobox
                                label='Descripción'
                                name='type'
                                inputField='description'
                                options={filteredTypesData(filteredGlass) as GlassType[]}
                            />
                            <Combobox
                                label='Ancho'
                                name='width'
                                inputField='width'
                                className=' sm:col-span-3'
                                options={filteredWidthData(filteredGlass)?.map((width, id) => {
                                    return { id: id + 1, width }
                                })}
                            />
                            <Combobox
                                label='Alto'
                                name='height'
                                inputField='height'
                                className=' sm:col-span-3'
                                options={filteredHeightData(filteredGlass)?.map((height, id) => {
                                    return { id: id + 1, height }
                                })}
                            />

                            <Combobox
                                label='Posición Origen'
                                name='location'
                                inputField='position'
                                className=' sm:col-span-3'
                                options={filteredLocationsData(filteredGlass) as GlassLocation[]}
                            />

                            <Combobox
                                label='Posición Destino'
                                name='destinyLocation'
                                inputField='position'
                                className=' sm:col-span-3'
                                options={locationsData as GlassLocation[]}
                            />
                            <Numeric
                                label='Cantidad'
                                disabled={true}
                                name='quantity'
                                className=' sm:col-span-3'
                            />
                            <Numeric
                                label='Cantidad a Mover'
                                name='difQuantity'
                                className=' sm:col-span-3'
                            />

                            <TextArea
                                label='Comentarios'
                                name='newComment'
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
                        {isNotNullUndefinedOrEmpty(glassFiltered) ? (
                            <span className='text-sm font-normal text-slate-500'>{`${` #${glassFiltered?.id ?? ''} ${
                                glassFiltered?.type?.name ?? ''
                            } ${glassFiltered?.width ?? ''}X${glassFiltered?.height ?? ''}`}`}</span>
                        ) : (
                            ''
                        )}
                    </>
                }
                buttonText='Consumir'
                buttonStyles='bg-red-500 hover:bg-red-600'
                buttonDisabled={!allowQuantityChange}
                isOpen={isGlassConsumerOpen}
                setIsOpen={setIsGlassConsumerOpen}
                onSubmit={(values) => {
                    const formResponse = values as { width: { width: number }; height: { height: number } }
                    onGlassConsumption({
                        ...formResponse,
                        width: formResponse?.width?.width,
                        height: formResponse?.height?.height,
                    })
                }}
                initialValues={glassSelection}
                decorator={
                    [
                        {
                            field: 'type',
                            updates: (fieldValue, __, allValues) => {
                                if (!isNotNullUndefinedOrEmpty(fieldValue as object)) return {}
                                const values = allValues as {
                                    width: { width: number }
                                    height: { height: number }
                                    location?: object
                                    type?: object
                                }
                                const filteredGlass = {
                                    ...values,
                                    width: values?.width?.width,
                                    height: values?.height?.height,
                                } as SuperGlass

                                const filteredWidth = filteredWidthData(filteredGlass)
                                const filteredHeight = filteredHeightData(filteredGlass)
                                const filteredLocations = filteredLocationsData(filteredGlass)
                                //const filteredTypes = filteredTypesData(filteredGlass)

                                const newValues: {
                                    width?: { id: number; width: number | undefined }
                                    height?: { id: number; height: number | undefined }
                                    type?: object
                                    location?: object
                                    quantity?: number
                                    id?: number
                                } = {}

                                if (filteredWidth?.length === 1 && values?.width?.width !== filteredWidth[0]) {
                                    newValues.width = { id: 1, width: filteredWidth[0] }
                                }
                                if (filteredHeight?.length === 1 && values?.height?.height !== filteredHeight[0]) {
                                    newValues.height = { id: 1, height: filteredHeight[0] }
                                }
                                if (filteredLocations?.length === 1 && values?.location !== filteredLocations[0]) {
                                    newValues.location = filteredLocations[0] as GlassLocation
                                }
                                if (!isNaN(Number(glassFiltered?.quantity))) {
                                    newValues.quantity = Number(glassFiltered?.quantity)
                                }
                                if (!isNaN(Number(glassFiltered?.quantity))) {
                                    newValues.quantity = Number(glassFiltered?.quantity)
                                }

                                return newValues
                            },
                        },
                        {
                            field: 'width',
                            updates: (fieldValue, __, allValues) => {
                                if (!isNotNullUndefinedOrEmpty(fieldValue as object)) return {}
                                const values = allValues as {
                                    width: { width: number }
                                    height: { height: number }
                                    location?: object
                                    type?: object
                                }
                                const filteredGlass = {
                                    ...values,
                                    width: values?.width?.width,
                                    height: values?.height?.height,
                                } as SuperGlass

                                //const filteredWidth = filteredWidthData(filteredGlass)
                                const filteredHeight = filteredHeightData(filteredGlass)
                                const filteredLocations = filteredLocationsData(filteredGlass)
                                const filteredTypes = filteredTypesData(filteredGlass)

                                const newValues: {
                                    width?: { id: number; width: number | undefined }
                                    height?: { id: number; height: number | undefined }
                                    type?: object
                                    location?: object
                                    quantity?: number
                                    id?: number
                                } = {}

                                /*if(filteredWidth?.length===1&&values?.width?.width!==filteredWidth[0]) {
                                newValues.width =  {id:1,width:filteredWidth[0]}
                            }*/
                                if (filteredHeight?.length === 1 && values?.height?.height !== filteredHeight[0]) {
                                    newValues.height = { id: 1, height: filteredHeight[0] }
                                }
                                if (filteredLocations?.length === 1 && values?.location !== filteredLocations[0]) {
                                    newValues.location = filteredLocations[0] as GlassLocation
                                }
                                if (filteredTypes?.length === 1 && values?.type !== filteredTypes[0]) {
                                    newValues.type = filteredTypes[0] as GlassType
                                }

                                if (!isNaN(Number(glassFiltered?.quantity))) {
                                    newValues.quantity = Number(glassFiltered?.quantity)
                                }
                                if (!isNaN(Number(glassFiltered?.quantity))) {
                                    newValues.quantity = Number(glassFiltered?.quantity)
                                }

                                return newValues
                            },
                        },
                        {
                            field: 'height',
                            updates: (fieldValue, __, allValues) => {
                                if (!isNotNullUndefinedOrEmpty(fieldValue as object)) return {}
                                const values = allValues as {
                                    width: { width: number }
                                    height: { height: number }
                                    location?: object
                                    type?: object
                                    quantity?: number
                                }
                                const filteredGlass = {
                                    ...values,
                                    width: values?.width?.width,
                                    height: values?.height?.height,
                                } as SuperGlass

                                const filteredWidth = filteredWidthData(filteredGlass)
                                //const filteredHeight = filteredHeightData(filteredGlass)
                                const filteredLocations = filteredLocationsData(filteredGlass)
                                const filteredTypes = filteredTypesData(filteredGlass)

                                const newValues: {
                                    width?: { id: number; width: number | undefined }
                                    height?: { id: number; height: number | undefined }
                                    type?: object
                                    location?: object
                                    quantity?: number
                                    id?: number
                                } = {}

                                if (filteredWidth?.length === 1 && values?.width?.width !== filteredWidth[0]) {
                                    newValues.width = { id: 1, width: filteredWidth[0] }
                                }
                                /*if(filteredHeight?.length===1&&values?.height?.height!==filteredHeight[0]) {
                                newValues.height =  {id:1,height:filteredHeight[0]}
                            }*/
                                if (filteredLocations?.length === 1 && values?.location !== filteredLocations[0]) {
                                    newValues.location = filteredLocations[0] as GlassLocation
                                }
                                if (filteredTypes?.length === 1 && values?.type !== filteredTypes[0]) {
                                    newValues.type = filteredTypes[0] as GlassType
                                }

                                if (!isNaN(Number(glassFiltered?.quantity))) {
                                    newValues.quantity = Number(glassFiltered?.quantity)
                                }
                                if (!isNaN(Number(glassFiltered?.quantity))) {
                                    newValues.quantity = Number(glassFiltered?.quantity)
                                }

                                return newValues
                            },
                        },
                        {
                            field: 'location',
                            updates: (fieldValue, __, allValues) => {
                                if (!isNotNullUndefinedOrEmpty(fieldValue as object)) return {}
                                const values = allValues as {
                                    width: { width: number }
                                    height: { height: number }
                                    location?: object
                                    type?: object
                                }
                                const filteredGlass = {
                                    ...values,
                                    width: values?.width?.width,
                                    height: values?.height?.height,
                                } as SuperGlass

                                const filteredWidth = filteredWidthData(filteredGlass)
                                const filteredHeight = filteredHeightData(filteredGlass)
                                //const filteredLocations = filteredLocationsData(filteredGlass)
                                const filteredTypes = filteredTypesData(filteredGlass)

                                const newValues: {
                                    width?: { id: number; width: number | undefined }
                                    height?: { id: number; height: number | undefined }
                                    type?: object
                                    location?: object
                                    quantity?: number
                                    id?: number
                                } = {}

                                if (filteredWidth?.length === 1 && values?.width?.width !== filteredWidth[0]) {
                                    newValues.width = { id: 1, width: filteredWidth[0] }
                                }
                                if (filteredHeight?.length === 1 && values?.height?.height !== filteredHeight[0]) {
                                    newValues.height = { id: 1, height: filteredHeight[0] }
                                }
                                /*if(filteredLocations?.length===1&&values?.location!==filteredLocations[0]) {
                                newValues.location = filteredLocations[0] as GlassLocation
                            }*/
                                if (filteredTypes?.length === 1 && values?.type !== filteredTypes[0]) {
                                    newValues.type = filteredTypes[0] as GlassType
                                }

                                if (!isNaN(Number(glassFiltered?.quantity))) {
                                    newValues.quantity = Number(glassFiltered?.quantity)
                                }
                                if (!isNaN(Number(glassFiltered?.quantity))) {
                                    newValues.quantity = Number(glassFiltered?.quantity)
                                }

                                return newValues
                            },
                        },
                    ] as Calculation[]
                }
                render={(props) => {
                    const width = props.values?.width as { width: number }
                    const height = props.values?.height as { height: number }

                    const filteredGlass = {
                        ...props.values,
                        width: width?.width,
                        height: height?.height,
                    } as SuperGlass

                    filterGlassData({ ...filteredGlass, difQuantity: String(props.values?.difQuantity) })

                    return (
                        <>
                            <TextLine
                                label='Id'
                                name='id'
                                className='hidden'
                                required={false}
                            />
                            <Combobox
                                label='Tipo'
                                name='type'
                                inputField='name'
                                options={filteredTypesData(filteredGlass) as GlassType[]}
                            />
                            <Combobox
                                label='Descripción'
                                name='type'
                                inputField='description'
                                options={filteredTypesData(filteredGlass) as GlassType[]}
                            />
                            <Combobox
                                label='Ancho'
                                name='width'
                                inputField='width'
                                className=' sm:col-span-3'
                                options={filteredWidthData(filteredGlass)?.map((width, id) => {
                                    return { id: id + 1, width }
                                })}
                            />
                            <Combobox
                                label='Alto'
                                name='height'
                                inputField='height'
                                className=' sm:col-span-3'
                                options={filteredHeightData(filteredGlass)?.map((height, id) => {
                                    return { id: id + 1, height }
                                })}
                            />

                            <Combobox
                                label='Posición'
                                name='location'
                                inputField='position'
                                options={filteredLocationsData(filteredGlass) as GlassLocation[]}
                            />
                            <Numeric
                                label='Cantidad'
                                disabled={true}
                                name='quantity'
                                className=' sm:col-span-3'
                            />
                            <Numeric
                                label='Cantidad a Consumir'
                                name='difQuantity'
                                className=' sm:col-span-3'
                            />

                            <TextArea
                                label='Comentarios'
                                name='newComment'
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
                            <span className='text-sm font-normal text-slate-500'>{`${` #${glassToEdit?.id ?? ''} ${
                                glassToEdit?.type?.name ?? ''
                            } ${glassToEdit?.width ?? ''}X${glassToEdit?.height ?? ''}`}`}</span>
                        ) : (
                            ''
                        )}
                    </>
                }
                buttonText='Editar'
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
                                label='Tipo'
                                name='type'
                                inputField='name'
                                options={typesData as GlassType[]}
                            />
                            <Combobox
                                label='Descripción'
                                name='type'
                                inputField='description'
                                options={typesData as GlassType[]}
                            />
                            <Numeric
                                label='Ancho'
                                name='width'
                                className=' sm:col-span-3'
                            />
                            <Numeric
                                label='Alto'
                                name='height'
                                className=' sm:col-span-3'
                            />

                            <Combobox
                                label='Proovedor'
                                name='vendor'
                                inputField='name'
                                className=' sm:col-span-3'
                                options={vendorsData as GlassVendor[]}
                            />
                            <Combobox
                                label='Posición'
                                name='location'
                                inputField='position'
                                className=' sm:col-span-3'
                                options={locationsData as GlassLocation[]}
                            />
                            <Numeric
                                label='Cantidad'
                                disabled={true}
                                name='quantity'
                            />

                            <TextArea
                                label='Comentarios'
                                name='newComment'
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
                titleStyles='text-center'
                buttonText={`Eliminar #${
                    isNotNullUndefinedOrEmpty(glassToDelete)
                        ? `${glassToDelete?.id ?? ''} ${glassToDelete?.type?.name ?? ''} ${
                              glassToDelete?.width ?? ''
                          }X${glassToDelete?.height ?? ''}`
                        : 'vidrio'
                }`}
                buttonStyles='bg-red-500 hover:bg-red-600 w-full'
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
                                label='Id'
                                name='id'
                                className='hidden'
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
