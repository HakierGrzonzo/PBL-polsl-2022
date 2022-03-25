import { IonPage, IonContent, IonList, IonSpinner, IonLabel, IonItemDivider, IonHeader, IonTitle, IonToolbar, IonButton } from '@ionic/react';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Measurement, DataService } from '../api';
import NoData from '../components/NoData';
import showInfo from '../components/Notification';

export default function AllMeasurements() {
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const location = useLocation();
    
    useEffect(() => {
        async function fetchData() {
            DataService.getUsersMeasurementsApiDataMineGet().then(res => {
                setMeasurements(res);
                setIsLoading(false);
            }).catch(err => {
                showInfo('Ops! We have some error check your internet connection or login again', 'error');
            });
        }
        if(location.pathname.includes('/all')){
            fetchData();
        }
    }, [location]);
    
    function handleClikc(id: number) {
        window.history.pushState({}, '', `editor/edit/${id}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
    }

    const renderMeasurements = () => {
        if(measurements.length === 0) {
            return <NoData />
        }
        return (
                <IonList>
                    {measurements.map((measurement) => {
                        return (
                        <IonItemDivider key={measurement.measurement_id}>
                            <IonLabel>
                                <h2>{measurement.title}</h2>
                                <h3>{measurement.description}</h3>
                                <p>{measurement.notes}</p>
                                <p>{measurement.laeq}</p>
                                <p>{measurement.tags.join(', ')}</p>
                                <p>{measurement.location.latitude}</p>
                                <p>{measurement.location.longitude}</p>
                                <p>{measurement.location.time}</p>
                                <IonButton color="primary" onClick={() => handleClikc(measurement.measurement_id)}>Edit</IonButton>
                            </IonLabel>
                    </IonItemDivider>
                    );
                })}
                </IonList>
        );
    }

    return (
        <IonPage>
            <IonHeader class='text-center'>
                <IonToolbar>
                    <IonTitle>All measurement</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                    {isLoading ? 
                    <div className='text-center loading'>
                        <IonSpinner />
                    </div>
                    :
                       renderMeasurements()
                    }
            </IonContent>
        </IonPage>
    );
}