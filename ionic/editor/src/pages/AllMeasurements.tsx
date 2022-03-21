import { IonPage, IonContent, IonList, IonSpinner, IonLabel, IonItemDivider, IonHeader, IonTitle, IonToolbar } from '@ionic/react';
import { useState, useEffect } from 'react';
import { Measurement, DataService } from '../api';
import NoData from '../components/NoData';

export default function AllMeasurements() {
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        async function fetchData() {
            DataService.getAllMeasurementsApiDataGet().then(res => {
                setMeasurements(res);
                setIsLoading(false);
            }).catch(err => {
                console.log(err);
            });
        }
        fetchData();
    }, []);

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
                                <p>{measurement.tags.join(', ')}</p>
                                <p>{measurement.location.latitude}</p>
                                <p>{measurement.location.longitude}</p>
                                <p>{measurement.location.time}</p>
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