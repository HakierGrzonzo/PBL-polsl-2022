import { Autocomplete, Button, TextField, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { CreateMeasurement, DataService, Location } from '../api';

interface Localization {
    latitude: number;
    longitude: number;
}

export default function Mobile() {
    const { enqueueSnackbar } = useSnackbar();
    const [chosenTags, setChosenTags] = useState<string[]>();
    const [previousId, setPreviousId] = useState<number>(0);

    function handleSubmit(e: any) {
        e.preventDefault();
        if (!e.target.elements.title.value) {
            enqueueSnackbar('Please fill title', { variant: 'error' });
            return;
        }

        console.log(new Date().toLocaleString(),
            e.target.elements.title.value,
            e.target.elements.description.value,
            e.target.elements.image.files[0],
            e.target.elements.file.files[0],
            chosenTags);
        navigator.geolocation.getCurrentPosition((position) => {
            let latitude = position.coords.latitude;
            let longitude = position.coords.longitude;
            if (latitude && longitude && window) {
                setPreviousLocalization({ latitude, longitude });
                // window.open(`https://www.google.com/search?q=${latitude} ${longitude}`, '_blank'); // for google search
                window.open(`https://www.google.com/maps/place/${latitude} ${longitude}`, '_blank'); // for google maps

                const measurementBody: CreateMeasurement = {
                    title: e.target.elements.title.value,
                    description: e.target.elements.description.value,
                    notes: e.target.elements.notes.value,
                    tags: chosenTags || [],
                    location: {
                        latitude,
                        longitude,
                        time: new Date().toISOString(),
                    }
                };
                DataService.addMeasurementApiDataCreatePost(measurementBody).then(res => {
                    enqueueSnackbar('The measurement was added', {
                        variant: 'success',
                    });
                    // window.open(`https://www.google.com/search?q=${latitude} ${longitude}`, '_blank'); // for google search
                    window.open(`https://www.google.com/maps/place/${latitude} ${longitude}`, '_blank'); // for google maps
                    setPreviousId(res.measurement_id);
                }).catch(err => {
                    enqueueSnackbar('Ops! We have some error check your internet connection or login again', {
                        variant: 'error',
                    });
                    console.log(err);
                });
            }
        });
    }

    function report() {
        console.log(previousId);
    }

    return (
        <form className='flex-col p-8 text-center min-h-screen justify-evenly flex max-w-lg m-auto' onSubmit={handleSubmit}>
            <Typography variant='h4' className='mb-4'>
                Add your location
            </Typography>
            <TextField
                id="title"
                label="title"
                margin="normal"
                className='w-full'
            />
            <TextField
                id="description"
                label="description"
                margin="normal"
                className='w-full'
            />
            <TextField
                id="notes"
                label="notes"
                margin="normal"
                className='w-full'
                variant='outlined'
                inputProps={{ accept: 'image/*' }}
            />
            <input
                accept="image/*"
                style={{ display: 'none' }}
                id="file"
                type="file"
            />
            <label htmlFor="file">
                <Button component="span">
                    Image
                </Button>
            </label>
            <Autocomplete
                multiple
                id="tags-autocomplete"
                options={tags}
                getOptionLabel={(option) => option.title}
                onChange={(event, value) => {
                    setChosenTags(value.map((option) => option.title));
                }}
                // defaultValue={[tags[0]]}
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
            <Button type="button" variant="contained" color='error' id="report" onClick={report} >report bad localization</Button>
            <br />
        </form>
    );
}


const tags = [
    { title: 'one' },
    { title: 'two' },
    { title: 'three' },
    { title: 'four' },
    { title: 'five' },
    { title: 'six' },
]
