"use client";

import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx"; // Import SheetJS

const Page = () => {
    const [combinedData, setCombinedData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const userRes = await axios.get(`/api/district/users?districtId=${user?.id}`);

            if (userRes.data.success) {
                const fetchedUsers = userRes.data.data;

                const dataPromises = fetchedUsers.map(async (u: any) => {
                    try {
                        const entryRes = await axios.get(`/api/entry?id=${u.id}`);
                        return {
                            ...u,
                            entries: entryRes.data.success ? entryRes.data.data : []
                        };
                    } catch (err) {
                        return { ...u, entries: [] };
                    }
                });

                const results = await Promise.all(dataPromises);
                setCombinedData(results);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) fetchAllData();
    }, [user?.id]);

    // Function to handle Excel Download
    const downloadExcel = () => {
        // 1. Prepare data for Excel (Flatten the object)
        const excelData = combinedData.map((item, index) => ({
            "S.No": index + 1,
            "Police Station": item.policeStation,
            "Total Entries": item.entries.length,
            "Status": item.entries.length > 0 ? "Active" : "No Records"
        }));

        // 2. Create worksheet and workbook
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Entry Report");

        // 3. Trigger download
        XLSX.writeFile(workbook, `Malkhana_Report_${new Date().toLocaleDateString()}.xlsx`);
    };

    return (
        <div className="p-8 h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Digital Malkhana Statistics</h1>
                    <p className="text-gray-400">Overview of entries by Police Station</p>
                </div>

                <button
                    onClick={downloadExcel}
                    disabled={loading || combinedData.length === 0}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Excel Report
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <p className="text-white animate-pulse">Fetching and compiling data...</p>
                </div>
            ) : (
                <div className="border border-white/20 rounded-xl overflow-hidden glass-effect shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/10 text-gray-200">
                                <th className="p-4 border-b border-white/10">S.No</th>
                                <th className="p-4 border-b border-white/10">Police Station</th>
                                <th className="p-4 border-b border-white/10 text-center">Total Entries</th>

                            </tr>
                        </thead>
                        <tbody className="text-gray-300">
                            {combinedData.map((userData, index) => (
                                <tr key={userData.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 border-b border-white/10 font-mono text-sm">{index + 1}</td>
                                    <td className="p-4 border-b border-white/10 font-semibold">{userData.policeStation}</td>

                                    <td className="p-4 border-b border-white/10 text-center">
                                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full font-bold">
                                            {userData.entries.length}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Page;