"use client";
import InputComponent from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import DropDown from '@/components/ui/DropDown';
import { useAuthStore } from '@/store/authStore';
import { useMovementStore } from '@/store/movementStore';
import { useSeizedVehicleStore } from '@/store/siezed-vehical/seizeStore';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

const Page = () => {
    const { user } = useAuthStore();
    const { addVehicle, fetchByFir, vehical, getIdByFIR, getIdBySR, updateVehicalEntry } = useSeizedVehicleStore();
    const [existingId, setExistingId] = useState<string>("")

    const { fetchByFIR, entry } = useMovementStore()
    const [seizedBy, setSeizedBy] = useState<string>("");
    const [rtoName, setRTOName] = useState<string>("");
    const [caseProperty, setCaseProperty] = useState('');
    const [status, setStatus] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const statusOptions = ['Destroy', 'Nilami', 'Pending', 'Other', 'On Court'];
    const caseOptions = ['mv act', 'arto seized', 'BNS/IPC', 'EXCISE', 'SEIZED', 'UNCLAMMED VEHICLE'];
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

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };




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



            let success = false;
            if (existingId) {
                success = await updateVehicalEntry(existingId, fullVehicleData)
            } else {
                success = await addVehicle(fullVehicleData);
            }

            if (success) {
                toast.success("Data Added");
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


    const hanldeGet = async () => {

        try {
            let success = false;
            if (formData.firNo) {
                const data = await getIdByFIR(formData.firNo)
                setExistingId(data.data.id)
            }
            if (formData.srNo) {
                const data = await getIdBySR(formData.srNo)
                setExistingId(data.data.id)
            }


        } catch (error) {
            console.error("Error fetching by FIR:", error);
            toast.error("Fetch failed. See con  sole.");
        }

    }
    return (
        <div className='glass-effect'>
            <div>
                <div className='py-4 bg-maroon w-full rounded-t-xl border-b border-white/50 flex justify-center'>
                    <h1 className='text-2xl uppercase text-[#fdf8e8] font-semibold'>Seized Vehicle Entry</h1>
                </div>
                <div className='px-8 py-4 h-screen rounded-b-md'>
                    <div className='flex items-center gap-4'>
                        <div className=''>
                            <DropDown
                                label='Case Property'
                                selectedValue={caseProperty}
                                options={caseOptions}
                                handleSelect={setCaseProperty}
                            />
                        </div>
                        {(caseProperty === "mv act" || caseProperty === "arto seized") && (
                            <div>
                                <InputComponent
                                    label={caseProperty === "mv act" ? "Seized By" : "RTO Name"}
                                    value={caseProperty === "mv act" ? seizedBy : rtoName}
                                    setInput={(e) => {
                                        if (caseProperty === "mv act") {
                                            setSeizedBy(e.target.value);
                                        } else {
                                            setRTOName(e.target.value);
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <div className='mt-2 grid grid-cols-2 gap-2'>
                        {fields.map(field => {
                            if (field.name === 'firNo' && caseProperty === 'UNCLAMMED VEHICLE') {
                                return null;
                            }

                            return (
                                <div key={field.name} className='flex items-end gap-2'>
                                    {field.name === "status" ? (
                                        <DropDown
                                            selectedValue={status}
                                            options={statusOptions}
                                            label='Status'
                                            handleSelect={setStatus}
                                        />
                                    ) : (
                                        <InputComponent
                                            label={field.label}
                                            value={formData[field.name as keyof typeof formData]}
                                            setInput={e => handleInputChange(field.name, e.target.value)}
                                        />
                                    )}

                                    {/* Conditionally add buttons beside FIR or SR field */}
                                    {field.name === 'srNo' && (caseProperty === "mv act" || caseProperty === "UNCLAMMED VEHICLE") && (
                                        <Button className='bg-green-600 text-white' onClick={hanldeGet}>
                                            Search by SR
                                        </Button>
                                    )}
                                    {field.name === 'firNo' && !(caseProperty === "mv act" || caseProperty === "UNCLAMMED VEHICLE") && (
                                        <Button className='bg-purple-600 text-white' onClick={hanldeGet}>
                                            Get by FIR
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className='flex justify-center w-full'>
                        <div className='flex gap-8 px-12 mt-4'>
                            {["Save", "Modify"].map((item, index) => (
                                <Button
                                    key={index}
                                    onClick={() => {
                                        if (item === "Save") {
                                            handleSave();
                                        } else {
                                            console.log(`${item} clicked`);
                                        }
                                    }}
                                    className='bg-blue text-blue-100 flex cursor-pointer'
                                >
                                    {item}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;
