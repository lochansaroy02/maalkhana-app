// components/InputComponent.tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface InputProps {
    label: string
    value: string
    setInput: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const InputComponent = ({ label, value, setInput }: InputProps) => {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            <Input className="bg-white" value={value} onChange={setInput} type="text" required />
        </div>
    )
}

export default InputComponent
