import { useState, useEffect } from 'react';
import { Autocomplete, Button, TextField, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useParams } from "react-router-dom";
import { CreateMeasurement, DataService, Location, Measurement } from '../api';
import AlertDialogSlide from '../components/dialog';
import { tags } from '../interfaces/tags';

export default function MobileEdit() {
    const pathVariable: any = useParams();
    console.log(pathVariable.id);
    const { enqueueSnackbar } = useSnackbar();
    const [chosenTags, setChosenTags] = useState<string[]>();
    const [measurement, setMeasurement] = useState<Measurement>();
    function handleSubmit(e: any) {
        e.preventDefault();
        if (!e.target.elements.title.value || !e.target.elements.description.value) {
            enqueueSnackbar('Please fill at least title, latitude and longitude', { variant: 'error' });
            return;
        }

        console.log(new Date().toLocaleString(),
            e.target.elements.title.value,
            e.target.elements.description.value,
            chosenTags);
        navigator.geolocation.getCurrentPosition((position) => {
            let latitude = position.coords.latitude;
            let longitude = position.coords.longitude;
            if (latitude && longitude && window) {
                const measurementBody: CreateMeasurement = {
                    title: e.target.elements.title.value,
                    description: e.target.elements.description.value,
                    notes: e.target.elements.notes.value,
                    tags: chosenTags || [],
                    location: {
                        latitude,
                        longitude,
                        time: String(measurement?.location.time)
                    }
                };
                DataService.editMeasurementApiDataIdPatch(pathVariable.id, measurementBody).then(res => {
                    enqueueSnackbar('The measurement was edited', {
                        variant: 'success',
                    });
                }).catch(err => {
                    console.log(err);
                });
            }
        });
    }

    async function fetchData() {
        const mess = await DataService.getOneMeasurmentApiDataIdGet(pathVariable.id);
        if (!mess) {
            enqueueSnackbar('Measurement not found', { variant: 'error' });
            return;
        }
        setMeasurement(mess);
    }


    useEffect(() => {
        if (pathVariable.id != null) {
            fetchData();
        }
    }, [pathVariable.id]);


    function deleteMeasurement() {
        console.log("deleteMeasurement");
    }

    return (
        <div>
            {!measurement
                ? <div>Loading...</div>
                :
                <form className='flex-col p-8 text-center min-h-screen justify-evenly flex max-w-lg m-auto' onSubmit={handleSubmit}>
                    <Typography variant='h4' className='mb-4'>
                        edit your location
                    </Typography>
                    <TextField
                        id="title"
                        label="title"
                        margin="normal"
                        className='w-full'
                        defaultValue={measurement.title}
                    />
                    <TextField
                        id="description"
                        label="description"
                        margin="normal"
                        className='w-full'
                        defaultValue={measurement.description}
                    />
                    <TextField
                        id="notes"
                        label="notes"
                        margin="normal"
                        className='w-full'
                        defaultValue={measurement.notes}
                    />
                    <TextField
                        id="laeq"
                        label="laeq"
                        margin="normal"
                        className='w-full'
                    // defaultValue={measurement.laeq}
                    />
                    <TextField
                        id="latitude"
                        label="latitude"
                        margin="normal"
                        className='w-full'
                        defaultValue={measurement.location.latitude}
                    />
                    <TextField
                        id="time"
                        label="time"
                        margin="normal"
                        className='w-full'
                        disabled={true}
                        defaultValue={measurement.location.time}
                    />
                    <TextField
                        id="longitude"
                        label="longitude"
                        margin="normal"
                        className='w-full'
                        defaultValue={measurement.location.longitude}
                    />
                    <Autocomplete
                        multiple
                        id="tags-autocomplete"
                        options={tags}
                        getOptionLabel={(option) => option}
                        onChange={(event, value) => {
                            setChosenTags(value.map((option) => option));
                        }}
                        defaultValue={measurement.tags}
                        filterSelectedOptions
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="filterSelectedOptions"
                                placeholder="Favorites"
                            />
                        )}
                    />
                    <Button type="submit" variant="contained" id="submit" >submit</Button>
                    {/* <Button type="button" variant="contained" color='error' id="report" onClick={report} >delete measurement</Button> */}
                    <AlertDialogSlide
                        communicate="are you sure you want to delete this measurement?"
                        buttonText="delete measurement"
                        callback={deleteMeasurement} />
                    <br />
                </form>
            }
        </div>
    );
}

