import { ReactNode } from "react";

interface ButtonProps {
    type?: "button" | "submit" | "reset";
    children: ReactNode; // Button text or content
    size?:
        | "none"
        | "ghost"
        | "square"
        | "xs"
        | "sm"
        | "md"
        | "circle-sm"
        | "circle-md"
        | "circle-lg"; // Button size
    variant?:
        | "default"
        | "primary"
        | "outline"
        | "popover"
        | "danger"
        | "alternate"
        | "link" // Button variant
        | "circle-outline";
    startIcon?: ReactNode; // Icon before the text
    endIcon?: ReactNode; // Icon after the text
    onClick?: () => void; // Click handler
    disabled?: boolean; // Disabled state
    className?: string; // Disabled state
}

const Button: React.FC<ButtonProps> = ({
    children,
    size = "md",
    variant = "default",
    startIcon,
    endIcon,
    onClick,
    className = "",
    disabled = false,
}) => {
    // Size Classes
    const sizeClasses = {
        none: "px-0 py-3 text-sm",
        ghost: "text-base px-1 py-1",
        square: "p-3 text-sm",

        xs: "px-3 py-1.5 text-sm", // super ramping
        sm: "px-4 py-2 text-sm", // standar ramping
        md: "px-5 py-2.5 text-base", // sedang
        lg: "px-6 py-3 text-base", // besar
        xl: "px-7 py-3.5 text-lg", // extra besar

        "circle-sm":
            "w-8 h-8 rounded-full flex items-center justify-center text-sm",
        "circle-md":
            "w-10 h-10 rounded-full flex items-center justify-center text-base",
        "circle-lg":
            "w-12 h-12 rounded-full flex items-center justify-center text-lg",
    };

    // Variant Classes
    const variantClasses = {
        default:
            "bg-[#2563EB] text-white hover:bg-[#1E40AF] disabled:bg-[#93C5FD]", // biru primary
        outline:
            "border-4 border-[#3480F8] text-[#2563EB] bg-white hover:bg-[#3480F8]", // outline biru
        popover: "border text-[#2563EB] bg-white hover:bg-[#EFF6FF] shadow-sm", // menu popover
        danger: "bg-[#FF6D22] text-white shadow-theme-xs hover:bg-[#e65f1d] disabled:bg-[#ffb68f]", // oranye CTA
        alternate:
            "bg-[#0EA5E9] text-white hover:bg-[#0284C7] disabled:bg-[#7DD3FC]", // biru muda alternate
        primary:
            "bg-[#3480F8] text-white shadow-theme-xs hover:bg-[#3480F8] disabled:bg-[#93C5FD]", // biru strong
        link: "text-[#2563EB] font-semibold hover:underline p-0 bg-transparent shadow-none", // link style
        "circle-outline":
            "border-4 border-[#ced4da] text-[#ced4da] bg-white hover:bg-[#EFF6FF]",
    };
    return (
        <button
            className={`inline-flex items-center justify-center gap-2 transition ${className} ${
                sizeClasses[size]
            } ${variantClasses[variant]} ${
                disabled ? "cursor-not-allowed opacity-50" : ""
            } ${size.startsWith("circle-") ? "rounded-full" : "rounded-lg"}`}
            onClick={onClick}
            disabled={disabled}
        >
            {startIcon && (
                <span className="flex items-center">{startIcon}</span>
            )}
            {children}
            {endIcon && <span className="flex items-center">{endIcon}</span>}
        </button>
    );
};

export default Button;
