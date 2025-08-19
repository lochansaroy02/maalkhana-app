interface ScanResult {
    srNo: string;
    firNo: string;
    id: string;
}
const ScanResultDisplay = ({ result }: { result: ScanResult }) => {



    return (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-6 rounded-md mb-4 text-left shadow-sm">
            <h3 className="font-bold text-xl mb-4 text-gray-800 border-b pb-2">Scan Successful: Asset Details</h3>
            <div className="space-y-4">
                <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">Entry ID</label>
                    <p className="text-lg bg-white p-2 rounded-md border border-gray-200">{result.id || 'N/A'}</p>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">FIR No.</label>
                    <p className="text-lg bg-white p-2 rounded-md border border-gray-200">{result.firNo || 'N/A'}</p>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">Serial No.</label>
                    <p className="text-lg bg-white p-2 rounded-md border border-gray-200">{result.srNo || 'N/A'}</p>
                </div>
            </div>
        </div>
    );
};

export default ScanResultDisplay