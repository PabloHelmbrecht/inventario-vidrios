//React
import React from 'react'

//Hero Icons
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

//MUI
import Snackbar from '@mui/material/Snackbar'
import Slide, { type SlideProps } from '@mui/material/Slide'

type TransitionProps = Omit<SlideProps, 'direction'>

function TransitionUp(props: TransitionProps) {
    return (
        <Slide
            {...props}
            direction="up"
        />
    )
}

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
    let textColor: string

    switch (type) {
        case 'info':
            icon = <InformationCircleIcon className="mr-2 w-5" />
            bgColor = 'bg-blue-200'

            textColor = 'text-blue-800'
            break
        case 'warning':
            icon = <ExclamationTriangleIcon className="mr-2 w-5" />
            bgColor = 'bg-red-200'

            textColor = 'text-red-800'
            break
        case 'success':
            icon = <CheckCircleIcon className="mr-2 w-5" />
            bgColor = 'bg-emerald-200'

            textColor = 'text-emerald-800'
            break
        default:
            icon = null
            bgColor = 'bg-gray-200'

            textColor = 'text-gray-800'
            break
    }

    return (
        <div className={`flex items-center rounded-md p-3 ${bgColor} ${textColor}`}>
            {icon}
            <span>{message}</span>
        </div>
    )
}

export const SnackbarAlert: React.FC<SnackbarProps> = ({ state, setState, autoHideDuration = 2000 }) => {
    return (
        <>
            {!!state && (
                <Snackbar
                    TransitionComponent={TransitionUp}
                    open
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    onClose={() => setState(null)}
                    autoHideDuration={autoHideDuration}>
                    <div className="mb-4">
                        <Alert {...state} />
                    </div>
                </Snackbar>
            )}
        </>
    )
}

export default SnackbarAlert
