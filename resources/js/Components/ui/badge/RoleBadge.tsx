import Badge from "@/Components/ui/badge/Badge";

interface RoleBadgeProps {
    role?: string;
    className?: string;
}

const RoleBadge = ({ role, className = "" }: RoleBadgeProps) => {
    if (role === "admin") {
        return (
            <Badge
                color="error"
                size="sm"
                className={`ml-2 uppercase text-[10px] px-1.5 py-0 rounded font-bold ${className}`}
            >
                Admin
            </Badge>
        );
    }
    if (role === "mentor") {
        return (
            <Badge
                color="info"
                size="sm"
                className={`ml-2 uppercase text-[10px] px-1.5 py-0 rounded font-bold ${className}`}
            >
                Mentor
            </Badge>
        );
    }
    return null;
};

export default RoleBadge;
