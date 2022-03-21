import { toastController } from '@ionic/core';

export default function showInfo(text: string, color = "dark", duration = 3000) {
    const toast = toastController.create({
        message: text,
        duration: duration,
        color: color,
    });

    toast.then((toastEl) => {
        toastEl.present();
    });
}