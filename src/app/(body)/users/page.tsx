"use client";
import { Button } from '@/components/ui/button';
import { useDistrictStore } from '@/store/districtStore';
import { Eye, Pen, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import AddUser from './AddUser';

const Page = () => {
    const { fetchDistricts, data } = useDistrictStore();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

    useEffect(() => {
        fetchDistricts();
    }, []);


    return (
        <div className='glass-effect relative  min-h-screen p-4'>
            {isModalOpen && <AddUser setIsModalOpen={setIsModalOpen} isModalOpen={isModalOpen} />}
            <div className='bg-maroon py-4 border border-gray-400 rounded-t-xl flex justify-center'>
                <h1 className='text-2xl uppercase text-[#fdf8e8] font-semibold'>Users</h1>
            </div>
            <div className='flex justify-end px-12 items-center py-1    glass-noRound  rounded-b-xl'>
                <Button onClick={() => setIsModalOpen(true)} className='bg-blue cursor-pointer'>Add User</Button>
            </div>
            <div className="overflow-x-auto mt-4 glass-effect shadow-md rounded-md">
                <table className="min-w-full divide-y  divide-blue-900/50 text-sm text-left">
                    <thead className="">
                        <tr>
                            <th className="px-6 py-3 font-semibold text-blue-100">#</th>
                            <th className="px-6 py-3 font-semibold text-blue-100">District Name</th>
                            <th className="px-6 py-3 font-semibold text-blue-100">Email</th>
                            <th className="px-6 py-3 font-semibold text-blue-100">Created At</th>
                            <th className="px-6 py-3 font-semibold text-blue-100">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-900/5 0">
                        {data?.map((district: any, index: number) => (
                            <tr key={district.id} className="hover:bg-blue/30 transition-all ease-in-out duration-300">
                                <td className="px-6 text-blue-100 py-4">{index + 1}</td>
                                <td className="px-6 text-blue-100 py-4">{district.name}</td>
                                <td className="px-6 text-blue-100 py-4">{district.email}</td>

                                <td className="px-6 py-4  text-blue-100 ">
                                    {new Date(district.createdAt).toLocaleString('en-IN', {
                                        dateStyle: 'medium',
                                        timeStyle: 'short',
                                    })}
                                </td>
                                <div className='px-6 py-4 '>
                                    <div className='flex  gap-2 '>
                                        <Eye size={24} className='text-blue-100' />
                                        <Pen size={24} className='text-blue-800' />
                                        <Trash2 size={24} className='text-red-800' />
                                    </div>
                                </div>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {data?.length === 0 && (
                    <div className="p-4 text-center text-gray-500">No data available</div>
                )}
            </div>
        </div>
    );
};

export default Page;
