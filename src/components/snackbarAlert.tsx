//React
import React from 'react'

//Hero Icons
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

//MUI
import Snackbar from '@mui/material/Snackbar'

export type AlertProps = {
    type: 'info' | 'warning' | 'success' | string
    message: string
}

export type SnackbarProps = {
    state: AlertProps | null
    setState: React.Dispatch<React.SetStateAction<AlertProps | null>>
    autoHideDuration?: number
}

export const Alert: React.FC<AlertProps> = ({ type, message }) => {
    let icon: JSX.Element | null
    let bgColor: string
    let borderColor: string
    let textColor: string

    switch (type) {
        case 'info':
            icon = <InformationCircleIcon className="mr-2" />
            bgColor = 'bg-blue-100'
            borderColor = 'border-blue-500'
            textColor = 'text-blue-800'
            break
        case 'warning':
            icon = <ExclamationTriangleIcon className="mr-2" />
            bgColor = 'bg-yellow-100'
            borderColor = 'border-yellow-500'
            textColor = 'text-yellow-800'
            break
        case 'success':
            icon = <CheckCircleIcon className="mr-2" />
            bgColor = 'bg-green-100'
            borderColor = 'border-green-500'
            textColor = 'text-green-800'
            break
        default:
            icon = null
            bgColor = 'bg-gray-100'
            borderColor = 'border-gray-500'
            textColor = 'text-gray-800'
            break
    }

    return (
        <div className={`rounded-md border-l-4 p-4 ${bgColor} ${borderColor} ${textColor}`}>
            {icon}
            <span>{message}</span>
        </div>
    )
}

export const SnackbarAlert: React.FC<SnackbarProps> = ({ state, setState, autoHideDuration = 6000 }) => {
    return (
        <>
            {!!state && (
                <Snackbar
                    open
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    onClose={() => setState(null)}
                    autoHideDuration={autoHideDuration}
                >
                    <Alert {...state} />
                </Snackbar>
            )}
        </>
    )
}

export default SnackbarAlert
