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
import {
    DataGridPremium as DataGrid,
    GridToolbar,
    GridActionsCellItem,
    type GridColDef,
    type GridValidRowModel,
} from '@mui/x-data-grid-premium'

//Axios
import axios from 'axios'

//Prisma
import { type Glass, type GlassType, type GlassLocation, type GlassVendor } from '@prisma/client'

//Custom Components
import Combobox from '../components/inputFields/comboboxField'
import Numeric from '../components/inputFields/numericField'
import TextArea from '../components/inputFields/textareaField'
import TextLine from '../components/inputFields/textlineField'
import DateField from '~/components/inputFields/dateField'
import DialogForm from '../components/dialogForm'
import Toggle from '../components/toggle'
import Snackbar, { type AlertProps } from '../components/snackbarAlert'

//Custom Functions
import { isNotNullUndefinedOrEmpty } from '../server/variableChecker'

//Custom Constants
import GRID_DEFAULT_LOCALE_TEXT from '../constants/localeTextConstants'
import { useSession } from 'next-auth/react'


//Custom Types
interface SuperGlass extends Glass {
    type?: GlassType | null
    location?: GlassLocation | null
    vendor?: GlassVendor | null
    squaredMeters?: number
}

interface RowType extends SuperGlass {
    typeName?: string
    typeDescription?: string
    typeCreatedAt?: Date
    typeUpdatedAt?: Date
    locationPosition?: string
    locationWarehouse?: string
    locationCreatedAt?: Date
    locationUpdatedAt?: Date
    vendorName?: string
    vendorCreatedAt?: Date
    vendorUpdatedAt?: Date
}

type FormInputType = SuperGlass & {
    width?: { id: number; width: number }
    height?: { id: number; height: number }
    batch?: {id: number; batch: string}
}

interface formResponseType {
    id?: number
    type: { id: number }
    location?: { id: number }
    destinyLocation?: { id: number }
    vendor: { id: number }
    width: number
    height: number
    quantity: number
    batch?: string
    expirationDate?: Date
    newComment?: string
    difQuantity?: string | number
}

/*eslint-disable @typescript-eslint/no-misused-promises*/
/*eslint-disable @typescript-eslint/no-floating-promises*/

