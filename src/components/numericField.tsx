//Final Form
import { Field } from 'react-final-form'

export default function NumericField({
    label = 'Insert label',
    name = 'numeric',
    placeholder = '',
}: {
    label?: string
    name?: string
    placeholder?: string
}) {
    return (
        <div className="col-span-full">
            <label
                htmlFor="about"
                className="block text-sm font-medium leading-6 text-gray-900"
            >
                {label}
            </label>
            <div className="mt-2s	">
                <Field
                    name={name}
                    component="input"
                    type="number"
                    min="1"
                    placeholder={placeholder}
                    className="textfield-appearance m-px w-fit rounded-md border-0 py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 focus-visible:outline-0 sm:text-sm sm:leading-6"
                />
            </div>
        </div>
    )
}
