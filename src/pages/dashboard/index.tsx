//Reacts
import React, { useState, useEffect, useMemo } from 'react'

//Next
import { type NextPage } from 'next'
import Head from 'next/head'

//Material UI
import { DataGridPremium as DataGrid, GridToolbar, type GridColDef } from '@mui/x-data-grid-premium'

//Axios
import axios from 'axios'

//Prisma
import { type Glass, type GlassType, type GlassVendor } from '@prisma/client'

//Custom Components
import Snackbar, { type AlertProps } from '../../components/snackbarAlert'

//Custom Constants
import GRID_DEFAULT_LOCALE_TEXT from '../../constants/localeTextConstants'

//Custom Types
interface SuperGlass extends Glass {
    type?: GlassType | null
    location?: SuperGlass | null
    vendor?: GlassVendor | null
    squaredMeters?: number
}

interface AggregatedObject {
    [key: string]: string | number
}

//Custom Functions

function groupAndAggregateObjects<T extends AggregatedObject>(
    arr: T[],
    groupByKeys: string[],
    aggregateKeys: string[],
) {
    const result: { [key: string]: AggregatedObject } = {}

    arr?.forEach((obj) => {
        const groupKey = groupByKeys.map((key) => obj[key]).join('-')

        if (!result[groupKey]) {
            result[groupKey] = { ...obj }
        } else {
            for (const key of aggregateKeys) {
                if (typeof obj[key] === 'number') {
                    (result[groupKey] as AggregatedObject)[key] =
                        Number((result[groupKey] as T)[key] || 0) + Number(obj[key])
                }
            }
        }
    })

    return Object.values(result)
}

/*eslint-disable @typescript-eslint/no-misused-promises*/
/*eslint-disable @typescript-eslint/no-floating-promises*/

const Home: NextPage = () => {
    //States
    const [snackbar, setSnackbar] = useState<AlertProps | null>(null)
    const [glassData, setGlassData] = useState<SuperGlass[] | null>(null)

    //- Fetch Functions
    const fetchGlassData = async (silenced = false) => {
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
            silenced || setSnackbar({ type: 'success', message: 'Vidrios Actualizados' })
        } catch (error) {
            console.error('Error fetching data:', error)
            setSnackbar({ type: 'warning', message: 'Error al obtener los vidrios' })
        }
    }

    //useEffect
    useEffect(() => {
        setTimeout(() => {
            const divs = document.getElementsByTagName('div')
            let licenseDiv
            for (let i = 0; i < divs.length; i++) {
                if (divs[i]?.innerText === 'MUI X Missing license key') {
                    licenseDiv = divs[i]
                }
            }

            licenseDiv?.remove()
        }, 200)
        fetchGlassData()
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    //DataGrid Definitions
    const rows = useMemo(() => {
        const glassDataParsed = glassData?.map((glass) => {
            return {
                typeName: glass.type?.name,
                typeDescription: glass.type?.description,
                width: glass.width,
                height: glass.height,
                squaredMeters: glass.squaredMeters,
                quantity: glass.quantity,
            }
        })

        const rows = groupAndAggregateObjects(
            glassDataParsed as AggregatedObject[],
            ['typeName', 'typeDescription', 'width', 'height'],
            ['squaredMeters', 'quantity'],
        )

        return rows
    }, [glassData])

    const columns: GridColDef[] = [
        {
            headerName: 'Código',
            width: 150,
            field: 'typeName',
            aggregable: false,
        },
        {
            headerName: 'Descripción',
            field: 'typeDescription',
            width: 350,
            aggregable: false,
        },
        {
            headerName: 'Ancho',
            field: 'width',
            width: 130,
            type: 'number',
            valueFormatter: ({ value }: { value: string }) => (value ? `${value} mm` : undefined),
        },
        {
            headerName: 'Alto',
            field: 'height',
            width: 130,
            type: 'number',
            valueFormatter: ({ value }: { value: string }) => (value ? `${value} mm` : undefined),
        },
        {
            headerName: 'Área',
            field: 'squaredMeters',
            width: 130,
            type: 'number',
            valueFormatter: ({ value }: { value: string }) =>
                value ? `${parseFloat(value).toFixed(0)} m²` : undefined,
        },
        {
            headerName: 'Cantidad',
            field: 'quantity',
            width: 130,
            type: 'number',
        },
    ]

    return (
        <>
            <Head>
                <title>Dashboard</title>
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
                    <h1 className="text-2xl font-semibold text-gray-700 sm:text-[2rem]">Dashboard</h1>
                    <div className="flex h-screen_3/4 w-auto max-w-full flex-col justify-center gap-4">
                        {glassData && (
                            <DataGrid
                                disableDensitySelector
                                localeText={GRID_DEFAULT_LOCALE_TEXT}
                                rows={rows}
                                columns={columns}
                                slots={{ toolbar: GridToolbar }}
                                getRowId={(row: AggregatedObject) =>
                                    `${String(row.typeName)}-${String(row.width)}-${String(row.height)}`
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
        </>
    )
}

export default Home
/*eslint-enable @typescript-eslint/no-floating-promises*/
/*eslint-enable @typescript-eslint/no-misused-promises*/
