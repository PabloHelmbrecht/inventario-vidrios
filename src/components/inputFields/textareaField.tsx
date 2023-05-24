//Final Form
import { Field } from 'react-final-form'

export default function TextareaField({
    label = 'Insert label',
    name = 'textarea',
    placeholder = '',
    className = '',
    disabled = false,
}: {
    label?: string
    name?: string
    placeholder?: string
    className?: string
    disabled?: boolean
}) {
    return (
        <Field
            name={name}
            placeholder={placeholder}>
            {({ input, meta }) => (
                <div className={`col-span-full ${className}`}>
                    <label
                        htmlFor='about'
                        className='block text-sm font-medium leading-6 text-gray-900'>
                        {label}
                        {meta.error ? <span className='text-xs italic  text-slate-500'> *{meta.error}</span> : ''}
                    </label>
                    <div className='mt-2	'>
                        <textarea
                            disabled={disabled ?? false}
                            {...input}
                            rows={3}
                            className='m-px block w-fit w-full rounded-md border-0 py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 focus-visible:outline-0 sm:text-sm sm:leading-6'
                        />
                    </div>
                </div>
            )}
        </Field>
    )
}
