//Reacts
import React, { useState, useEffect, useMemo } from 'react'

//Next Auth
import { useSession } from 'next-auth/react'

//Next
import { type NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'

//Hero Icons
import { PencilSquareIcon } from '@heroicons/react/24/outline'

//Material UI
import { DataGrid, GridToolbar, GridActionsCellItem, type GridColDef, type GridValidRowModel } from '@mui/x-data-grid'

//Axios
import axios from 'axios'

//Prisma
import { type User } from '@prisma/client'

//Custom Components
import DialogForm from '../../components/dialogForm'
import TextLine from '~/components/inputFields/textlineField'
import Snackbar, { type AlertProps } from '../../components/snackbarAlert'

//Custom Functions
import { isNotNullUndefinedOrEmpty } from '../../server/variableChecker'

//Custom Constants
import GRID_DEFAULT_LOCALE_TEXT from '../../constants/localeTextConstants'
import ComboboxField from '~/components/inputFields/comboboxField'

interface formResponseType {
    id?: string
    role: (typeof userRoles)[0]
}

const userRoles = [
    {
        id: 1,
        role: 'USER',
        name: 'Usuario',
        ringColor: 'ring-slate-700/10',
        backgroundColor: 'bg-slate-50',
        textColor: 'text-slate-800',
    },
    {
        id: 2,
        role: 'ADMIN',
        name: 'Administrador',
        ringColor: 'ring-yellow-700/10',
        backgroundColor: 'bg-yellow-50',
        textColor: 'text-yellow-800',
    },
]

/*eslint-disable @typescript-eslint/no-misused-promises*/
/*eslint-disable @typescript-eslint/no-floating-promises*/

const Home: NextPage = () => {
    const { data: session } = useSession()
    const isAdmin = session?.user?.role === 'ADMIN'

    //States
    const [snackbar, setSnackbar] = useState<AlertProps | null>(null)
    const [userToEdit, setUserToEdit] = useState<User | null>(null)
    const [usersData, setUsersData] = useState<User[] | null>(null)

    //Functions
    //- Submit Functions

    const onUserEdit = async (formResponse: object) => {
        try {
            const { role } = (formResponse as formResponseType).role
            const { id } = formResponse as formResponseType

            const response = await axios.patch(`/api/user/${String(id)}`, {
                role,
            })
            if (response.data === null) throw new Error('No se obtuvo respuesta')
            setSnackbar({ type: 'success', message: 'Rol editado exitosamente' })

            fetchUsersData()
        } catch (error) {
            console.error('Error deleting glass:', error)
            setSnackbar({ type: 'warning', message: 'Error al editar el rol' })
        }
    }

    //- Fetch Functions
    const fetchUsersData = async () => {
        try {
            const cachedResponse: User[] = JSON.parse(localStorage.getItem('usersData') ?? '{}') as User[]
            setUsersData(cachedResponse)

            const response = await axios.get(`/api/user`)
            if (response.data === null) throw new Error('No hay usuarios')
            localStorage.setItem('usersData', JSON.stringify(response.data))
            setUsersData(response.data as User[])
            setSnackbar({ type: 'success', message: 'Usuarios Actualizados' })
        } catch (error) {
            console.error('Error fetching data:', error)
            setSnackbar({
                type: 'warning',
                message: 'Error al obtener los usuarios',
            })
        }
    }

    //useEffect
    useEffect(() => {
        fetchUsersData()
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    //DataGrid Definitions
    const rows: User[] = useMemo(() => usersData as User[], [usersData])

    let columns: GridColDef[] = [
        {
            headerName: 'Nombre',
            width: 200,
            field: 'name',
            renderCell: (params) => {
                const name = params?.value ? String(params?.value) : ''

                const image = (params?.row as User)?.image ? String((params?.row as User)?.image) : false

                return (
                    name && (
                        <div className={'flex items-center gap-3 overflow-hidden  px-2 py-1.5 text-xs font-medium '}>
                            <Image
                                className="h-5 w-5 rounded-full"
                                src={
                                    image ||
                                    `https://ui-avatars.com/api/?name=${encodeURI(
                                        name,
                                    )}&background=random&rounded=true&size=40&length=1` ||
                                    'https://media.licdn.com/dms/image/C4E0BAQETbxjnoHj6FQ/company-logo_200_200/0/1651757588440?e=1691020800&v=beta&t=WGCW5Yt44ABVeptgPOyQQiXrdoPNGvANCSWv4BrMh4U'
                                }
                                height={40}
                                width={40}
                                alt={`${name || 'placeholder'} avatar`}
                            />
                            <div className="text-xs font-medium">{name}</div>
                        </div>
                    )
                )
            },
        },
        {
            headerName: 'Correo',
            field: 'email',
            width: 250,
        },
        {
            headerName: 'Rol',
            field: 'role',
            width: 150,
            renderCell: (params) => {
                if (params?.value) {
                    const foundRole = userRoles.filter((role) => role.role === params.value)[0]
                    if (foundRole) {
                        return (
                            <div
                                className={` ${foundRole.ringColor} ${foundRole.backgroundColor} ${foundRole.textColor} inline-flex items-center  rounded-md  px-2 py-1 align-middle text-xs font-medium ring-1 ring-inset`}>
                                {foundRole.name}
                            </div>
                        )
                    }
                }

                return undefined
            },
            valueFormatter: (params) => {
                if (params?.value) {
                    const foundRole = userRoles.filter((role) => role.role === params.value)[0]
                    if (foundRole) {
                        return foundRole.name
                    }
                }

                return undefined
            },
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
                        icon={<PencilSquareIcon className="w-4" />}
                        label="Edit"
                        onClick={() => setUserToEdit(row as User)}
                    />,
                ],
            },
        ]
    }

    return (
        <>
            <Head>
                <title>Listado de Usuarios</title>
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
                    <h1 className="text-2xl font-semibold text-gray-700 sm:text-[2rem]">Listado de Usuarios</h1>
                    <div className="flex h-screen_3/4 w-auto max-w-full flex-col justify-center gap-4">
                        {usersData && (
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

            {/*Formulario de Edición*/}
            <DialogForm
                title={
                    <>
                        Editar Usuario
                        {isNotNullUndefinedOrEmpty(userToEdit) ? (
                            <span className="text-sm font-normal text-slate-500">{`   ${userToEdit?.name ?? ''}`}</span>
                        ) : (
                            ''
                        )}
                    </>
                }
                buttonText="Editar"
                isOpen={isNotNullUndefinedOrEmpty(userToEdit)}
                setIsOpen={(value) => {
                    value || setUserToEdit(null)
                }}
                onSubmit={onUserEdit}
                initialValues={{
                    id: userToEdit?.id,
                    role: userRoles.filter((role) => role.role === userToEdit?.role)[0],
                }}
                render={() => {
                    return (
                        <>
                            <TextLine
                                label="id"
                                name="id"
                                className="hidden"
                                required={false}
                            />
                            <ComboboxField
                                label="Rol"
                                name="role"
                                inputField="name"
                                options={userRoles}
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
