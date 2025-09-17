// components/InputComponent.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import React from "react";

interface InputProps {
    id?: string
    label?: string;
    value: string | number | boolean | undefined;
    className?: string;
    setInput?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: "text" | "password" | string;
    // 1. Add the optional 'disabled' prop
    disabled?: boolean;
}

const InputComponent = ({
    label,
    value,
    className,
    setInput,
    type,
    id,
    // 2. Destructure the new 'disabled' prop
    disabled,
}: InputProps) => {
    return (
        <div className={cn("flex flex-col", className)}>
            <Label className="w-1/4 text-[17px] text-nowrap text-blue-100">
                {label}
            </Label>
            <Input
                id={id}
                type={type}
                placeholder={setInput ? `Enter ${label}` : ""}
                className="text-blue-100 placeholder:text-blue-200/50"
                value={typeof value === "boolean" ? String(value) : value ?? ""}
                onChange={setInput}
                readOnly={!setInput}
                required={!!setInput}
                // 3. Pass the 'disabled' prop to the Input element
                disabled={disabled}
            />
        </div>
    );
};

export default InputComponent;