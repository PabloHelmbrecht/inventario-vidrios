//Reacts
import React, { useState, useEffect, useMemo } from 'react'

//React Final Form
import { type FormRenderProps } from 'react-final-form'

//Zod
import { z } from 'zod'

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
import { type Glass, type GlassMaterial, type GlassLocation, type GlassVendor, type User } from '@prisma/client'

//Day JS
import dayjs from 'dayjs'

//Env variables
import { env } from '~/env.mjs'

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
import { isNotNullUndefinedOrEmpty, isValidDate } from '../utils/variableChecker'
import eliminateLicenseKey from '../utils/eliminateLicenseKey'
import convertFloat from '~/utils/convertFloat'

//Custom Constants
import GRID_DEFAULT_LOCALE_TEXT from '../constants/localeTextConstants'
import { useSession } from 'next-auth/react'

//Custom Types
interface SuperGlass extends Glass {
    material?: GlassMaterial | null
    location?: GlassLocation | null
    vendor?: GlassVendor | null
    squaredMeters?: number
    type?: string
    weight?: number
}

interface RowType extends SuperGlass {
    materialName?: string
    materialDescription?: string
    materialCreatedAt?: Date
    materialUpdatedAt?: Date
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
    batch?: { id: number; batch: string }
    projectReservation?: { id: number; projectReservation: string }
}

interface formResponseType {
    id?: number
    material: { id: number }
    location?: { id: number }
    destinyLocation?: { id: number }
    vendor: { id: number }
    width: number
    height: number
    quantity: number
    batch?: string
    projectReservation?: string
    expirationDate?: Date
    newComment?: string
    difQuantity?: string | number
}

/*eslint-disable @typescript-eslint/no-misused-promises*/
/*eslint-disable @typescript-eslint/no-floating-promises*/

