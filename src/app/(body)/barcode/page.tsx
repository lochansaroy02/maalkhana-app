"use client";
import InputComponent from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import BarcodeGenerator from './BarcodeGenerator';
import BarcodeScanner from './scanner';

const page = () => {


    const [formData, setFormData] = useState({
        firNo: '',
        srNo: '',
        id: ''
    });

    const fields = [
        { name: 'srNo', label: 'Sr. No' },
        { name: 'firNo', label: 'FIR No' },
        { name: 'id', label: 'ID' },
    ]

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = () => {
        console.log(formData)
    }
    return (
        <div>
            <div className='glass-effect'>
                <div className='bg-maroon rounded-t-xl py-4 border-b border-white/50 flex justify-center'>
                    <h1 className='text-2xl uppercase text-cream font-semibold'>BarCode Generte</h1>
                </div>
                <div className=' px-8 py-4 flex flex-col  glass-effect h-screen rounded-b-md'>
                    <div className='  '>
                        <div className='px-12 mt-12  flex flex-col gap-2  '>

                            {fields.map((field) => (
                                <div className='gap-4' key={field.name}>
                                    {
                                        <InputComponent label={field.label} value={formData[field.name as keyof typeof formData]} setInput={(e) => handleInputChange(field.name, e.target.value)} />
                                    }
                                </div>
                            ))}
                            <div className='flex justify-center'>
                                <Button
                                    onClick={handleSave}
                                    className='bg-blue border border-white/50  text-blue-50'>
                                    Save
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className='mt-8 flex justify-center'>
                        {(formData.firNo && formData.srNo && formData.id) && (
                            <BarcodeGenerator firNo={formData.firNo} srNo={formData.srNo} id={formData.id} />
                        )}
                    </div>
                    {/* <BarcodeScanner /> */}
                </div>
            </div>
        </div>
    )
}

export default page