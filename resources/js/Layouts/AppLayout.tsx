// resources/js/Layouts/AppLayout.tsx
import React, { ReactNode, useState } from "react";
import { Link } from "@inertiajs/react";
import Button from "@/Components/ui/button/Button";
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
} from "@/Components/ui/navigation-menu";
import Logo from "../../assets/logo/logo-color.png";

type Props = {
    children: ReactNode;
};

export default function AppLayout({ children }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
                <div className="container mx-auto px-6 py-4 relative flex items-center justify-between">
                    {/* Logo (hidden mobile) */}
                    <Link
                        href="/"
                        className="hidden md:flex items-center gap-2 z-10"
                    >
                        <img
                            src={Logo}
                            alt="Gabara Logo"
                            className="w-20 h-auto"
                        />
                    </Link>

                    {/* Hamburger (only mobile) */}
                    <button
                        className="md:hidden flex items-center justify-center w-10 h-10 z-10"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <div className="space-y-1">
                            <span className="block w-6 h-0.5 bg-white"></span>
                            <span className="block w-6 h-0.5 bg-white"></span>
                            <span className="block w-6 h-0.5 bg-white"></span>
                        </div>
                    </button>

                    {/* Nav tengah (desktop) */}
                    <NavigationMenu className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link href="/" className="text-white/95">
                                        Beranda
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <a
                                        href="#features"
                                        className="text-white/95"
                                    >
                                        Layanan
                                    </a>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <a
                                        href="#testimonials"
                                        className="text-white/95"
                                    >
                                        Testimoni
                                    </a>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <a href="#mitra" className="text-white/95">
                                        Mitra
                                    </a>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <a href="#faq" className="text-white/95">
                                        FAQ
                                    </a>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>

                    {/* Auth buttons */}
                    <div className="flex items-center gap-3 z-10">
                        <Link href={route("login")}>
                            <Button
                                variant="danger"
                                className="hidden sm:inline-block"
                            >
                                Login
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Mobile menu */}
                {isOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-white text-black shadow-md flex flex-col items-start px-6 py-4 gap-3">
                        <Link href="/" onClick={() => setIsOpen(false)}>
                            Beranda
                        </Link>
                        <a href="#features" onClick={() => setIsOpen(false)}>
                            Layanan
                        </a>
                        <a
                            href="#testimonials"
                            onClick={() => setIsOpen(false)}
                        >
                            Testimoni
                        </a>
                        <a href="#mitra" onClick={() => setIsOpen(false)}>
                            Mitra
                        </a>
                        <a href="#faq" onClick={() => setIsOpen(false)}>
                            FAQ
                        </a>
                    </div>
                )}
            </header>

            {/* Content */}
            <main className="flex-1">{children}</main>
        </div>
    );
}
