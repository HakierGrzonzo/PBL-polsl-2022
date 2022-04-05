import { toastController } from '@ionic/core';

export default function showInfo(text: string, color = "dark", duration = 3000) {
    if(color === "error"){
        color = "danger";
    }
    const toast = toastController.create({
        message: text,
        duration: duration,
        color: color,
        position: 'top',
        animated: true
    });

    toast.then((toastEl) => {
        toastEl.present();
    });
}