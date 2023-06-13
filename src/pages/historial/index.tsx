//Reacts
import React, { useState, useEffect, useMemo } from 'react'

//Next
import { type NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'

//Material UI
import { DataGridPremium as DataGrid, GridToolbar, type GridColDef } from '@mui/x-data-grid-premium'

//Axios
import axios from 'axios'

//Prisma
import { type User, type GlassMovement } from '@prisma/client'

//Custom Components
import Snackbar, { type AlertProps } from '../../components/snackbarAlert'

//Custom Constants
import GRID_DEFAULT_LOCALE_TEXT from '../../constants/localeTextConstants'

const columnDictionary: { [key: string]: string } = {
    id: 'ID del Vidrio',
    typeId: 'ID del Material',
    status: 'Estado',
    quantity: 'Cantidad',
    createdAt: 'Creado En',
    updatedAt: 'Actualizado En',
    locationId: 'ID de la Posición',
    width: 'Ancho',
    height: 'Alto',
    vendorId: 'ID del Proovedor',
    Comment: 'Comentario',
}

/*eslint-disable @typescript-eslint/no-misused-promises*/
/*eslint-disable @typescript-eslint/no-floating-promises*/

const Home: NextPage = () => {
    //States
    const [snackbar, setSnackbar] = useState<AlertProps | null>(null)
    const [movementsData, setMovementsData] = useState<GlassMovement[] | null>(null)

    //- Fetch Functions
    const fetchMovementsData = async () => {
        try {
            const cachedResponse: GlassMovement[] = JSON.parse(
                localStorage.getItem('movementsData') ?? '{}',
            ) as GlassMovement[]
            setMovementsData(cachedResponse)

            const response = await axios.get(`/api/movement`)
            if (response.data === null) throw new Error('No hay movimientos')
            localStorage.setItem('movementsData', JSON.stringify(response.data))
            setMovementsData(response.data as GlassMovement[])
            setSnackbar({ type: 'success', message: 'Historial Actualizado' })
        } catch (error) {
            console.error('Error fetching data:', error)
            setSnackbar({
                type: 'warning',
                message: 'Error al obtener el historial',
            })
        }
    }

    //useEffect
    useEffect(() => {

        const divs = document.getElementsByTagName("div")
        let licenseDiv
        for(let i = 0; i < divs.length; i++){
            if(divs[i]?.innerText==='MUI X Missing license key'){
                licenseDiv = divs[i]
            }
        }
        licenseDiv?.remove()


        fetchMovementsData()
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    //DataGrid Definitions
    const rows: GlassMovement[] = useMemo(() => movementsData as GlassMovement[], [movementsData])

    const columns: GridColDef[] = [
        {
            headerName: 'Id',
            field: 'id',
            width: 70,
            type: 'number',
            valueFormatter: (params) => (params?.value ? `#${String(params?.value)}` : undefined),
        },
        {
            headerName: 'Vidrio',
            field: 'glassId',
            width: 70,
            type: 'number',
            valueFormatter: (params) => (params?.value ? `#${String(params?.value)}` : undefined),
        },
        {
            headerName: 'Usuario',
            field: 'user',
            width: 200,
            valueFormatter: ({ value }: { value?: User }) =>
                value ? `${String(value.name)} ${String(value.email)}` : undefined,
            renderCell: ({ value }: { value?: User }) =>
                value && (
                    <div
                        className={`${
                            value.role === 'ADMIN'
                                ? 'bg-yellow-50 text-yellow-700 ring-yellow-700/10'
                                : 'bg-slate-50 text-slate-700 ring-slate-700/10 '
                        } flex items-center gap-3 overflow-hidden rounded-md px-2 py-1.5 text-xs font-medium ring-1 ring-inset `}>
                        <Image
                            className="h-5 w-5 rounded-full"
                            src={
                                value?.image ||
                                'https://media.licdn.com/dms/image/C4E0BAQETbxjnoHj6FQ/company-logo_200_200/0/1651757588440?e=1691020800&v=beta&t=WGCW5Yt44ABVeptgPOyQQiXrdoPNGvANCSWv4BrMh4U'
                            }
                            height={32}
                            width={32}
                            alt={`${value?.name || 'placeholder'} avatar`}
                        />
                        <div className="text-xs font-medium">{value?.name}</div>
                    </div>
                ),
        },

        {
            headerName: 'Columna',
            field: 'column',
            width: 130,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            valueFormatter: (params) => (params?.value ? columnDictionary[String(params?.value)] : undefined),
        },
        {
            headerName: 'Valor Anterior',
            field: 'oldValue',
            width: 160,
        },
        {
            headerName: 'Valor Nuevo',
            field: 'newValue',
            width: 160,
        },

        {
            headerName: 'Actualizado En',
            field: 'updatedAt',
            width: 150,
            type: 'dateTime',
            valueGetter: ({ value }: { value: string }) => (value ? new Date(value) : undefined),
        },
    ]

    return (
        <>
            <Head>
                <title>Historial de Cambios</title>
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
                    <h1 className="text-2xl font-semibold text-gray-700 sm:text-[2rem]">Historial de Cambios</h1>
                    <div className="flex h-screen_3/4  w-full max-w-full  flex-col justify-center gap-4">
                        {movementsData && (
                            <DataGrid
                                disableDensitySelector
                                localeText={GRID_DEFAULT_LOCALE_TEXT}
                                rows={rows}
                                columns={columns}
                                slots={{ toolbar: GridToolbar }}
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
        </>
    )
}

export default Home
/*eslint-enable @typescript-eslint/no-floating-promises*/
/*eslint-enable @typescript-eslint/no-misused-promises*/