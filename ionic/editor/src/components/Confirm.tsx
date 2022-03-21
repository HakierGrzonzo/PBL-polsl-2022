import { IonAlert, IonButton } from "@ionic/react";
import { useState } from "react";

export default function Confirm({ communicate, buttonText, callback }: { communicate: string, buttonText: string, callback: () => void }) {
    const [showAlert, setShowAlert] = useState(false);
    return (
        <div>
            <IonButton onClick={() => setShowAlert(true)} color="danger" expand="block">{buttonText}</IonButton>
            <IonAlert
                isOpen={showAlert}
                onDidDismiss={() => setShowAlert(false)}
                cssClass='my-custom-class'
                header={'Confirm decision'}
                message={`<strong>${communicate}</strong>`}
                buttons={[
                    {
                        text: 'No',
                        role: 'cancel',
                        cssClass: 'secondary',
                        id: 'cancel-button',
                        handler: blah => {
                            console.log('Confirm Cancel: blah');
                        }
                    },
                    {
                        text: 'Yes',
                        id: 'confirm-button',
                        handler: () => {
                            callback();
                        }
                    }
                ]}
            />
        </div>
    )
}