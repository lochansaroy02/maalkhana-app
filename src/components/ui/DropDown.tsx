import React, { Dispatch } from 'react'

interface DropDownProps {
    selectedValue: string,
    handleSelect: (value: string) => void,
    options: string[]
}
const DropDown = ({ selectedValue, options, handleSelect }: DropDownProps) => {
    return (
        <div className='w-full'>
            <select className='rounded-lg w-full  px-2 py-1  bg-neutral-100 ' value={selectedValue} onChange={(e) => { handleSelect(e.target.value) }}>
                <option disabled value="">select value</option>
                {

                    options.map((item) => (

                        <option value={item}>{item}</option>
                    ))
                }
            </select>
        </div>
    )
}

export default DropDown