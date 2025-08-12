// components/InputComponent.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface InputProps {
    label: string;
    value: string | number | boolean | undefined;
    className?: string;
    setInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
    // disabled: boolean
}



const InputComponent = ({ label, value, className, setInput, }: InputProps) => {
    return (
        <div className={cn("flex flex-col", className)}>
            <Label className="w-1/4 text-[17px] text-nowrap text-blue-100">
                {label}
            </Label>
            <Input

                placeholder={`Enter ${label}`}
                className="text-blue-100 placeholder:text-blue-200/50"
                value={typeof value === "boolean" ? String(value) : value ?? ""}
                onChange={setInput}
                required
            />
        </div>
    );
};

export default InputComponent;
