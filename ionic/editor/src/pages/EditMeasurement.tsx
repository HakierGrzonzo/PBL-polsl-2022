import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { CreateMeasurement, DataService, Measurement } from '../api';
import { tags } from '../interfaces/tags';
import { IonButton, IonContent, IonInput, IonPage, IonSelect, IonSelectOption, IonSpinner } from '@ionic/react';
import Confirm from '../components/Confirm';
import showInfo from '../components/Notification';

export default function MobileEdit() {
    const pathVariable: any = useParams();
    console.log(pathVariable.id);
    const [measurement, setMeasurement] = useState<Measurement>();
    function handleSubmit(e: any) {
        e.preventDefault();
        if(!measurement){
            return;
        }
        if (!e.target.elements.latitude.value || !e.target.elements.longitude.value || !e.target.elements.laeq.value) {
            showInfo('Please fill at least laeq, latitude and longitude', 'warning');
            return;
        }

            let tagArray = e.target.elements.tags.value.split(',');
            if(tagArray[0] === ''){
                tagArray = [];
            }
            const measurementBody: CreateMeasurement = {
                title: e.target.elements.title.value,
                description: e.target.elements.description.value,
                notes: e.target.elements.notes.value,
                tags: tagArray,
                laeq: e.target.elements.laeq.value,
                location: {
                    latitude: e.target.elements.latitude.value,
                    longitude: e.target.elements.longitude.value,
                    time: measurement.location.time
                }
            };
            DataService.editMeasurementApiDataIdPatch(pathVariable.id, measurementBody).then(res => {
                showInfo('The measurement was edited', 'success');
            }).catch(err => {
                showInfo('Ops! We have some error check your internet connection or login again', 'error');
            });
    }

    useEffect(() => {

        async function fetchData() {
            const mess = await DataService.getOneMeasurementApiDataIdGet(pathVariable.id);
            console.log(mess);
            if (!mess) {
                showInfo('Measurement not found', 'error');
                return;
            }
            setMeasurement(mess);
        }

        if (pathVariable.id != null) {
            fetchData();
        }

    }, [pathVariable.id]);


    function deleteMeasurement() {
        DataService.deleteMeasurementApiDataIdDelete(pathVariable.id).then(res => {
            showInfo('The measurement was deleted', 'success');
            window.history.pushState({}, '', '/editor/all');
            window.dispatchEvent(new PopStateEvent('popstate'));
        }).catch(err => {
            showInfo('Ops! We have some error check your internet connection or login again', 'error');
        });
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
                        <IonInput id='title' name='title' type='text' placeholder='title' className='w-full height-normal' value={measurement.title} />
                        <IonInput id='description' name='description' type='text' placeholder='description' className='w-full height-normal' value={measurement.description} />
                        <IonInput id='notes' name='notes' type='text' placeholder='notes' className='w-full height-normal' value={measurement.notes} />
                        <IonInput id='laeq' name='laeq' type='text' placeholder='laeq' className='w-full height-normal' value={measurement.laeq} />
                        <IonInput id='latitude' name='latitude' type='text' placeholder='latitude' className='w-full height-normal' value={measurement.location.latitude} />
                        <IonInput id='longitude' name='longitude' type='text' placeholder='longitude' className='w-full height-normal' value={measurement.location.longitude} />
                        <IonInput id='time' name='time' type='text' placeholder='time' className='w-full height-normal' disabled={true} value={String(measurement?.location.time).split(".")[0]} />
                        <IonSelect id='tags' name='tags' multiple={true} placeholder='tags' className='custom-select' value={measurement.tags} >
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

