//Final Form
import { Field } from 'react-final-form'

const required = (value: number | string): string | undefined => (value ? undefined : 'Requerido')
const mustBeNumber = (value: number | string): string | undefined =>
    isNaN(Number(value)) ? 'Debe ser un número' : undefined
const minValue =
    (min: number) =>
    (value: number | string): string | undefined =>
        isNaN(Number(value)) || Number(value) >= min ? undefined : `Debe ser mayor o igual que ${min}`
const composeValidators =
    (
        /* eslint-disable no-unused-vars */
        ...validators: ((value: number | string) => string | undefined)[]
    ): ((value: number | string) => string | undefined) =>
    (value: number | string): string | undefined =>
        validators.reduce((error: string | undefined, validator) => error || validator(value), undefined)

export default function NumericField({
    label = 'Insert label',
    name = 'numeric',
    placeholder = '',
    suffix = '',
    className = '',
    disabled = false,
}: {
    label?: string
    name?: string
    placeholder?: string
    suffix?: string
    className?: string
    disabled?: boolean
}) {
    return (
        <Field
            name={name}
            component="input"
            type="number"
            min="1"
            placeholder={placeholder}
            validate={composeValidators(required, mustBeNumber, minValue(1))}>
            {({ input, meta }) => (
                <div className={`col-span-full ${className}`}>
                    <label
                        htmlFor="about"
                        className="block text-sm font-medium leading-6 text-gray-900">
                        {label}
                        {meta.error ? <span className="text-xs italic  text-slate-500"> *{meta.error}</span> : ''}
                    </label>
                    <div className="relative mt-2	">
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <span className="text-gray-500 sm:text-sm">{suffix}</span>
                        </div>
                        <input
                            disabled={disabled ?? false}
                            {...input}
                            className="textfield-appearance m-px w-fit rounded-md border-0 py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 focus-visible:outline-0 sm:text-sm sm:leading-6"
                        />
                    </div>
                </div>
            )}
        </Field>
    )
}
