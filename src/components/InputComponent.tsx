// components/InputComponent.tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
interface InputProps {
    label: string;
    value: string;
    className?: string;
    setInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputComponent = ({ label, value, className, setInput }: InputProps) => {
    return (
        <div className={cn("flex    gap-8 ", className)}>
            <Label className="w-1/4   text-wrap text-[#102647] ">{label}</Label>
            <Input className="bg-white w-3/4" value={value} onChange={setInput} type="text" required />
        </div>
    );
};

export default InputComponent;

