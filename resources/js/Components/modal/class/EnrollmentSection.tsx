import Input from "@/Components/form/input/InputField";
import Label from "@/Components/form/Label";

interface EnrollmentSectionProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

const EnrollmentSection = ({ value, onChange, error }: EnrollmentSectionProps) => {
    return (
        <div>
            <Label required={true}>Kode Enrollment</Label>
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Masukkan kode kelas"
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
};

export default EnrollmentSection;
