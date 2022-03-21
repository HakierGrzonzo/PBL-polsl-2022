import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { CreateMeasurement, DataService, Measurement } from '../api';
import { tags } from '../interfaces/tags';
import { IonButton, IonContent, IonInput, IonPage, IonSelect, IonSelectOption, IonSpinner } from '@ionic/react';
import Confirm from '../components/Confirm';

export default function MobileEdit() {
    const pathVariable: any = useParams();
    console.log(pathVariable.id);
    const [measurement, setMeasurement] = useState<Measurement>();
    function handleSubmit(e: any) {
        e.preventDefault();
        if (!e.target.elements.title.value || !e.target.elements.description.value) {
            // enqueueSnackbar('Please fill at least title, latitude and longitude', { variant: 'error' });
            return;
        }

        navigator.geolocation.getCurrentPosition((position) => {
            let latitude = position.coords.latitude;
            let longitude = position.coords.longitude;
            let tags = e.target.elements.tags.value.split(',');
            if (latitude && longitude && window) {
                const measurementBody: CreateMeasurement = {
                    title: e.target.elements.title.value,
                    description: e.target.elements.description.value,
                    notes: e.target.elements.notes.value,
                    tags: tags || [],
                    location: {
                        latitude,
                        longitude,
                        time: String(measurement?.location.time)
                    }
                };
                DataService.editMeasurementApiDataIdPatch(pathVariable.id, measurementBody).then(res => {
                    // enqueueSnackbar('The measurement was edited', {
                    //     variant: 'success',
                    // });
                }).catch(err => {
                    console.log(err);
                });
            }
        });
    }




    useEffect(() => {

        async function fetchData() {
            const mess = await DataService.getOneMeasurmentApiDataIdGet(pathVariable.id);
            console.log(mess);
            if (!mess) {
                // enqueueSnackbar('Measurement not found', { variant: 'error' });
                return;
            }
            setMeasurement(mess);
        }

        if (pathVariable.id != null) {
            fetchData();
        }

    }, [pathVariable.id]);


    function deleteMeasurement() {
        console.log("deleteMeasurement");
    }
    return (
        <IonPage>
            <IonContent fullscreen>
                {!measurement ? 
                    <div className='text-center loading'>
                        <IonSpinner />
                    </div>
                    :
                    <form className='login-form' onSubmit={handleSubmit}>
                        <h2 className='login-title'>
                            Edit measurement
                        </h2>

                        <IonInput id='title' type='text' placeholder='title' className='w-full height-normal' value={measurement.title} />
                        <IonInput id='description' type='text' placeholder='description' className='w-full height-normal' value={measurement.description} />
                        <IonInput id='notes' type='text' placeholder='notes' className='w-full height-normal' value={measurement.notes} />
                        <IonInput id='laeq' type='text' placeholder='laeq' className='w-full height-normal' />
                        <IonInput id='latitude' type='text' placeholder='latitude' className='w-full height-normal' value={measurement.location.latitude} />
                        <IonInput id='longitude' type='text' placeholder='longitude' className='w-full height-normal' value={measurement.location.longitude} />
                        <IonInput id='time' type='text' placeholder='time' className='w-full height-normal' disabled={true} value={String(measurement?.location.time).split(".")[0]} />
                        <IonSelect id='tags-autocomplete' multiple={true} placeholder='tags' className='custom-select' value={measurement.tags} >
                            {tags.map((tag) => {
                                return <IonSelectOption key={tag} value={tag}>{tag}</IonSelectOption>
                            })}
                        </IonSelect>
                        <IonButton type='submit' >submit</IonButton>
                        <Confirm communicate="Are you sure you want to delete this measurement?" buttonText="delete measurement" callback={deleteMeasurement} />
                    </form>
                }
            </IonContent>
        </IonPage>
    );
}

