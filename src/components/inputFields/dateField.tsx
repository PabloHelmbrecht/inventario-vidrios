//Final Form
import { Field } from 'react-final-form'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import Datepicker from 'tailwind-datepicker-react' 
import { useState } from 'react'
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/20/solid'




const requiredDecorator = (value: number | string): string | undefined => (value ? undefined : 'Requerido')







export default function DateField({
    label = 'Insert label',
    name = 'textline',
    placeholder = 'Seleccionar Fecha',
    className = '',
    required = true,
    disabled = false,
}: {
    label?: string
    name?: string
    placeholder?: string
    className?: string
    required?: boolean
    disabled?: boolean
}) {

    const options = {
        
        autoHide: true,
        todayBtn: true,
        clearBtn: true,
        todayBtnText: "Hoy",
        clearBtnText: 'Borrar',
        theme: {
            background: "bg-white ",
            todayBtn: "bg-sky-600 hover:bg-sky-600 text-white",
            clearBtn: "bg-red-500  hover:bg-red-600 text-white focus:ring-red-300 border-none",
            icons: "hover:text-white hover:bg-sky-600",
            text: "",
            disabledText: "text-gray-400",
            inputIcon: "",
            inputNameProp: name,
            selected: "bg-sky-600 hover:bg-sky-700 text-white	",
            input:"m-px w-fit rounded-md border-0 py-2 pr-3 pl-10 text-sm leading-5 bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 focus-visible:outline-0 sm:text-sm sm:leading-6"
        },
        icons: {
            // () => ReactElement | JSX.Element
            prev: () => <ArrowLeftIcon className='w-5'/>,
            next: () => <ArrowRightIcon className='w-5 '/>,
        },
        datepickerClassNames: "top-12",
        weekDays: ['L','M','X','J','V','S','D'],
        
        language: "es",
    }

    const [show, setShow] = useState <boolean> (false)

	const handleClose = (state: boolean) => {
		setShow(state)
	}




    return (
        <Field
            name={name}
            placeholder={placeholder}
            validate={required ? requiredDecorator : undefined}>
            {({ input, meta }) => (

                <div className={`col-span-full ${className}`}>
                    <label
                        htmlFor="about"
                        className="block text-sm font-medium leading-6 text-gray-900">
                        {label}
                        {meta.error ? <span className="text-xs italic  text-slate-500"> *{meta.error}</span> : ''}
                    </label>
                    <div className="mt-2">


                    <Datepicker placeholder={placeholder} options={options} {...input} disabled={disabled} show={show} setShow={handleClose} className="rounded-full" />



                    </div>
                </div>

            )}
        </Field>
    )
}
