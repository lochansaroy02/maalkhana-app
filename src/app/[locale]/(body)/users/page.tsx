"use client";
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';
import { Eye, Pen } from 'lucide-react';
import { useEffect, useState } from 'react';
import AddUser from './AddUser';

const Page = () => {
    const { login, user } = useAuthStore()
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const { getUsers, users, deleteUsers } = useUserStore()
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)


    useEffect(() => {
        if (user?.role === "district")  
            getUsers(user?.id);
    }, [user?.id]);

    const toggleSelection = (userId: string) => {
        setSelectedUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };
    const handleDeleteSelected = () => {
        if (selectedUserIds.length === 0) return alert("No users selected!");
        const confirm = window.confirm("Are you sure you want to delete the selected users?");
        if (confirm) {
            deleteUsers(selectedUserIds);
            setSelectedUserIds([]);

        }
    };
    return (
        <div className='glass-effect relative  min-h-screen p-4'>
            {isModalOpen && <AddUser setIsModalOpen={setIsModalOpen} isModalOpen={isModalOpen} />}
            <div className='bg-maroon py-4 border border-gray-400 rounded-t-xl flex justify-center'>
                <h1 className='text-2xl uppercase text-[#fdf8e8] font-semibold'>Users</h1>
            </div>
            <div className='flex gap-4  justify-end px-12 items-center py-1    glass-noRound  rounded-b-xl'>
                <Button onClick={() => setIsModalOpen(true)} className='bg-blue cursor-pointer'>Add User</Button>
                {selectedUserIds.length > 0 && <Button onClick={handleDeleteSelected} className='bg-red-800'>Delete Selected</Button>}
            </div>
            <div className="overflow-x-auto mt-4 glass-effect shadow-md rounded-md">
                <table className="min-w-full divide-y  divide-blue-900/50 text-sm text-left">
                    <thead className="">
                        <tr>
                            <th className="px-6 py-3 font-semibold text-blue-100">Select</th>
                            <th className="px-6 py-3 font-semibold text-blue-100">#</th>
                            <th className="px-6 py-3 font-semibold text-blue-100">Name</th>
                            <th className="px-6 py-3 font-semibold text-blue-100">Email</th>
                            <th className="px-6 py-3 font-semibold text-blue-100">Mobile No.</th>
                            <th className="px-6 py-3 font-semibold text-blue-100">Rank</th>
                            <th className="px-6 py-3 font-semibold text-blue-100">Police Station</th>
                            <th className="px-6 py-3 font-semibold text-blue-100">Role</th>
                            <th className="px-6 py-3 font-semibold text-blue-100">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-900/5 0">
                        {users?.map((user: any, index: number) => (
                            <tr key={user.id} className="hover:bg-blue/30 transition-all ease-in-out duration-300">
                                <td className="px-6 py-4 text-blue-100">
                                    <Checkbox
                                        checked={selectedUserIds.includes(user.id)}
                                        onCheckedChange={() => toggleSelection(user.id)}
                                    />
                                </td>
                                <td className="px-6 text-blue-100 py-4">{index + 1}</td>
                                <td className="px-6 text-blue-100 py-4">{user.name}</td>
                                <td className="px-6 text-blue-100 py-4">{user.email}</td>
                                <td className="px-6 text-blue-100 py-4">{user.mobileNo}</td>
                                <td className="px-6 text-blue-100 py-4">{user.rank}</td>
                                <td className="px-6 text-blue-100 py-4">{user.policeStation}</td>
                                <td className="px-6 text-blue-100 py-4">{user.role}</td>

                                {/* <td className="px-6 py-4  text-blue-100 ">
                                    {new Date(user.createdAt).toLocaleString('en-IN', {
                                        dateStyle: 'medium',
                                        timeStyle: 'short',
                                    })}
                                </td> */}
                                <div className='px-6 py-4 '>
                                    <div className='flex  gap-2 '>
                                        <Eye size={24} className='text-blue-100' />
                                        <Pen size={24} className='text-blue-800 ' />
                                    </div>
                                </div>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {users?.length === 0 && (
                    <div className="p-4 text-center text-gray-500">No data available</div>
                )}
            </div>
        </div>
    );
};

export default Page;
