import { useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { showToast } from "@/utils/toast";

interface FlashMessages {
    success?: string;
    error?: string;
    info?: string;
    warning?: string;
}

export function useFlashMessages() {
    const { flash } = usePage().props as { flash?: FlashMessages };

    useEffect(() => {
        if (flash?.success) {
            showToast.success(flash.success);
        }
        if (flash?.error) {
            showToast.error(flash.error);
        }
        if (flash?.info) {
            showToast.info(flash.info);
        }
        if (flash?.warning) {
            showToast.warning(flash.warning);
        }
    }, [flash]);
}
