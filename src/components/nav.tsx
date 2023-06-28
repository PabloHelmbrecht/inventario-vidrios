'use client'

import { Fragment, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { signIn, signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import { useRouter } from 'next/router'

const navigation = [
    { name: 'Inventario de Vidrios', href: '/' },
    //{ name: 'Movimientos', href: '/movimientos' },
    { name: 'Materiales', href: '/materiales' },
    { name: 'Almacén', href: '/almacen' },
    { name: 'Proovedores', href: '/proovedores' },
    { name: 'Historial', href: '/historial' },
    { name: 'Usuarios', href: '/usuarios' },
    { name: 'Dashboard', href: '/dashboard' },
]

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export default function Navbar() {
    const pathname = usePathname()
    const { data: session, status } = useSession()
    const user = session?.user

    const router = useRouter()

    useEffect(() => {
        if (
            status === 'unauthenticated' &&
            router.pathname !== '/auth/signin' &&
            process.env.NODE_ENV !== 'development'
        ) {
            void router.push('/auth/signin')
        }
    }, [router, status])

    return (
        <Disclosure
            as="nav"
            className="bg-white shadow-sm">
            {({ open }) => (
                <>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between">
                            <div className="flex">
                                <div className="flex flex-shrink-0 items-center">
                                    <svg
                                        width="32"
                                        height="32"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 1000 1000">
                                        <defs>
                                            <style>{'.cls-2{fill:#003a57}'}</style>
                                        </defs>
                                        <g
                                            id="Capa_2"
                                            data-name="Capa 2">
                                            <g
                                                id="Capa_1-2"
                                                data-name="Capa 1">
                                                <circle
                                                    cx={500}
                                                    cy={500}
                                                    r={500}
                                                    style={{
                                                        fill: '#ffce00',
                                                    }}
                                                />
                                                <path
                                                    d="M471.24 203.6c0 26.66 0 53.32.05 80 0 2.55-.15 4-3.41 3.94q-38.62-.21-77.24 0c-3.27 0-3.42-1.39-3.41-3.94q.11-40 0-80ZM612.46 203.6v80c0 2.55-.14 4-3.41 3.94q-38.62-.21-77.24 0c-3.27 0-3.42-1.39-3.41-3.94q.1-40 0-80ZM685 475.72V600.5c0 3.81 1.25 8.26-.3 11.28-2.09 4.05-1.25 7.85-1.56 11.75-.29 3.63.71 7.45-2 10.64.87 9-3 17.28-4.06 26a81.07 81.07 0 0 1-6.08 21.22c-2.72 6.5-4.86 13.29-8.05 19.52-4.18 8.17-9.23 15.9-14 23.73-7.4 12.05-17.22 22.13-27.78 31.27-7.67 6.64-16.5 12-25.13 17.44-12.83 8.06-27.74 11.29-41.58 17-3 1.26-6.32.25-9.79 1.69-5.16 2.13-11.39 1.7-17.16 2.32-6.09.66-12.18 1.52-18.29 1.84s-12.08.14-18.12 0c-4.89-.08-9.65.17-14.56-1.65-4.43-1.65-9.92 1.24-14.38-2.14-7.16.7-13.67-2-20.36-3.81-5.17-1.36-10.49-2.27-15.48-4.1-5.5-2-10.68-4.9-16-7.33-8.79-4-16.38-9.78-24.21-15.32-10.13-7.17-18.15-16.45-26.6-25.22-5.37-5.56-9.41-12.47-13.57-19.08-3.13-5-5.46-10.43-8.19-15.65-6.2-11.82-10.32-24.32-13.58-37.28-2.43-9.65-3.77-19.41-5.78-29.07-1.35-6.49-.24-13.15-1.9-19.2-2.82-10.28-1.51-20.51-1.53-30.72q-.3-118.59-.11-237.18a31.05 31.05 0 0 0-.06-5.71c-.74-3.93 1.38-4.28 4.35-3.91a17.37 17.37 0 0 0 1.91 0h100.16c6.21 0 6.23 0 6.23 6.71q0 128.6.09 257.19a100.51 100.51 0 0 0 2 19.19c1.22 6.15 2.35 12.38 3.93 18.39 1.7 6.43 4.91 12.61 8.26 18.44a61.49 61.49 0 0 0 18.3 19.86c9 6.15 19.07 11.19 30.71 10.9 5.4-.13 10.81-.12 16.21 0 19.86.43 35.47-8.55 47.44-23.27 7.63-9.39 11.89-20.92 14.48-33 1.93-9 2.7-18 4.07-27 1.71-11.27 1.19-22.39 1.45-33.57s.06-22.22.06-33.34V348c0-9.06 0-9.06 8.65-9.06h93.48c1.91 0 3.83.1 5.72 0s3 .36 2.86 2.52 0 4.45 0 6.67Z"
                                                    className="cls-2"
                                                />
                                            </g>
                                        </g>
                                    </svg>
                                </div>
                                <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                                    {navigation.map((item) => (
                                        <a
                                            key={item.name}
                                            href={item.href}
                                            className={classNames(
                                                pathname === item.href
                                                    ? 'border-slate-500 text-gray-900'
                                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium',
                                            )}
                                            aria-current={pathname === item.href ? 'page' : undefined}>
                                            {item.name}
                                        </a>
                                    ))}
                                </div>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:items-center">
                                <Menu
                                    as="div"
                                    className="relative ml-3">
                                    <div>
                                        <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
                                            <span className="sr-only">Open user menu</span>
                                            <Image
                                                className="h-8 w-8 rounded-full"
                                                src={
                                                    user?.image ||
                                                    'https://media.licdn.com/dms/image/C4E0BAQETbxjnoHj6FQ/company-logo_200_200/0/1651757588440?e=1691020800&v=beta&t=WGCW5Yt44ABVeptgPOyQQiXrdoPNGvANCSWv4BrMh4U'
                                                }
                                                height={32}
                                                width={32}
                                                alt={`${user?.name || 'placeholder'} avatar`}
                                            />
                                        </Menu.Button>
                                    </div>
                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-200"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-75"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95">
                                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                            {user ? (
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <button
                                                            className={classNames(
                                                                active ? 'bg-gray-100' : '',
                                                                'flex w-full px-4 py-2 text-sm text-gray-700',
                                                            )}
                                                            onClick={() => {
                                                                void signOut()
                                                            }}>
                                                            Cerrar Sesión
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                            ) : (
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <button
                                                            className={classNames(
                                                                active ? 'bg-gray-100' : '',
                                                                'flex w-full px-4 py-2 text-sm text-gray-700',
                                                            )}
                                                            onClick={() => {
                                                                void signIn('google')
                                                            }}>
                                                            Ingresar
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                            )}
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
                            </div>
                            <div className="-mr-2 flex items-center sm:hidden">
                                <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
                                    <span className="sr-only">Open main menu</span>
                                    {open ? (
                                        <XMarkIcon
                                            className="block h-6 w-6"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <Bars3Icon
                                            className="block h-6 w-6"
                                            aria-hidden="true"
                                        />
                                    )}
                                </Disclosure.Button>
                            </div>
                        </div>
                    </div>

                    <Disclosure.Panel className="sm:hidden">
                        <div className="space-y-1 pb-3 pt-2">
                            {navigation.map((item) => (
                                <Disclosure.Button
                                    key={item.name}
                                    as="a"
                                    href={item.href}
                                    className={classNames(
                                        pathname === item.href
                                            ? 'border-slate-500 bg-slate-50 text-slate-700'
                                            : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800',
                                        'block border-l-4 py-2 pl-3 pr-4 text-base font-medium',
                                    )}
                                    aria-current={pathname === item.href ? 'page' : undefined}>
                                    {item.name}
                                </Disclosure.Button>
                            ))}
                        </div>
                        <div className="border-t border-gray-200 pb-3 pt-4">
                            {user ? (
                                <>
                                    <div className="flex items-center px-4">
                                        <div className="flex-shrink-0">
                                            <Image
                                                className="h-8 w-8 rounded-full"
                                                src={
                                                    user.image ??
                                                    'https://media.licdn.com/dms/image/C4E0BAQETbxjnoHj6FQ/company-logo_200_200/0/1651757588440?e=1691020800&v=beta&t=WGCW5Yt44ABVeptgPOyQQiXrdoPNGvANCSWv4BrMh4U'
                                                }
                                                height={32}
                                                width={32}
                                                alt={`${user.name ?? ''} avatar`}
                                            />
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-base font-medium text-gray-800">{user.name}</div>
                                            <div className="text-sm font-medium text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                    <div className="mt-3 space-y-1">
                                        <button
                                            onClick={() => {
                                                void signOut()
                                            }}
                                            className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800">
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="mt-3 space-y-1">
                                    <button
                                        onClick={() => {
                                            void signIn('google')
                                        }}
                                        className="flex w-full px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800">
                                        Ingresar
                                    </button>
                                </div>
                            )}
                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    )
}
