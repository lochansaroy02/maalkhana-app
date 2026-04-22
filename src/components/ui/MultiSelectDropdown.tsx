'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface Option {
    label: string;
    value: string;
}

interface MultiSelectDropdownProps {
    options: Option[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    label: string;
}

export function MultiSelectDropdown({
    options,
    selectedValues,
    onChange,
    label,
}: MultiSelectDropdownProps) {
    const selectedCount = selectedValues.length;
    const triggerText = selectedCount > 0
        ? `${selectedCount} selected`
        : ` ${label}`;

    const handleCheckedChange = (checked: boolean, value: string) => {
        if (checked) {
            // Add the value if it's checked
            onChange([...selectedValues, value]);
        } else {
            // Remove the value if it's unchecked
            onChange(selectedValues.filter((v) => v !== value));
        }
    };

    return (
        <DropdownMenu >
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[150px] bg-blue  text-blue-100 text-sm text-wrap glass-effect  justify-between">
                    {triggerText}
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[150px] bg-blue text-xs text-blue-100">
                <DropdownMenuLabel className='text-sm'>{label}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {options.map((option) => (
                    <DropdownMenuCheckboxItem
                        className='hover:bg-blue/50 bg-blue'
                        key={option.value}
                        checked={selectedValues.includes(option.value)}
                        onCheckedChange={(checked) => handleCheckedChange(checked, option.value)}
                    >
                        {option.label}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}