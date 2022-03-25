import { IonButton, IonContent, IonInput, IonPage, IonSelect, IonSelectOption } from '@ionic/react';
import { useState } from 'react';
import { CreateMeasurement, DataService } from '../api';
import { tags } from '../interfaces/tags';
import { Geolocation } from '@capacitor/geolocation';
import Confirm from '../components/Confirm';
import showInfo from '../components/Notification';
import "./AddMeasurement.css";

export default function AddMeasurement() {
    const [previousId, setPreviousId] = useState<number>(0);

    async function handleSubmit(e: any) {
        e.preventDefault();
        if (!e.target.elements.laeq.value) {
            showInfo('Please fill laeq', 'error');
            return;
        }
            Geolocation.getCurrentPosition().then(res => {    
                let latitude = res.coords.latitude.valueOf();
                let longitude = res.coords.longitude.valueOf();
                if (latitude != null && longitude != null) {
                let date = new Date();
                let tagArray = e.target.elements.tags.value.split(',');
                date.setHours(date.getHours() + 1);
                const measurementBody: CreateMeasurement = {
                    title: e.target.elements.title.value,
                    description: e.target.elements.description.value,
                    notes: e.target.elements.notes.value,
                    tags: tagArray,
                    laeq: e.target.elements.laeq.value,
                    location: {
                        latitude,
                        longitude,
                        time: date.toISOString()
                    }
                };
                DataService.addMeasurementApiDataCreatePost(measurementBody).then(res => {
                    showInfo('The measurement was added', 'success');
                    window.open(`https://www.google.com/maps/place/${latitude} ${longitude}`, '_blank'); // for google maps
                    setPreviousId(res.measurement_id);
                }).catch(err => {
                    showInfo('Ops! We have some error check your internet connection or login again', 'error');
                });
            }
        }).catch(err => {
            Geolocation.requestPermissions();
            showInfo('Ops! problem with location', 'error');
        });
    }

    function report() {
        window.history.pushState({}, '', `/editor/edit/${previousId}`);
        window.dispatchEvent(new PopStateEvent('popstate')); // without refresh
    }

    return (
        <IonPage>
            {/* <IonHeader class='text-center'>
                <IonToolbar>
                    <IonTitle>Add measurement</IonTitle>
                </IonToolbar>
            </IonHeader> */}
            <IonContent fullscreen>
                <form className='login-form' onSubmit={handleSubmit}>
                    <h2 className='login-title'>
                        Add measurement
                    </h2>
                    <IonInput type='text' name='title' placeholder='title' id='title' className='w-full height-normal' />
                    <IonInput type='text' name='description' placeholder='description' id='description' className='w-full height-normal' />
                    <IonInput type='text' name='notes' placeholder='notes' id='notes' className='w-full height-normal' />
                    <IonInput type='number' name='laeq' placeholder='laeq' id='laeq' className='w-full height-normal' />
                    <IonSelect multiple={true} name='tags' placeholder='tags' id='tags' className='custom-select' >
                        {tags.map((tag) => {
                            return <IonSelectOption key={tag} value={tag}>{tag}</IonSelectOption>
                        })}
                    </IonSelect>
                    <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="file"
                        type="file"
                    />
                    <label htmlFor="file">
                        <span className='file-button'>
                            Image
                        </span>
                    </label>
                    <IonButton type='submit' expand="block">Submit</IonButton>
                    <Confirm communicate="Are you sure you want to edit this measurement?" buttonText="report measurement" callback={report} />
                </form>
            </IonContent >
        </IonPage>
    );
}

