// components/InputComponent.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import React from "react";

interface InputProps {
    label: string;
    value: string | number | boolean | undefined;
    className?: string;
    // Make setInput optional by adding a '?'
    setInput?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: "text" | "password";
}

const InputComponent = ({ label, value, className, setInput, type }: InputProps) => {
    return (
        <div className={cn("flex flex-col", className)}>
            <Label className="w-1/4 text-[17px] text-nowrap text-blue-100">
                {label}
            </Label>
            <Input
                type={type}
                placeholder={setInput ? `Enter ${label}` : ""}
                className="text-blue-100 placeholder:text-blue-200/50"
                value={typeof value === "boolean" ? String(value) : value ?? ""}
                onChange={setInput}
                readOnly={!setInput}
                required={!!setInput}
            />
        </div>
    );
};

export default InputComponent;