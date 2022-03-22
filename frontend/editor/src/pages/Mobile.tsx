import { Autocomplete, Button, TextField, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { CreateMeasurement, DataService, FilesService } from "../api";
import AlertDialogSlide from "../components/dialog";
import { tags } from "../interfaces/tags";

export default function Mobile() {
  const { enqueueSnackbar } = useSnackbar();
  const [chosenTags, setChosenTags] = useState<string[]>();
  const [previousId, setPreviousId] = useState<number>(0);

  function handleSubmit(e: any) {
    e.preventDefault();
    if (!e.target.elements.title.value) {
      enqueueSnackbar("Please fill title", { variant: "error" });
      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
      let latitude = position.coords.latitude;
      let longitude = position.coords.longitude;
      if (latitude && longitude && window) {
        let date = new Date();
        date.setHours(date.getHours() + 1);
        const measurementBody: CreateMeasurement = {
          title: e.target.elements.title.value,
          description: e.target.elements.description.value,
          notes: e.target.elements.notes.value,
          laeq: e.target.elements.laeq.value || 0,
          tags: chosenTags || [],
          location: {
            latitude,
            longitude,
            time: date.toISOString()
          }
        };
        DataService.addMeasurementApiDataCreatePost(measurementBody).then(res => {
          enqueueSnackbar("The measurement was added", {
            variant: "success",
          });
          let body = {
            uploaded_file: e.target.elements.file.files[0],
          }
          FilesService.uploadNewFileApiFilesPost(res.measurement_id, body).then(() => {
            enqueueSnackbar("The file was added", {
              variant: "success",
            });
          }).catch(() => {
            enqueueSnackbar(`Ops! We have some error with file upload check your internet connection or login again`, {
              variant: "error",
            });
          });
          // window.open(`https://www.google.com/search?q=${latitude} ${longitude}`, '_blank'); // for google search
          window.open(`https://www.google.com/maps/place/${latitude} ${longitude}`, "_blank"); // for google maps
          setPreviousId(res.measurement_id);
        }).catch(() => {
          enqueueSnackbar("Ops! We have some error with measurement upload check your internet connection or login again", {
            variant: "error",
          });
        });
      }
    });
  }

  function report() {
    window.history.pushState({}, "", `/editor/mobile_edit/${previousId}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  return (
    <form className='flex-col simple-form text-center min-h-screen justify-evenly flex m-auto' onSubmit={handleSubmit}>
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
      />
      <TextField
        id="laeq"
        label="laeq"
        type={"number"}
        margin="normal"
        className='w-full'
      />
      <input
        accept="image/*"
        style={{ display: "none" }}
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
        getOptionLabel={(option) => option}
        onChange={(event, value) => {
          setChosenTags(value.map((option) => option));
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
      {/* <Button type="button" variant="contained" color='error' id="report" onClick={report} >report bad localization</Button> */}
      <AlertDialogSlide
        communicate="are you sure you want to report this measurement?"
        buttonText="report measurement"
        callback={report} />
      <br />
      {window.outerWidth > 800 && 
      <Button type="submit" variant="contained" id="submit" href="/editor/pc" >back to pc</Button>
      }
    </form>
  );
}
