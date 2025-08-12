"use client";
import InputComponent from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import DropDown from '@/components/ui/DropDown';
import { useAuthStore } from '@/store/authStore';
import { useSeizedVehicleStore } from '@/store/siezed-vehical/seizeStore';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

const Page = () => {
    const { user } = useAuthStore();
    const { addVehicle, getData, updateVehicalEntry } = useSeizedVehicleStore();
    const [existingId, setExistingId] = useState<string>("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedResultId, setSelectedResultId] = useState<string>('');
    const [seizedBy, setSeizedBy] = useState<string>("");
    const [rtoName, setRTOName] = useState<string>("");

    // ✅ FIX 1: 'underSection' is now fully controlled by its own state.
    const [underSection, setUnderSection] = useState('');

    const [caseProperty, setCaseProperty] = useState('');
    const [status, setStatus] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const statusOptions = ['Destroy', 'Nilami', 'Pending', 'Other', 'On Court'];
    const caseOptions = ['mv act', 'arto seized', 'BNS/IPC', 'EXCISE', 'SEIZED', 'UNCLAMMED VEHICLE'];

    // ✅ FIX 2: 'underSection' is removed from the initial formData.
    const [formData, setFormData] = useState({
        srNo: '', firNo: '', gdNo: '', gdDate: '', vehicleType: '', colour: '', registrationNo: '', engineNo: '', description: '', status: '', policeStation: '', ownerName: '',
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // ✅ FIX 3: Implement the logic to auto-set 'underSection' when 'caseProperty' changes.
    useEffect(() => {
        if (caseProperty === 'mv act') {
            setUnderSection('207');
        }
        else {
            setUnderSection('')
        }
    }, [caseProperty]);

    const clearForm = () => {
        setFormData({
            srNo: '', firNo: '', gdNo: '', gdDate: '', vehicleType: '', colour: '', registrationNo: '', engineNo: '', description: '', status: '', policeStation: '', ownerName: '',
        });
        setCaseProperty('');
        setSeizedBy('');
        setRTOName('');
        setStatus('');
        setExistingId('');
        setUnderSection(''); // Also clear the separate underSection state
    };

    const handleSave = async () => {
        try {
            setIsLoading(true);
            const userId = user?.id;
            // ✅ FIX 4: Add the separate 'underSection' state to the final data object.
            const fullVehicleData = {
                ...formData, caseProperty, userId, seizedBy, rtoName, status, underSection,
            };

            let success = false;
            if (existingId) {
                success = await updateVehicalEntry(existingId, fullVehicleData);
                toast.success("Data Updated");
            } else {
                success = await addVehicle(fullVehicleData);
                toast.success("Data Added");
            }

            if (success) {
                clearForm();
                setSearchResults([]);
                setSelectedResultId('');
            }
        } catch (err) {
            console.error('Error saving vehicle:', err);
            toast.error("An error occurred during save.");
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

    const formFill = (data: any) => {
        if (!data) return;
        const recordId = data.id || data._id;
        setFormData({
            srNo: data?.srNo || '', firNo: data?.firNo || '', gdNo: data?.gdNo || '', gdDate: data?.gdDate || '', vehicleType: data?.vehicleType || '', colour: data?.colour || '', registrationNo: data?.registrationNo || '', engineNo: data?.engineNo || '', description: data?.description || '', status: data?.status || '', policeStation: data?.policeStation || '', ownerName: data?.ownerName || '',
        });
        setCaseProperty(data?.caseProperty || '');
        setSeizedBy(data?.seizedBy || '');
        setRTOName(data?.rtoName || '');
        setStatus(data?.status || '');
        setExistingId(recordId);
        setUnderSection(data?.underSection || ''); // Also fill the separate underSection state
    };

    const handleGet = async () => {
        setSearchResults([]);
        setSelectedResultId('');
        // Do not clear the form here, so the user can see what they searched for
        try {
            const { success, data } = await getData(formData.firNo, formData.srNo);
            if (success && data) {
                const dataArray = Array.isArray(data) ? data : [data];
                if (dataArray.length > 1) {
                    setSearchResults(dataArray);
                    toast.success(`${dataArray.length} records found. Please select one.`);
                } else if (dataArray.length === 1) {
                    toast.success("Data fetched");
                    formFill(dataArray[0]);
                    setSelectedResultId(dataArray[0].id || dataArray[0]._id);
                } else { toast.error("No data found."); }
            } else { toast.error("No data found or fetch failed."); }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Fetch failed. See console.");
        }
    };

    const handleResultSelectionChange = (resultId: string) => {
        setSelectedResultId(resultId);
        const selectedData = searchResults.find(item => (item.id || item._id) === resultId);
        if (selectedData) {
            formFill(selectedData);
        }
    };

    return (
        <div className='glass-effect'>
            <div>
                <div className='py-4 bg-maroon w-full rounded-t-xl border-b border-white/50 flex justify-center'>
                    <h1 className='text-2xl uppercase text-[#fdf8e8] font-semibold'>Seized Vehicle Entry</h1>
                </div>
                <div className='px-8 py-4 min-h-screen rounded-b-md'>
                    <div className='flex items-center gap-4'>
                        <div className=''>
                            <DropDown label='Case Property' selectedValue={caseProperty} options={caseOptions} handleSelect={setCaseProperty} />
                        </div>
                        {(caseProperty === "mv act" || caseProperty === "arto seized") && (
                            <div>
                                <InputComponent
                                    label={caseProperty === "mv act" ? "Seized By" : "RTO Name"}
                                    value={caseProperty === "mv act" ? seizedBy : rtoName}
                                    setInput={(e) => {
                                        if (caseProperty === "mv act") setSeizedBy(e.target.value);
                                        else setRTOName(e.target.value);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    {searchResults.length > 1 && (
                        <div className="my-4 col-span-2 flex flex-col gap-1">
                            <label className='text-blue-100'>Multiple Records Found. Please Select One:</label>
                            <div className="glass-effect p-3 rounded-md grid grid-cols-2 md:grid-cols-4 gap-3">
                                {searchResults.map((item: any) => (
                                    <div key={item.id || item._id} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            id={`result-${item.id || item._id}`}
                                            name="resultSelection"
                                            className="form-radio h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500 cursor-pointer"
                                            checked={selectedResultId === (item.id || item._id)}
                                            onChange={() => handleResultSelectionChange(item.id || item._id)}
                                        />
                                        <label htmlFor={`result-${item.id || item._id}`} className="text-blue-100 cursor-pointer">{item.firNo ? `FIR: ${item.firNo}` : ''} {item.srNo ? `SR: ${item.srNo}` : ''}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className='mt-2 grid grid-cols-2 gap-2'>
                        {fields.map(field => {
                            if (field.name === 'firNo' && (caseProperty === 'UNCLAMMED VEHICLE' || caseProperty === 'mv act')) return null;

                            // ✅ FIX 5: Special rendering for the 'underSection' field
                            if (field.name === 'underSection') {
                                return (
                                    <div key={field.name} className='flex items-end gap-2'>
                                        <InputComponent
                                            label={field.label}
                                            value={underSection}
                                            setInput={e => setUnderSection(e.target.value)}
                                        />
                                    </div>
                                );
                            }

                            if (field.name === 'status') {
                                return (
                                    <div key={field.name} className='flex items-end gap-2'>
                                        <DropDown selectedValue={status} options={statusOptions} label='Status' handleSelect={setStatus} />
                                    </div>
                                );
                            }

                            return (
                                <div key={field.name} className='flex items-end gap-2'>
                                    <InputComponent label={field.label} value={formData[field.name as keyof typeof formData]} setInput={e => handleInputChange(field.name, e.target.value)} />
                                    {field.name === 'srNo' && (caseProperty === "mv act" || caseProperty === "UNCLAMMED VEHICLE") && (
                                        <Button className='bg-green-600 text-white' onClick={handleGet}>Search</Button>
                                    )}
                                    {field.name === 'firNo' && (
                                        <Button className='bg-purple-600 text-white' onClick={handleGet}>Get by FIR</Button>
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
                                    onClick={() => { if (item === "Save" || item === "Modify") handleSave(); }}
                                    className='bg-blue text-blue-100 flex cursor-pointer'
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Saving..." : item}
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