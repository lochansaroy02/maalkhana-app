
interface DropDownProps {
    selectedValue: string,
    handleSelect: (value: string) => void,
    options: string[]
}
const DropDown = ({ selectedValue, options, handleSelect }: DropDownProps) => {
    return (
        <div className='w-1/2'>
            <select className='rounded-lg w-full glass-effect text-blue-100  px-2 py-1  ' value={selectedValue} onChange={(e) => { handleSelect(e.target.value) }}>
                <option className='bg-blue' disabled value="">select value</option>
                {

                    options.map((item) => (

                        <option className='bg-blue ' value={item}>{item}</option>
                    ))
                }
            </select>
        </div>
    )
}

export default DropDown