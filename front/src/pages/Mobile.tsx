import { Autocomplete, Button, TextField, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';


export default function Mobile() {
    const { enqueueSnackbar } = useSnackbar();
    const [chosenTags, setChosenTags] = useState<any[]>();

    function handleSubmit(e: any) {
        e.preventDefault();
        if (!e.target.elements.title.value) {
            enqueueSnackbar('Please fill title', { variant: 'error' });
            return;
        }
        enqueueSnackbar('This is a success message!', {
            variant: 'success',
        });

        console.log(new Date().toLocaleString(),
            e.target.elements.title.value,
            e.target.elements.description.value,
            e.target.elements.image.files[0],
            e.target.elements.file.files[0],
            chosenTags);
        navigator.geolocation.getCurrentPosition((position) => {
            let latitude = position.coords.latitude;
            let longitude = position.coords.longitude;
            console.log(latitude, longitude);
            enqueueSnackbar(`This is your localization: Latitude: ${latitude} Longitude: ${longitude}`, {
                variant: 'info',
            });
        });
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
                id="image"
                type={'file'}
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
                    setChosenTags(value);
                }}
                defaultValue={[tags[0]]}
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
