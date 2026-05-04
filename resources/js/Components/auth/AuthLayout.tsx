import React from "react";
import { Link } from "@inertiajs/react";

interface AuthLayoutProps {
    children: React.ReactNode;
    image: string;
    logo: string;
    subtitle: string;
}

export default function AuthLayout({ children, image, logo, subtitle }: AuthLayoutProps) {
    return (
        <div className="relative px-6 bg-white z-10 dark:bg-gray-900 sm:p-0">
            <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
                {children}
                <div className="items-center hidden w-full h-screen lg:w-1/2 bg-cover dark:bg-white/5 lg:grid"
                    style={{ backgroundImage: `url(${image})` }}>
                    <div className="relative flex items-center justify-center z-10">
                        {/* <!-- ===== Common Grid Shape Start ===== --> */}
                        <div className="flex flex-col items-center max-w-sm">
                            <Link href="/" className="block mb-4">
                                <img
                                    width={600}
                                    height={48}
                                    src={logo}
                                    alt="Logo"
                                />
                            </Link>
                            <p className="text-center text-gray-100 dark:text-white/60">
                                {subtitle}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
