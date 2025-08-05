import InputComponent from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import DropDown from '@/components/ui/DropDown';
import { useDistrictStore } from '@/store/districtStore';
import { upDistricts } from '@/utils/districtData';
import { X } from 'lucide-react';
import { useState } from 'react';


type modalProps = {
    isModalOpen: boolean,
    setIsModalOpen: (value: boolean) => void
}
const AddUser = ({ setIsModalOpen, isModalOpen }: modalProps) => {
    const { addDistrict } = useDistrictStore()
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleClick = () => {
        if (name === '' || email === '' || password === '') {
            alert("please enter all field")
        } else {
            const data = { name, email, password }
            addDistrict(data)
        }
    }


    return (
        <div className='bg-black/80 absolute backdrop-blur-3xl z-20 inset-0   flex pt-12  justify-center w-full h-full'>
            <div className='glass-effect w-3/4 h-3/4  relative  flex flex-col items-center '>
                <Button onClick={() => setIsModalOpen(false)} className='absolute right-2 top-2  cursor-pointer rounded-full bg-red-900'> <X /></Button>
                <h1 className='text-blue-100 mt-8  text-xl'>Add User</h1>
                <div className='  px-2 py-1 gap-2 flex    mt-16 flex-col'>
                    <div className='flex flex-col gap-2 '>
                        <DropDown label='District' options={upDistricts} selectedValue={name} handleSelect={setName} />
                        <InputComponent label='Email' value={email} setInput={(e) => { setEmail(e.target.value) }} />
                        <InputComponent label='Password' value={password} setInput={(e) => { setPassword(e.target.value) }} />
                    </div>
                    <div className='flex justify-center'>

                        <Button onClick={handleClick} className='bg-blue'>Add </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddUser