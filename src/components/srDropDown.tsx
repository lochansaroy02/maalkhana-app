import React from "react";

interface SrNoDropdownProps {
    firData: any[];
    selectedValue: string;
    onChange: (value: string) => void;
}

const SrNoDropdown: React.FC<SrNoDropdownProps> = ({
    firData,
    selectedValue,
    onChange
}) => {
    // Extract unique srNo values
    const srNoOptions = [...new Set(firData.map(item => item.srNo))].map(srNo => ({
        label: srNo,
        value: srNo
    }));

    if (firData.length > 1) {
        // Render dropdown if multiple
        return (
            <div>
                <label>Sr. No / Mad No.</label>
                <select
                    value={selectedValue}
                    onChange={(e) => onChange(e.target.value)}
                >
                    <option value="">Select</option>
                    {srNoOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>
        );
    }

    // Render text input if only one
    return (
        <div>
            <label>Sr. No / Mad No.</label>
            <input
                type="text"
                value={selectedValue || firData[0]?.srNo || ""}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
};

export default SrNoDropdown;
