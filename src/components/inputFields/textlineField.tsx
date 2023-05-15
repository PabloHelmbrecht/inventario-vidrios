//Final Form
import { Field } from 'react-final-form'

const required = (value: number | string): string | undefined => (value ? undefined : 'Requerido')

export default function TextlineField({
    label = 'Insert label',
    name = 'textline',
    placeholder = '',
    className = '',
}: {
    label?: string
    name?: string
    placeholder?: string
    className?: string
}) {
    return (
        <Field
            name={name}
            placeholder={placeholder}
            validate={required}
        >
            {({ input, meta }) => (
                <div className={`col-span-full ${className}`}>
                    <label
                        htmlFor="about"
                        className="block text-sm font-medium leading-6 text-gray-900"
                    >
                        {label}
                        {meta.error ? <span className="text-xs italic  text-slate-500"> *{meta.error}</span> : ''}
                    </label>
                    <div className="mt-2	">
                        <input
                            {...input}
                            className="textfield-appearance m-px w-fit rounded-md border-0 py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 focus-visible:outline-0 sm:text-sm sm:leading-6"
                        />
                    </div>
                </div>
            )}
        </Field>
    )
}