const Home: NextPage = () => {
    const { data: session } = useSession()
    session?.user
    const user = session?.user ?? {
        name: 'MANTENIMIENTO UVEG',
        email: 'mantenimiento@uveg.ar',
        image: null,
        id: 'clid221kv0000lq0h3tvno38h',
    }

    //States
    const [glassSelection, setGlassSelection] = useState<SuperGlass | null>(null)
    const [glassFiltered, setGlassFiltered] = useState<SuperGlass | null>(null)
    const [allowQuantityChange, setAllowQuantityChange] = useState<boolean>(false)
    const [snackbar, setSnackbar] = useState<AlertProps | null>(null)
    const [seeConsumedGlass, setSeeConsumedGlass] = useState<boolean>(false)

    const [isGlassCreatorOpen, setIsGlassCreatorOpen] = useState<boolean>(false)
    const [isGlassMoverOpen, setIsGlassMoverOpen] = useState<boolean>(false)
    const [isGlassConsumerOpen, setIsGlassConsumerOpen] = useState<boolean>(false)

    const [glassToDelete, setGlassToDelete] = useState<SuperGlass | null>(null)
    const [glassToEdit, setGlassToEdit] = useState<SuperGlass | null>(null)

    const [glassData, setGlassData] = useState<SuperGlass[] | null>(null)
    const [glassDataWithConsumed, setGlassDataWithConsumed] = useState<SuperGlass[] | null>(null)
    const [typesData, setTypesData] = useState<GlassType[] | null>(null)
    const [locationsData, setLocationsData] = useState<GlassLocation[] | null>(null)
    const [vendorsData, setVendorsData] = useState<GlassVendor[] | null>(null)

    //Functions
    //- Submit Functions
    const onGlassCreation = async (formResponse: object) => {
        try {
            const { type, width, height, vendor, location, quantity, batch, expirationDate, newComment } = formResponse as formResponseType
            const response = await axios.post('/api/glass', {
                user,
                glass: {
                    typeId: type.id,
                    width,
                    height,
                    vendorId: vendor.id,
                    locationId: location?.id !== null ? location?.id : undefined,
                    quantity,
                    batch,
                    expirationDate,
                    Comment: newComment,
                },
            })
            if (response.data === null) throw new Error('No se obtuvo respuesta')
            setSnackbar({ type: 'success', message: 'Vidrio cargado exitosamente' })

            fetchGlassData()
        } catch (error) {
            console.error('Error creating glass:', error)
            setSnackbar({ type: 'warning', message: 'Error al crear el vidrio' })
        }
    }

    const onGlassMovement = async (formResponse: object) => {
        try {
            const { id, quantity, difQuantity, newComment, type, width, height, vendor, batch, expirationDate, location, destinyLocation } =
                formResponse as formResponseType

            const newQuantity = Number(quantity) - Number(difQuantity)

            if (newQuantity < 0) {
                setSnackbar({ type: 'warning', message: 'No se puede consumir más vidrio del existente' })

                return
            }

            //Muevo todo el vidrio solamente cambia de posición
            if (newQuantity === 0) {
                const response = await axios.patch(`/api/glass/${Number(id)}`, {
                    user,
                    glass: {
                        quantity: difQuantity,
                        Comment: newComment,
                        typeId: type.id,
                        width,
                        height,
                        vendorId: vendor.id,
                        locationId: destinyLocation?.id,
                        batch,
                        expirationDate
                    },
                })

                if (response.data === null) throw new Error('No se obtuvo respuesta')
            }
            //Creo un vidrio nuevo igual pero con difquantity y modifico el vidrio anterior con newquantity
            else {
                const oldGlass = await axios.patch(`/api/glass/${Number(id)}`, {
                    user,
                    glass: {
                        typeId: type.id,
                        quantity: newQuantity,
                        height,
                        width,
                        locationId: location?.id,
                        vendorId: vendor.id,
                        Comment: newComment,
                        batch,
                        expirationDate
                    },
                })

                const newGlass = await axios.post('/api/glass', {
                    user,
                    glass: {
                        typeId: type.id,
                        quantity: difQuantity,
                        height,
                        width,
                        vendorId: vendor.id,
                        locationId: destinyLocation?.id,
                        Comment: newComment,
                        batch,
                        expirationDate
                    },
                })

                if (newGlass.data === null || oldGlass.data === null) throw new Error('No se obtuvo respuesta')
            }

            setSnackbar({ type: 'success', message: 'Vidrio movido exitosamente' })

            fetchGlassData()
        } catch (error) {
            console.error('Error moving glass:', error)
            setSnackbar({ type: 'warning', message: 'Error al mover el vidrio' })
        }
    }
    const onGlassConsumption = async (formResponse: object) => {
        try {
            const { id, quantity, difQuantity, newComment, type, width, height, vendor, batch, expirationDate, location } =
                formResponse as formResponseType

            const newQuantity = Number(quantity) - Number(difQuantity)

            if (newQuantity < 0) {
                setSnackbar({ type: 'warning', message: 'No se puede consumir más vidrio del existente' })

                return
            }

            const response = await axios.patch(`/api/glass/${Number(id)}`, {
                user,
                glass: {
                    quantity: newQuantity,
                    Comment: newComment,
                    typeId: type.id,
                    width,
                    height,
                    vendorId: vendor.id,
                    locationId: location?.id,
                    batch,
                    expirationDate
                },
            })

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
            const response = await axios.delete(`/api/glass/${Number(id)}`)
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
            console.log({formResponse })
            const { id } = formResponse as formResponseType

            const { type, width, height, vendor, location, newComment, quantity, batch, expirationDate } = formResponse as formResponseType

            const response = await axios.patch(`/api/glass/${Number(id)}`, {
                user,
                glass: {
                    typeId: type.id,
                    width,
                    height,
                    quantity,
                    vendorId: vendor.id,
                    locationId: location?.id,
                    Comment: newComment,
                    batch,
                    expirationDate
                },
            })
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
            const response = await axios.get('/api/glass', {
                params: {
                    status: 'TRANSIT,STORED',
                },
            })
            if (response.data === null) throw new Error('No hay vidrios')
            localStorage.setItem('glassData', JSON.stringify(response.data))
            setGlassData(response.data as SuperGlass[])
            setSnackbar({ type: 'success', message: 'Vidrios Actualizados' })

            const cachedResponseWithConsumed: SuperGlass[] = JSON.parse(
                localStorage.getItem('glassDataWithConsumed') ?? '{}',
            ) as SuperGlass[]
            setGlassDataWithConsumed(cachedResponseWithConsumed)
            const responseWithConsumed = await axios.get('/api/glass')
            if (responseWithConsumed.data === null) throw new Error('No hay vidrios')
            localStorage.setItem('glassDataWithConsumed', JSON.stringify(responseWithConsumed.data))
            setGlassDataWithConsumed(responseWithConsumed.data as SuperGlass[])
        } catch (error) {
            console.error('Error fetching data:', error)
            setSnackbar({ type: 'warning', message: 'Error al obtener los vidrios' })
        }
    }

    const fetchTypesData = async () => {
        try {
            const cachedResponse: GlassType[] = JSON.parse(localStorage.getItem('typesData') ?? '{}') as GlassType[]
            setTypesData(cachedResponse)

            const response = await axios.get('/api/type')
            if (response.data === null) throw new Error('No hay materiales')
            localStorage.setItem('typesData', JSON.stringify(response.data))
            setTypesData(response.data as GlassType[])
            //setSnackbar({ type: 'success', message: 'Materiales Actualizados' })
        } catch (error) {
            console.error('Error fetching data:', error)
            setSnackbar({
                type: 'warning',
                message: 'Error al obtener los materiales de vidrio',
            })
        }
    }

    const fetchLocationsData = async () => {
        try {
            const cachedResponse: GlassLocation[] = JSON.parse(
                localStorage.getItem('locationsData') ?? '{}',
            ) as GlassLocation[]
            setLocationsData(cachedResponse)

            const response = await axios.get('/api/location')
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

            const response = await axios.get('/api/vendor')
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

    function getFieldOptions(glass: SuperGlass) {

        const foundGlasses = glassData?.filter((glassToCompare: SuperGlass) => {


            let response = true

            if (glass.vendor?.name && glass.vendor?.name !== glassToCompare.vendor?.name) {
                response = false
            }

            if (glass.batch && glass.batch !== glassToCompare.batch) {
                response = false
            }

            if (glass.location?.position && glass.location?.position !== glassToCompare.location?.position) {
                response = false
            }

            if (glass.width && glass.width !== glassToCompare.width) {
                response = false
            }

            if (glass.height && glass.height !== glassToCompare.height) {
                response = false
            }

            if (glass.type?.name && glass.type?.name !== glassToCompare.type?.name) {
                response = false
            }

            return response
        })


        return {
            "id": [... new Set(foundGlasses?.map(glass => glass.id))],
            "type": [... new Set(foundGlasses?.map(glass => glass.type))],
            "location": [... new Set(foundGlasses?.map(glass => glass.location))],
            "vendor": [... new Set(foundGlasses?.map(glass => glass.vendor))],
            "width": [... new Set(foundGlasses?.map(glass => glass.width))],
            "height": [... new Set(foundGlasses?.map(glass => glass.height))],
            "batch": [... new Set(foundGlasses?.map(glass => String(glass.batch)))],
        }
    }


    function filterGlassData(glass: SuperGlass & { difQuantity: string }) {
        const foundGlass: SuperGlass[] | undefined = glassData?.filter((glassToCompare: SuperGlass) => {

            let response = true

            if (glass.vendor?.name && glass.vendor?.name !== glassToCompare.vendor?.name) {
                response = false
            }

            if (glass.batch && glass.batch !== glassToCompare.batch) {
                response = false
            }

            if (glass.location?.position && glass.location?.position !== glassToCompare.location?.position) {
                response = false
            }

            if (glass.width && glass.width !== glassToCompare.width) {
                response = false
            }

            if (glass.height && glass.height !== glassToCompare.height) {
                response = false
            }

            if (glass.type?.name && glass.type?.name !== glassToCompare.type?.name) {
                response = false
            }

            return response
        })

        console.log({foundGlass})

        if (foundGlass?.length === 1 && foundGlass) {
            setGlassFiltered(foundGlass[0] as SuperGlass)
        } else {
            setGlassFiltered(null)
        }

        if (glassFiltered && foundGlass && Number(glass?.difQuantity) <= Number(foundGlass[0]?.quantity)) {
            setAllowQuantityChange(true)
        } else {
            setAllowQuantityChange(false)
        }
    }

    //useEffect
    useEffect(() => {

        setTimeout(()=> {
            const divs = document.getElementsByTagName("div")
        let licenseDiv
        for(let i = 0; i < divs.length; i++){
            if(divs[i]?.innerText==='MUI X Missing license key'){
                licenseDiv = divs[i]
                console.log(divs[i])
            }
        }
        console.log(divs)
        console.log({licenseDiv})
        licenseDiv?.remove()
        },500)
        
        fetchGlassData()
        fetchTypesData()
        fetchLocationsData()
        fetchVendorsData()

        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        setGlassFiltered(null)
    }, [isGlassMoverOpen, isGlassConsumerOpen])


    //DataGrid Definitions
    const rows: RowType[] = useMemo(() => {
        return (seeConsumedGlass ? glassDataWithConsumed : glassData)?.map((row) => {
            return {
                ...row,
                typeName: row.type?.name,
                typeDescription: row.type?.description,
                typeCreatedAt: row.type?.createdAt,
                typeUpdatedAt: row.type?.updatedAt,
                locationPosition: row.location?.position,
                locationWarehouse: row.location?.warehouse,
                locationCreatedAt: row.location?.createdAt,
                locationUpdatedAt: row.location?.updatedAt,
                vendorName: row.vendor?.name,
                vendorCreatedAt: row.vendor?.createdAt,
                vendorUpdatedAt: row.vendor?.updatedAt,
            }
        }) as RowType[]
    }, [glassData, glassDataWithConsumed, seeConsumedGlass])


    const columns: GridColDef[] = [
        {
            headerName: 'Id',
            field: 'id',
            width: 80,
            type: 'number',
            valueFormatter: (params) => (params?.value ? `#${String(params?.value)}` : undefined),
            aggregable: false,
            groupable: false,
        },
        {
            headerName: 'Estado',
            field: 'status',
            width: 130,

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
                        text = String(params?.value) ?? 'Agrupado'
                        ringColor = 'ring-slate-700/10'
                        backgroundColor = 'bg-slate-50'
                        textColor = 'text-slate-800'
                }
                if (!params?.value) {
                    return undefined
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
            field: 'typeName',
            aggregable: false,
        },

        {
            headerName: 'Descripción',
            field: 'typeDescription',
            width: 200,
            aggregable: false,
        },
        {
            headerName: 'Ancho',
            field: 'width',
            width: 110,
            type: 'number',
            valueFormatter: ({ value }: { value: string }) => (value ? `${value} mm` : undefined),
        },
        {
            headerName: 'Alto',
            field: 'height',
            width: 110,
            type: 'number',
            valueFormatter: ({ value }: { value: string }) => (value ? `${value} mm` : undefined),
        },
        {
            headerName: 'Área',
            field: 'squaredMeters',
            width: 100,
            type: 'number',
            valueFormatter: ({ value }: { value: string }) =>
                value ? `${parseFloat(value).toFixed(2)} m²` : undefined,
        },

        {
            headerName: 'Cantidad',
            field: 'quantity',
            width: 130,
            type: 'number',
        },
        {
            headerName: 'Almacén',
            width: 100,
            field: 'locationWarehouse',
            aggregable: false,
        },

        {
            headerName: 'Posición',
            field: 'locationPosition',
            width: 130,
            aggregable: false,
        },
        {
            headerName: 'Proovedor',
            field: 'vendorName',
            width: 100,
            aggregable: false,
        },
        {
            headerName: 'Lote',
            field: 'batch',
            width: 100,
            aggregable: false,
        },
        {
            headerName: 'Comentario',
            field: 'Comment',
            width: 200,
            aggregable: false,
            groupable: false,
        },
        {
            headerName: 'Expira En',
            field: 'expirationDate',
            width: 150,
            type: 'date',
            valueGetter: ({ value }: { value: string }) => (value ? new Date(value) : undefined),
            groupable: false,
        },
        {
            headerName: 'Creado En',
            field: 'createdAt',
            width: 150,
            type: 'dateTime',
            valueGetter: ({ value }: { value: string }) => (value ? new Date(value) : undefined),
            groupable: false,
        },
        {
            headerName: 'Actualizado En',
            field: 'updatedAt',
            width: 150,
            type: 'dateTime',
            valueGetter: ({ value }: { value: string }) => (value ? new Date(value) : undefined),
            groupable: false,
        },
        {
            field: 'Acciones',
            type: 'actions',
            width: 80,
            getActions: ({ row }: { row: GridValidRowModel }) =>
                row.id
                    ? [
                        <GridActionsCellItem
                            key={1}
                            icon={<TrashIcon className="w-4" />}
                            label="Delete"
                            onClick={() => setGlassToDelete(row as RowType)}
                        />,
                        <GridActionsCellItem
                            key={1}
                            icon={<PencilSquareIcon className="w-4" />}
                            label="Delete"
                            onClick={() => setGlassToEdit(row as RowType)}
                        />,
                    ]
                    : [],
            aggregable: false,
            groupable: false,
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
                    {/* <h1 className="text-2xl font-semibold text-gray-700 sm:text-[2rem]">Inventario de Vidrios</h1> */}
                    <div className="h-screen-fit flex w-full flex-col justify-center gap-4">
                        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-0">
                            <div className="flex w-full items-center justify-start gap-2 pl-2 sm:w-1/2">
                                <span className="text-sm font-medium  text-gray-700">Ver consumidos</span>
                                <Toggle
                                    text="Ver Consumidos"
                                    enabled={seeConsumedGlass}
                                    setEnabled={setSeeConsumedGlass}
                                    color="bg-red-500"
                                />
                            </div>
                            <div className="flex w-full justify-between gap-3 sm:justify-end">
                                <button
                                    onClick={() => {
                                        setIsGlassCreatorOpen(true)
                                    }}
                                    disabled={!(glassData && typesData && vendorsData && locationsData)}
                                    className=" rounded-md border border-transparent bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:bg-slate-500">
                                    Cargar
                                </button>
                                <button
                                    onClick={() => {
                                        setIsGlassMoverOpen(true)
                                    }}
                                    disabled={!(glassData && typesData && vendorsData && locationsData)}
                                    className=" rounded-md border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:bg-slate-500">
                                    Mover
                                </button>

                                <button
                                    onClick={() => {
                                        setIsGlassConsumerOpen(true)
                                    }}
                                    disabled={!(glassData && typesData && vendorsData && locationsData)}
                                    className=" rounded-md border border-transparent bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:bg-slate-500">
                                    Consumir
                                </button>
                            </div>
                        </div>
                        {glassData && (
                            <DataGrid
                                disableDensitySelector
                                localeText={GRID_DEFAULT_LOCALE_TEXT}
                                rows={rows}
                                columns={columns}
                                slots={{ toolbar: GridToolbar }}
                                onRowSelectionModelChange={(ids) =>
                                    setGlassSelection(rows.find((row) => row.id === ids[0]) as RowType)
                                }
                                slotProps={{
                                    toolbar: {
                                        showQuickFilter: true,
                                        quickFilterProps: { debounceMs: 500 },
                                    },
                                }}
                                initialState={{
                                    columns: {
                                        columnVisibilityModel: {
                                            typeDescription: false,
                                            locationWarehouse: false,
                                            vendorName: false,
                                            expirationDate: false,
                                            createdAt: false,
                                            updatedAt: false,
                                        },
                                    },
                                    aggregation: {
                                        model: {
                                            quantity: 'sum',
                                            squaredMeters: 'sum',
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
                title="Carga de Vidrios"
                buttonText="Cargar"
                buttonStyles="bg-emerald-500 hover:bg-emerald-600"
                isOpen={isGlassCreatorOpen}
                setIsOpen={setIsGlassCreatorOpen}
                onSubmit={onGlassCreation}
                initialValues={glassSelection}
                render={() => {
                    return (
                        <>
                            <Combobox
                                label="Material"
                                name="type"
                                inputField="name"
                                options={typesData as GlassType[]}
                            />
                            <Combobox
                                label="Descripción"
                                name="type"
                                inputField="description"
                                options={typesData as GlassType[]}
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
                            <Combobox
                                label="Proovedor"
                                name="vendor"
                                inputField="name"
                                className=" sm:col-span-3"
                                options={vendorsData as GlassVendor[]}
                            />

                            <Combobox
                                label="Posición"
                                name="location"
                                inputField="position"
                                className=" sm:col-span-3"
                                required={false}
                                options={locationsData as GlassLocation[]}
                            />
                            <TextLine
                                label="Lote"
                                name="batch"
                                className=" sm:col-span-3"
                                required={false}
                            />
                            <DateField
                                label="Vencimiento"
                                name="expirationDate"
                                className=" sm:col-span-3"
                                required={false}
                            />
                            <Numeric
                                label="Cantidad"
                                name="quantity"
                            />
                            <TextArea
                                label="Comentarios"
                                name="newComment"
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
                            <span className="text-sm font-normal text-slate-500">{`${` #${glassFiltered?.id ?? ''} ${glassFiltered?.type?.name ?? ''
                                } ${glassFiltered?.width ?? ''}X${glassFiltered?.height ?? ''}`}`}</span>
                        ) : (
                            ''
                        )}
                    </>
                }
                buttonText="Mover"
                buttonStyles="bg-sky-600 hover:bg-sky-700"
                buttonDisabled={!allowQuantityChange}
                isOpen={isGlassMoverOpen}
                setIsOpen={setIsGlassMoverOpen}
                onSubmit={(values) => {
                    const formResponse = values as { width: { width: number }; height: { height: number }; batch: { batch: string } }
                    onGlassMovement({
                        ...formResponse,
                        width: formResponse?.width?.width,
                        height: formResponse?.height?.height,
                        batch: formResponse?.batch?.batch,
                    })
                }}
                initialValues={glassSelection ? { ...glassSelection, width: { id: 1, width: glassSelection?.width }, height: { id: 1, height: glassSelection?.height }, batch: { id: 1, batch: String(glassSelection?.batch) } } : undefined}
                render={(props) => {

                    const values = props.values as FormInputType

                    // eslint-disable-next-line no-unused-vars
                    const setFormAttribute = props.form.mutators.setFormAttribute as (fieldName: string, fieldVal: number | string | null | object | Date) => void

                    const formGlass: SuperGlass = {
                        ...values,
                        width: values?.width?.width,
                        height: values?.height?.height,
                        batch: values?.batch?.batch,
                    }

                    filterGlassData({ ...formGlass, difQuantity: String(props.values?.difQuantity) })



                    if (glassFiltered?.id && values.id !== glassFiltered.id) {
                        setFormAttribute('id', glassFiltered.id)
                        setFormAttribute('type', glassFiltered.type as object)
                        setFormAttribute('vendor', glassFiltered.vendor as object)
                        setFormAttribute('location', glassFiltered.location as object)
                        setFormAttribute('width', { id: 1, width: glassFiltered.width } as object)
                        setFormAttribute('height', { id: 1, height: glassFiltered.height } as object)
                        setFormAttribute('batch', { id: 1, batch: String(glassFiltered.batch) } as object)
                        setFormAttribute('quantity', glassFiltered.quantity)
                    }


                    return (
                        <>
                            <TextLine
                                label="id"
                                name="id"
                                className='hidden'
                                required={false}
                            />
                            <Combobox
                                label="Material"
                                name="type"
                                inputField="name"
                                options={getFieldOptions(formGlass).type as GlassType[]}
                            />
                            <Combobox
                                label="Descripción"
                                name="type"
                                inputField="description"
                                options={getFieldOptions(formGlass).type as GlassType[]}
                            />
                            <Combobox
                                label="Ancho"
                                name="width"
                                inputField="width"
                                className="sm:col-span-3"
                                options={getFieldOptions(formGlass).width?.map((width, id) => {
                                    return { id: id + 1, width }
                                })}
                            />
                            <Combobox
                                label="Alto"
                                name="height"
                                inputField="height"
                                className="sm:col-span-3"
                                options={getFieldOptions(formGlass).height?.map((height, id) => {
                                    return { id: id + 1, height }
                                })}
                            />

                            <Combobox
                                label="Lote"
                                name="batch"
                                inputField="batch"
                                className="sm:col-span-3"
                                options={getFieldOptions(formGlass).batch?.map((batch, id) => {
                                    return { id: id + 1, batch }
                                })}
                            />

                            <Combobox
                                label="Proovedor"
                                name="vendor"
                                inputField="name"
                                className=" sm:col-span-3"
                                options={getFieldOptions(formGlass).vendor as GlassVendor[]}
                            />

                            <Combobox
                                label="Posición Origen"
                                name="location"
                                inputField="position"
                                className=" sm:col-span-3"
                                options={getFieldOptions(formGlass).location as GlassLocation[]}
                            />

                            <Combobox
                                label="Posición Destino"
                                name="destinyLocation"
                                inputField="position"
                                className=" sm:col-span-3"
                                options={locationsData as GlassLocation[]}
                            />
                            <Numeric
                                label="Cantidad"
                                disabled={true}
                                name="quantity"
                                className=" sm:col-span-3"
                            />
                            <Numeric
                                label="Cantidad a Mover"
                                name="difQuantity"
                                className=" sm:col-span-3"
                            />

                            <TextArea
                                label="Comentarios"
                                name="newComment"
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
                            <span className="text-sm font-normal text-slate-500">{`${` #${glassFiltered?.id ?? ''} ${glassFiltered?.type?.name ?? ''
                                } ${glassFiltered?.width ?? ''}X${glassFiltered?.height ?? ''}`}`}</span>
                        ) : (
                            ''
                        )}
                    </>
                }
                buttonText="Consumir"
                buttonStyles="bg-red-500 hover:bg-red-600"
                buttonDisabled={!allowQuantityChange}
                isOpen={isGlassConsumerOpen}
                setIsOpen={setIsGlassConsumerOpen}
                onSubmit={(values) => {
                    const formResponse = values as { width: { width: number }; height: { height: number }; batch: {batch: string} }
                    onGlassConsumption({
                        ...formResponse,
                        width: formResponse?.width?.width,
                        height: formResponse?.height?.height,
                        batch: formResponse?.batch?.batch,
                    })
                }}
                initialValues={glassSelection ? { ...glassSelection, width: { id: 1, width: glassSelection?.width }, height: { id: 1, height: glassSelection?.height }, batch: { id: 1, batch: String(glassSelection?.batch) } } : null}
                render={(props) => {

                    const values = props.values as FormInputType

                    // eslint-disable-next-line no-unused-vars
                    const setFormAttribute = props.form.mutators.setFormAttribute as (fieldName: string, fieldVal: number | string | null | object | Date) => void

                    const formGlass: SuperGlass = {
                        ...values,
                        width: values?.width?.width,
                        height: values?.height?.height,
                        batch: values?.batch?.batch,
                    }


                    filterGlassData({ ...formGlass, difQuantity: String(props.values?.difQuantity) })


                    if (glassFiltered?.id && values.id !== glassFiltered.id) {
                        setFormAttribute('id', glassFiltered.id)
                        setFormAttribute('type', glassFiltered.type as object)
                        setFormAttribute('vendor', glassFiltered.vendor as object)
                        setFormAttribute('location', glassFiltered.location as object)
                        setFormAttribute('width', { id: 1, width: glassFiltered.width } as object)
                        setFormAttribute('height', { id: 1, height: glassFiltered.height } as object)
                        setFormAttribute('batch', { id: 1, batch: String(glassFiltered.batch) } as object)
                        setFormAttribute('quantity', glassFiltered.quantity)
                    }




                    return (
                        <>
                            <TextLine
                                label="id"
                                name="id"
                                className="hidden"
                                required={false}
                            />
                            <Combobox
                                label="Material"
                                name="type"
                                inputField="name"
                                options={getFieldOptions(formGlass).type as GlassType[]}
                            />
                            <Combobox
                                label="Descripción"
                                name="type"
                                inputField="description"
                                options={getFieldOptions(formGlass).type as GlassType[]}
                            />
                            <Combobox
                                label="Ancho"
                                name="width"
                                inputField="width"
                                className=" sm:col-span-2"
                                options={getFieldOptions(formGlass).width?.map((width, id) => {
                                    return { id: id + 1, width }
                                })}
                            />
                            <Combobox
                                label="Alto"
                                name="height"
                                inputField="height"
                                className=" sm:col-span-2"
                                options={getFieldOptions(formGlass).height?.map((height, id) => {
                                    return { id: id + 1, height }
                                })}
                            />
                            <Combobox
                                label="Lote"
                                name="batch"
                                inputField="batch"
                                className="sm:col-span-2"
                                options={getFieldOptions(formGlass).batch?.map((batch, id) => {
                                    return { id: id + 1, batch }
                                })}
                            />

                            <Combobox
                                label="Posición"
                                name="location"
                                inputField="position"
                                className=" sm:col-span-3"
                                options={getFieldOptions(formGlass).location as GlassLocation[]}
                            />
                            <Combobox
                                label="Proovedor"
                                name="vendor"
                                inputField="name"
                                className=" sm:col-span-3"
                                options={getFieldOptions(formGlass).vendor as GlassVendor[]}
                            />
                            <Numeric
                                label="Cantidad"
                                disabled={true}
                                name="quantity"
                                className=" sm:col-span-3"
                            />
                            <Numeric
                                label="Cantidad a Consumir"
                                name="difQuantity"
                                className=" sm:col-span-3"
                            />

                            <TextArea
                                label="Comentarios"
                                name="newComment"
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
                            <span className="text-sm font-normal text-slate-500">{`${` #${glassToEdit?.id ?? ''} ${glassToEdit?.type?.name ?? ''
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
                                label="Material"
                                name="type"
                                inputField="name"
                                options={typesData as GlassType[]}
                            />
                            <Combobox
                                label="Descripción"
                                name="type"
                                inputField="description"
                                options={typesData as GlassType[]}
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
                            <TextLine
                                label="Lote"
                                name="batch"
                                className=" sm:col-span-3"
                                required={false}
                            />
                            <DateField
                                label="Vencimiento"
                                name="expirationDate"
                                className=" sm:col-span-3"
                                required={false}
                            />

                            <Combobox
                                label="Proovedor"
                                name="vendor"
                                inputField="name"
                                className=" sm:col-span-3"
                                options={vendorsData as GlassVendor[]}
                            />
                            <Combobox
                                label="Posición"
                                name="location"
                                inputField="position"
                                className=" sm:col-span-3"
                                options={locationsData as GlassLocation[]}
                            />
                            <Numeric
                                label="Cantidad"
                                disabled={true}
                                name="quantity"
                            />

                            <TextArea
                                label="Comentarios"
                                name="newComment"
                            />
                        </>
                    )
                }}
            />

            {/*Formulario de Eliminación*/}
            <DialogForm
                title={`¿Desea eliminar el vidrio #${isNotNullUndefinedOrEmpty(glassToDelete) ? `${glassToDelete?.id ?? ''}` : ''
                    }?`}
                titleStyles="text-center"
                buttonText={`Eliminar #${isNotNullUndefinedOrEmpty(glassToDelete)
                    ? `${glassToDelete?.id ?? ''} ${glassToDelete?.type?.name ?? ''} ${glassToDelete?.width ?? ''
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
/*eslint-enable @typescript-eslint/no-floating-promises*/
/*eslint-enable @typescript-eslint/no-misused-promises*/
