interface DropDownProps {
    selectedValue: string,
    handleSelect: (value: string) => void,
    // It's good practice to type this more specifically
    options: { value: string, label: string }[],
    selectValueLabel?: string,
    label?: string
}

const DropDown = ({ selectedValue, options, handleSelect, selectValueLabel = "select value", label }: DropDownProps) => {
    return (
        <div className='flex flex-col gap-2 w-full'>
            <label className="text-blue-100 text-nowrap" htmlFor={label}>{label}</label>
            <select
                id={label} // Good for accessibility
                className='rounded-lg w-full glass-effect text-blue-100 px-2 py-1'
                value={selectedValue}
                onChange={(e) => { handleSelect(e.target.value) }}
            >
                <option className='bg-blue' disabled value="">{selectValueLabel}</option>
                {
                    // FIX: Map over the options and use `item.value` and `item.label`
                    options.map((item) => (
                        <option
                            key={item.value} // Added key prop to fix the warning
                            className='bg-blue px-2'
                            value={item.value} // Use the value for the option's value
                        >
                            {item.label} {/* Use the label for the displayed text */}
                        </option>
                    ))
                }
            </select>
        </div>
    )
}

export default DropDown;