const Home: NextPage = () => {
    const { data: session } = useSession()

    const user = session?.user ?? {
        name: 'MANTENIMIENTO UVEG',
        email: 'mantenimiento@uveg.ar',
        image: null,
        id: 'clid221kv0000lq0h3tvno38h',
    }

    //States
    const [glassSelection, setGlassSelection] = useState<
        (SuperGlass & { difQuantity?: number; destinyLocation?: GlassLocation }) | null
    >(null)
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
    const [materialsData, setMaterialsData] = useState<GlassMaterial[] | null>(null)
    const [locationsData, setLocationsData] = useState<GlassLocation[] | null>(null)
    const [vendorsData, setVendorsData] = useState<GlassVendor[] | null>(null)
    const [usersData, setUsersData] = useState<User[] | null>(null)

    //User admin verification
    const foundUser = usersData?.find((user: User) => user.id === session?.user?.id)
    const isAdmin = env.NEXT_PUBLIC_NODE_ENV !== 'development' ? foundUser?.role === 'ADMIN' : true
    const isViewer = env.NEXT_PUBLIC_NODE_ENV !== 'development' ? foundUser?.role === 'VIEWER' : false

    //Functions
    //- Submit Functions
    const onGlassCreation = async (formResponse: object) => {
        try {
            const {
                material,
                width,
                height,
                vendor,
                location,
                quantity,
                batch,
                projectReservation,
                expirationDate,
                newComment,
            } = formResponse as formResponseType
            const response = await axios.post('/api/glasses', {
                user,
                glass: {
                    materialId: material.id,
                    width,
                    height,
                    vendorId: vendor.id,
                    locationId: location?.id !== null ? location?.id : undefined,
                    quantity,
                    batch,
                    projectReservation,
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
            const {
                id,
                quantity,
                difQuantity,
                newComment,
                material,
                width,
                height,
                vendor,
                batch,
                projectReservation,
                expirationDate,
                location,
                destinyLocation,
            } = formResponse as formResponseType

            const newQuantity = Number(quantity) - Number(difQuantity)

            if (newQuantity < 0) {
                setSnackbar({ type: 'warning', message: 'No se puede consumir más vidrio del existente' })

                return
            }

            //Muevo todo el vidrio solamente cambia de posición
            if (newQuantity === 0) {
                const response = await axios.patch(`/api/glasses/${Number(id)}`, {
                    user,
                    glass: {
                        quantity: difQuantity,
                        Comment: newComment,
                        materialId: material.id,
                        width,
                        height,
                        vendorId: vendor.id,
                        locationId: destinyLocation?.id,
                        batch,
                        projectReservation,
                        expirationDate,
                    },
                })

                if (response.data === null) throw new Error('No se obtuvo respuesta')
            }
            //Creo un vidrio nuevo igual pero con difquantity y modifico el vidrio anterior con newquantity
            else {
                const oldGlass = await axios.patch(`/api/glasses/${Number(id)}`, {
                    user,
                    glass: {
                        materialId: material.id,
                        quantity: newQuantity,
                        height,
                        width,
                        locationId: location?.id,
                        vendorId: vendor.id,
                        Comment: newComment,
                        batch,
                        projectReservation,
                        expirationDate,
                    },
                })

                const newGlass = await axios.post('/api/glasses', {
                    user,
                    glass: {
                        materialId: material.id,
                        quantity: difQuantity,
                        height,
                        width,
                        vendorId: vendor.id,
                        locationId: destinyLocation?.id,
                        Comment: newComment,
                        batch,
                        projectReservation,
                        expirationDate,
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
            const {
                id,
                quantity,
                difQuantity,
                newComment,
                material,
                width,
                height,
                vendor,
                batch,
                projectReservation,
                expirationDate,
                location,
            } = formResponse as formResponseType

            const newQuantity = Number(quantity) - Number(difQuantity)

            if (newQuantity < 0) {
                setSnackbar({ type: 'warning', message: 'No se puede consumir más vidrio del existente' })

                return
            }

            const response = await axios.patch(`/api/glasses/${Number(id)}`, {
                user,
                glass: {
                    quantity: newQuantity,
                    Comment: newComment,
                    materialId: material.id,
                    width,
                    height,
                    vendorId: vendor.id,
                    locationId: location?.id,
                    batch,
                    projectReservation,
                    expirationDate,
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
            const response = await axios.delete(`/api/glasses/${Number(id)}`)
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

            const {
                material,
                width,
                height,
                vendor,
                location,
                newComment,
                quantity,
                batch,
                projectReservation,
                expirationDate,
            } = formResponse as formResponseType

            const response = await axios.patch(`/api/glasses/${Number(id)}`, {
                user,
                glass: {
                    materialId: material.id,
                    width,
                    height,
                    quantity,
                    vendorId: vendor.id,
                    locationId: location?.id,
                    Comment: newComment,
                    batch,
                    projectReservation,
                    expirationDate,
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
    const fetchGlassData = async (silenced = false) => {
        try {
            const cachedResponse: SuperGlass[] = JSON.parse(localStorage.getItem('glassData') ?? '{}') as SuperGlass[]
            setGlassData(cachedResponse)
            const response = await axios.get('/api/glasses', {
                params: {
                    status: 'TRANSIT,STORED',
                },
            })
            if (response.data === null) throw new Error('No hay vidrios')
            localStorage.setItem('glassData', JSON.stringify(response.data))
            setGlassData(response.data as SuperGlass[])
            silenced || setSnackbar({ type: 'success', message: 'Vidrios Actualizados' })

            const cachedResponseWithConsumed: SuperGlass[] = JSON.parse(
                localStorage.getItem('glassDataWithConsumed') ?? '{}',
            ) as SuperGlass[]
            setGlassDataWithConsumed(cachedResponseWithConsumed)
            const responseWithConsumed = await axios.get('/api/glasses')
            if (responseWithConsumed.data === null) throw new Error('No hay vidrios')
            localStorage.setItem('glassDataWithConsumed', JSON.stringify(responseWithConsumed.data))
            setGlassDataWithConsumed(responseWithConsumed.data as SuperGlass[])
        } catch (error) {
            console.error('Error fetching data:', error)
            setSnackbar({ type: 'warning', message: 'Error al obtener los vidrios' })
        }
    }

    const fetchMaterialsData = async () => {
        try {
            const cachedResponse: GlassMaterial[] = JSON.parse(
                localStorage.getItem('materialsData') ?? '{}',
            ) as GlassMaterial[]
            setMaterialsData(cachedResponse)

            const response = await axios.get('/api/materials')
            if (response.data === null) throw new Error('No hay materiales')
            localStorage.setItem('materialsData', JSON.stringify(response.data))
            setMaterialsData(response.data as GlassMaterial[])
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
            setVendorsData(response.data as GlassMaterial[])
            //setSnackbar({ type: 'success', message: 'Proovedores Actualizados' })
        } catch (error) {
            console.error('Error fetching data:', error)
            setSnackbar({
                type: 'warning',
                message: 'Error al obtener los proovedores de vidrio',
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

    // - Form Functions

    function getFieldOptions(glass: SuperGlass) {
        const foundGlasses = glassData?.filter((glassToCompare: SuperGlass) => {
            let response = true

            if (glass.vendor?.name && glass.vendor?.name !== glassToCompare.vendor?.name) {
                response = false
            }

            if (glass.batch && glass.batch !== glassToCompare.batch) {
                response = false
            }

            if (glass.projectReservation && glass.projectReservation !== glassToCompare.projectReservation) {
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

            if (glass.material?.name && glass.material?.name !== glassToCompare.material?.name) {
                response = false
            }

            return response
        })

        return {
            id: [...new Set(foundGlasses?.map((glass) => glass.id))],
            material: [...new Set(foundGlasses?.map((glass) => glass.material))],
            location: [...new Set(foundGlasses?.map((glass) => glass.location))],
            vendor: [...new Set(foundGlasses?.map((glass) => glass.vendor))],
            width: [...new Set(foundGlasses?.map((glass) => glass.width))],
            height: [...new Set(foundGlasses?.map((glass) => glass.height))],
            batch: [...new Set(foundGlasses?.map((glass) => String(glass.batch)))],
            projectReservation: [...new Set(foundGlasses?.map((glass) => String(glass.projectReservation)))],
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

            if (glass.projectReservation && glass.projectReservation !== glassToCompare.projectReservation) {
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

            if (glass.material?.name && glass.material?.name !== glassToCompare.material?.name) {
                response = false
            }

            return response
        })

        if (foundGlass?.length === 1 && foundGlass) {
            setGlassFiltered(foundGlass[0] as SuperGlass)
        } else {
            setGlassFiltered(null)
        }

        if (glassFiltered && foundGlass && Number(glass?.difQuantity) <= Number(foundGlass[0]?.quantity)) {
            setAllowQuantityChange(true)
            //setGlassSelection(null)
        } else {
            setAllowQuantityChange(false)
        }
    }

    function processDynamicForm(props: FormRenderProps) {
        const values = props.values as FormInputType

        // eslint-disable-next-line no-unused-vars
        const setFormAttribute = props.form.mutators.setFormAttribute as (
            // eslint-disable-next-line no-unused-vars
            fieldName: string,
            // eslint-disable-next-line no-unused-vars
            fieldVal: number | string | null | object | Date,
        ) => void

        if (glassSelection?.id && values.id !== glassSelection.id) {
            setFormAttribute('id', glassSelection.id)
            setFormAttribute('material', glassSelection.material as object)
            setFormAttribute('vendor', glassSelection.vendor as object)
            setFormAttribute('location', glassSelection.location as object)
            setFormAttribute('width', { id: 1, width: glassSelection.width })
            setFormAttribute('height', { id: 1, height: glassSelection.height })
            setFormAttribute('batch', { id: 1, batch: glassSelection.batch })
            setFormAttribute('projectReservation', { id: 1, projectReservation: glassSelection.projectReservation })
            setFormAttribute('quantity', glassSelection.quantity)
        }

        const formGlass: SuperGlass = {
            ...values,
            width: values?.width?.width,
            height: values?.height?.height,
            batch: values?.batch?.batch,
            projectReservation: values?.projectReservation?.projectReservation,
        }

        filterGlassData({ ...formGlass, difQuantity: String(props.values?.difQuantity) })

        if (glassFiltered?.id && values.id !== glassFiltered.id) {
            setFormAttribute('id', glassFiltered.id)
            setFormAttribute('material', glassFiltered.material as object)
            setFormAttribute('vendor', glassFiltered.vendor as object)
            setFormAttribute('location', glassFiltered.location as object)
            setFormAttribute('width', { id: 1, width: glassFiltered.width })
            setFormAttribute('height', { id: 1, height: glassFiltered.height })
            setFormAttribute('batch', { id: 1, batch: glassFiltered.batch })
            setFormAttribute('projectReservation', { id: 1, projectReservation: glassFiltered.projectReservation })
            setFormAttribute('quantity', glassFiltered.quantity)
        }

        return formGlass
    }

    //useEffect
    useEffect(() => {
        eliminateLicenseKey()
        fetchGlassData()
        fetchMaterialsData()
        fetchLocationsData()
        fetchVendorsData()
        fetchUsersData()

        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        fetchGlassData(true)
    }, [isGlassMoverOpen, isGlassConsumerOpen, isGlassCreatorOpen, glassToDelete, glassToEdit])

    useEffect(() => {
        setGlassFiltered(null)
    }, [isGlassMoverOpen, isGlassConsumerOpen])

    //DataGrid Definitions
    const rows: RowType[] = useMemo(() => {
        return (seeConsumedGlass ? glassDataWithConsumed : glassData)?.map((row) => {
            return {
                ...row,
                materialName: row.material?.name,
                materialDescription: row.material?.description,
                materialCreatedAt: row.material?.createdAt,
                materialUpdatedAt: row.material?.updatedAt,
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
            field: 'materialName',
            aggregable: false,
        },

        {
            headerName: 'Descripción',
            field: 'materialDescription',
            width: 200,
            aggregable: false,
        },
        {
            headerName: 'Ancho',
            field: 'width',
            width: 110,
            type: 'number',
            valueFormatter: ({ value }: { value: number }) => (value ? `${convertFloat(value)} mm` : undefined),
        },
        {
            headerName: 'Alto',
            field: 'height',
            width: 110,
            type: 'number',
            valueFormatter: ({ value }: { value: number }) => (value ? `${convertFloat(value)} mm` : undefined),
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
            headerName: 'Peso',
            field: 'weight',
            width: 100,
            type: 'number',
            valueFormatter: ({ value }: { value: string }) =>
                value ? `${parseFloat(value).toFixed(0)} kg` : undefined,
        },
        {
            headerName: 'Tipo',
            field: 'type',
            width: 80,
            renderCell: (params) => {
                const typeSchema = z.enum(['Small', 'Jumbo']).optional()

                const type = typeSchema.parse(params?.value)

                if (type === undefined) {
                    return undefined
                }

                const options = {
                    Small: {
                        text: 'En Tránsito',
                        ringColor: 'ring-cyan-700/10',
                        backgroundColor: 'bg-cyan-50',
                        textColor: 'text-cyan-800',
                    },
                    Jumbo: {
                        text: 'En Tránsito',
                        ringColor: 'ring-indigo-700/10',
                        backgroundColor: 'bg-indigo-50',
                        textColor: 'text-indigo-800',
                    },
                }

                return (
                    <div
                        className={` ${options[type].ringColor} ${options[type].backgroundColor} ${options[type].textColor} inline-flex items-center  rounded-md  px-2 py-1 align-middle text-xs font-medium ring-1 ring-inset`}>
                        {type}
                    </div>
                )
            },
        },

        {
            headerName: 'Cantidad',
            field: 'quantity',
            width: 130,
            type: 'number',
            valueFormatter: ({ value }: { value: number }) => (value ? convertFloat(value) : undefined),
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
            headerName: 'Reserva',
            field: 'projectReservation',
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
            valueGetter: ({ value }: { value: string }) => value ? new Date(value) : undefined,

            groupable: false,
            renderCell: (params) => {
                const expirationDate = new Date(params?.value as Date)
                if (!isValidDate(expirationDate) || !params?.value) return undefined
                const today = new Date()
                const daysUntilExpirationDate = (expirationDate.getTime() - today.getTime()) / (1000 * 3600 * 24)
                const yellowWarningDays = isNaN(Number(env.NEXT_PUBLIC_YELLOW_WARNING_DAYS ?? 30))
                    ? 30
                    : Number(env.NEXT_PUBLIC_YELLOW_WARNING_DAYS ?? 30)
                const orangeWarningDays = isNaN(Number(env.NEXT_PUBLIC_ORANGE_WARNING_DAYS ?? 15))
                    ? 15
                    : Number(env.NEXT_PUBLIC_ORANGE_WARNING_DAYS ?? 15)

                if (daysUntilExpirationDate <= 0)
                    return <span className="text-red-500">{dayjs(params?.value as Date).format('DD/MM/YYYY')}</span>
                if (daysUntilExpirationDate <= orangeWarningDays)
                    return <span className="text-orange-500">{dayjs(params?.value as Date).format('DD/MM/YYYY')}</span>
                if (daysUntilExpirationDate <= yellowWarningDays)
                    return <span className="text-yellow-500">{dayjs(params?.value as Date).format('DD/MM/YYYY')}</span>

                return <span>{dayjs(params?.value as Date).format('DD/MM/YYYY')}</span>
            },
        },
        {
            headerName: 'Creado En',
            field: 'createdAt',
            width: 150,
            type: 'dateTime',
            valueGetter: ({ value }: { value: string }) => value ? new Date(value) : undefined,

            groupable: false,
        },
        {
            headerName: 'Actualizado En',
            field: 'updatedAt',
            width: 150,
            type: 'dateTime',
            valueGetter: ({ value }: { value: string }) => value ? new Date(value) : undefined,

            groupable: false,
        },
        {
            field: 'Acciones',
            type: 'actions',
            width: 80,
            getActions: ({ row }: { row: GridValidRowModel }) =>
                row.id
                    ? isAdmin
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
                                  label="Edit"
                                  onClick={() => setGlassToEdit(row as RowType)}
                              />,
                          ]
                        : isViewer
                        ? []
                        : [
                              <GridActionsCellItem
                                  key={1}
                                  icon={<PencilSquareIcon className="w-4" />}
                                  label="Edit"
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
                                    disabled={!(glassData && materialsData && vendorsData && locationsData) || isViewer}
                                    className=" rounded-md border border-transparent bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:bg-slate-500">
                                    Cargar
                                </button>
                                <button
                                    onClick={() => {
                                        setIsGlassMoverOpen(true)
                                    }}
                                    disabled={!(glassData && materialsData && vendorsData && locationsData) || isViewer}
                                    className=" rounded-md border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:bg-slate-500">
                                    Mover
                                </button>

                                <button
                                    onClick={() => {
                                        setIsGlassConsumerOpen(true)
                                    }}
                                    disabled={!(glassData && materialsData && vendorsData && locationsData) || isViewer}
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
                                onRowSelectionModelChange={(ids) => {
                                    const glassSelected = rows.find((row) => row.id === ids[0]) as RowType
                                    setGlassSelection(
                                        glassSelected
                                            ? {
                                                  id: glassSelected?.id,
                                                  materialId: glassSelected?.materialId,
                                                  status: glassSelected?.status,
                                                  quantity: glassSelected?.quantity,
                                                  createdAt: glassSelected?.createdAt,
                                                  updatedAt: glassSelected?.updatedAt,
                                                  locationId: glassSelected?.locationId,
                                                  width: glassSelected?.width,
                                                  height: glassSelected?.height,
                                                  vendorId: glassSelected?.vendorId,
                                                  batch: glassSelected?.batch,
                                                  projectReservation: glassSelected?.projectReservation,
                                                  expirationDate: glassSelected?.expirationDate,
                                                  Comment: glassSelected?.Comment,
                                                  material: glassSelected?.material,
                                                  location: glassSelected?.location,
                                                  vendor: glassSelected?.vendor,
                                                  squaredMeters: glassSelected?.squaredMeters,
                                                  weight: glassSelected?.weight,
                                                  type: glassSelected?.type,
                                              }
                                            : null,
                                    )
                                }}
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
                                            materialDescription: false,
                                            locationWarehouse: false,
                                            vendorName: false,
                                            weight: false,
                                            type: false,
                                            expirationDate: false,
                                            createdAt: false,
                                            updatedAt: false,
                                            projectReservation: false,
                                        },
                                    },
                                    aggregation: {
                                        model: {
                                            quantity: 'sum',
                                            squaredMeters: 'sum',
                                            weight: 'sum',
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

            {/*Formulario de Carga*/}
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
                                name="material"
                                inputField="name"
                                options={materialsData as GlassMaterial[]}
                            />
                            <Combobox
                                label="Descripción"
                                name="material"
                                inputField="description"
                                options={materialsData as GlassMaterial[]}
                            />
                            <Numeric
                                label="Ancho"
                                suffix="mm"
                                name="width"
                                className=" sm:col-span-3"
                            />
                            <Numeric
                                label="Alto"
                                name="height"
                                suffix="mm"
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
                                placeholder="PL816088"
                                name="batch"
                                required={false}
                                className=" sm:col-span-3"
                            />
                            <DateField
                                label="Vencimiento"
                                name="expirationDate"
                                className=" sm:col-span-3"
                                required={false}
                            />
                            <TextLine
                                label="Reserva"
                                name="projectReservation"
                                required={false}
                                className=" sm:col-span-3"
                                placeholder='Carpintería Moras S.A. | Huergo'
                            />
                            <Numeric
                                label="Cantidad"
                                name="quantity"
                                className=" sm:col-span-3"
                            />
                            <TextArea
                                label="Comentarios"
                                name="newComment"
                                placeholder='Escribe acá tus comentarios'
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
                            <span className="text-sm font-normal text-slate-500">{`${` #${glassFiltered?.id ?? ''} ${
                                glassFiltered?.material?.name ?? ''
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
                    const formResponse = values as {
                        width: { width: number }
                        height: { height: number }
                        batch: { batch: string }
                        projectReservation: { projectReservation: string }
                    }
                    onGlassMovement({
                        ...formResponse,
                        width: formResponse?.width?.width,
                        height: formResponse?.height?.height,
                        batch: formResponse?.batch?.batch,
                        projectReservation: formResponse?.projectReservation?.projectReservation,
                    })
                }}
                render={(props) => {
                    const formGlass = processDynamicForm(props)

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
                                name="material"
                                inputField="name"
                                options={getFieldOptions(formGlass).material as GlassMaterial[]}
                            />
                            <Combobox
                                label="Descripción"
                                name="material"
                                inputField="description"
                                options={getFieldOptions(formGlass).material as GlassMaterial[]}
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
                                required={false}
                                options={getFieldOptions(formGlass).batch?.map((batch, id) => {
                                    return { id: id + 1, batch: batch !== 'null' ? batch : null }
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
                                label="Reserva"
                                name="projectReservation"
                                inputField="projectReservation"
                                required={false}
                                options={getFieldOptions(formGlass).projectReservation?.map(
                                    (projectReservation, id) => {
                                        return {
                                            id: id + 1,
                                            projectReservation:
                                                projectReservation !== 'null' ? projectReservation : null,
                                        }
                                    },
                                )}
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
                                placeholder='Escribe acá tus comentarios'
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
                            <span className="text-sm font-normal text-slate-500">{`${` #${glassFiltered?.id ?? ''} ${
                                glassFiltered?.material?.name ?? ''
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
                    const formResponse = values as {
                        width: { width: number }
                        height: { height: number }
                        batch: { batch: string }
                        projectReservation: { projectReservation: string }
                    }
                    onGlassConsumption({
                        ...formResponse,
                        width: formResponse?.width?.width,
                        height: formResponse?.height?.height,
                        batch: formResponse?.batch?.batch,
                        projectReservation: formResponse?.projectReservation?.projectReservation,
                    })
                }}
                render={(props) => {
                    const formGlass = processDynamicForm(props)

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
                                name="material"
                                inputField="name"
                                options={getFieldOptions(formGlass).material as GlassMaterial[]}
                            />
                            <Combobox
                                label="Descripción"
                                name="material"
                                inputField="description"
                                options={getFieldOptions(formGlass).material as GlassMaterial[]}
                            />
                            <Combobox
                                label="Ancho"
                                name="width"
                                inputField="width"
                                className=" sm:col-span-3"
                                options={getFieldOptions(formGlass).width?.map((width, id) => {
                                    return { id: id + 1, width }
                                })}
                            />
                            <Combobox
                                label="Alto"
                                name="height"
                                inputField="height"
                                className=" sm:col-span-3"
                                options={getFieldOptions(formGlass).height?.map((height, id) => {
                                    return { id: id + 1, height }
                                })}
                            />
                            <Combobox
                                label="Lote"
                                name="batch"
                                inputField="batch"
                                className="sm:col-span-3"
                                required={false}
                                options={getFieldOptions(formGlass).batch?.map((batch, id) => {
                                    return { id: id + 1, batch: batch !== 'null' ? batch : null }
                                })}
                            />

                            <Combobox
                                label="Reserva"
                                name="projectReservation"
                                inputField="projectReservation"
                                className="sm:col-span-3"
                                required={false}
                                options={getFieldOptions(formGlass).projectReservation?.map(
                                    (projectReservation, id) => {
                                        return {
                                            id: id + 1,
                                            projectReservation:
                                                projectReservation !== 'null' ? projectReservation : null,
                                        }
                                    },
                                )}
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
                                placeholder='Escribe acá tus comentarios'
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
                                glassToEdit?.material?.name ?? ''
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
                                name="material"
                                inputField="name"
                                options={materialsData as GlassMaterial[]}
                            />
                            <Combobox
                                label="Descripción"
                                name="material"
                                inputField="description"
                                options={materialsData as GlassMaterial[]}
                            />
                            <Numeric
                                label="Ancho"
                                name="width"
                                suffix="mm"
                                className=" sm:col-span-3"
                            />
                            <Numeric
                                label="Alto"
                                name="height"
                                suffix="mm"
                                className=" sm:col-span-3"
                            />
                            <TextLine
                                label="Lote"
                                name="batch"
                                placeholder='PL816088'
                                required={false}
                                className=" sm:col-span-3"
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
                            <TextLine
                                label="Reserva"
                                name="projectReservation"
                                required={false}
                                className=" sm:col-span-3"
                                placeholder='Carpintería Moras S.A. | Huergo'
                            />
                            <Numeric
                                label="Cantidad"
                                disabled={true}
                                name="quantity"
                                className=" sm:col-span-3"
                            />

                            <TextArea
                                label="Comentarios"
                                name="newComment"
                                placeholder='Escribe acá tus comentarios'
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
                        ? `${glassToDelete?.id ?? ''} ${glassToDelete?.material?.name ?? ''} ${
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
/*eslint-enable @typescript-eslint/no-floating-promises*/
/*eslint-enable @typescript-eslint/no-misused-promises*/
