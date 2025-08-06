"use client";
import InputComponent from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import DropDown from '@/components/ui/DropDown';
import { useAuthStore } from '@/store/authStore';
import { useSeizedVehicleStore } from '@/store/seizeStore';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

const Page = () => {


    const { user } = useAuthStore();
    const [seizedBy, setSeizedBy] = useState<string>("");
    const [rtoName, setRTOName] = useState<string>("");
    const { addVehicle } = useSeizedVehicleStore();
    const [formData, setFormData] = useState({
        srNo: '',
        firNo: '',
        gdNo: '',
        gdDate: '',
        underSection: '',
        vehicleType: '',
        colour: '',
        registrationNo: '',
        engineNo: '',
        description: '',
        status: '',
        policeStation: '',
        ownerName: '',

    });






    const [caseProperty, setCaseProperty] = useState('');
    const [status, setStatus] = useState<string>("");
    const statusOptions = ['Destroy', 'Nilami', 'Pending', 'Other', 'On Court'];
    const caseOptions = ['mv act', 'arto seized', 'BNS/IPC', 'EXCISE', 'SEIZED', 'UNCLAMMED VEHICLE'];


    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };


    const [isLoading, setIsLoading] = useState(false);
    const handleSave = async () => {
        try {
            setIsLoading(true);
            const userId = user?.id;
            const fullVehicleData = {
                ...formData,
                caseProperty,
                userId,
                seizedBy,
                rtoName,
                status,
            };

            const success = await addVehicle(fullVehicleData);
            if (success) {
                toast.success("Data Added")
                setFormData({
                    srNo: '',
                    firNo: '',
                    gdNo: '',
                    gdDate: '',
                    underSection: '207',
                    vehicleType: '',
                    colour: '',
                    registrationNo: '',
                    engineNo: '',
                    description: '',
                    status: '',
                    policeStation: '',
                    ownerName: '',
                });
                setCaseProperty('');
                setSeizedBy('');
                setRTOName('');
                setStatus('');
            }

        } catch (err) {
            console.error('Error saving vehicle:', err);
        } finally {
            setIsLoading(false);
        }
    };



    const fields = [
        { name: 'firNo', label: 'FIR no.' },
        { name: 'srNo', label: 'Sr. No / Mal No.' },
        { name: 'gdNo', label: 'GD No' },
        { name: 'gdDate', label: 'GD Date' },
        { name: 'underSection', label: 'Under Section' },
        { name: 'vehicleType', label: 'Vehicle Type' },
        { name: 'colour', label: 'Colour' },
        { name: 'registrationNo', label: 'Registration No.' },
        { name: 'engineNo', label: 'Engine No.' },
        { name: 'description', label: 'Description' },
        { name: 'status', label: 'status' },
        { name: 'policeStation', label: 'Police Station' },
        { name: 'ownerName', label: 'Owner Name' },
    ];

    return (
        <div className='  glass-effect  '>
            <div className=' '>
                <div className=' py-4  bg-maroon  w-full rounded-t-xl border-b border-white/50  flex justify-center'>
                    <h1 className='text-2xl uppercase  text-[#fdf8e8] font-semibold'>Seized Vehicle Entry </h1>
                </div>
                <div className=' text px-8 py-4 h-screen rounded-b-md'>
                    <div className='flex items-center  gap-4   '>
                        <div className=' w-1/2  '>
                            <DropDown label='Case Property' selectedValue={caseProperty} options={caseOptions} handleSelect={setCaseProperty} />
                        </div>
                        {(caseProperty === "mv act" || caseProperty === "arto seized") && (
                            <InputComponent
                                label={caseProperty === "mv act" ? "seizedBy" : "RTO Name"}
                                value={caseProperty === "mv act" ? seizedBy : rtoName}
                                setInput={(e) => {
                                    if (caseProperty === "mv act") {
                                        setSeizedBy(e.target.value);
                                    } else {
                                        setRTOName(e.target.value);
                                    }
                                }}
                            />
                        )}

                    </div>
                    <div className=' mt-2 grid grid-cols-2 gap-2 '>
                        {fields.map(field => {

                            // ✅ Skip FIR field if caseProperty is "UNCLAMMED VEHICLE"
                            if (field.name === 'firNo' && caseProperty === 'UNCLAMMED VEHICLE') {
                                return null;
                            }
                            return <div className=''>
                                {field.name === "status" ?
                                    <DropDown selectedValue={status} options={statusOptions} label='Status' handleSelect={setStatus} />

                                    : <div>
                                        < InputComponent
                                            className=''
                                            key={field.name}
                                            label={field.label}
                                            value={formData[field.name as keyof typeof formData]}
                                            setInput={e => handleInputChange(field.name, e.target.value)}
                                        />
                                    </div>
                                }
                            </div>
                        }
                        )}
                    </div>
                    <div className='flex justify-center w-full'>

                        <div className='flex gap-8  px-12     mt-4'>
                            {
                                ["Save", "Modify"].map((item: string, index: number) => (
                                    <Button
                                        onClick={() => {
                                            if (item === "Save") {
                                                handleSave()
                                            } else {
                                                console.log(`${item} clicked`);
                                            }
                                        }}
                                        className={`bg-blue text-blue-100  flex cursor-pointer
                                    `} key={index}>{item}</Button>
                                ))
                            }
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Page;