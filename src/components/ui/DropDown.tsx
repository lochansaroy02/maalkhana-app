
interface DropDownProps {
    selectedValue: string,
    handleSelect: (value: string) => void,
    options: string[],
    label: string
}
const DropDown = ({ selectedValue, options, handleSelect, label }: DropDownProps) => {
    return (
        <div className=' gap-8 items-center  flex'>
            <label className="text-blue-100 text-nowrap  " htmlFor="">{label}</label>
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