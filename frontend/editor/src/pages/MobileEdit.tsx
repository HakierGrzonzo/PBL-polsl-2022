import { useState, useEffect } from "react";
import { Autocomplete, Button, CircularProgress, TextField, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { useParams } from "react-router-dom";
import { CreateMeasurement, DataService, FilesService, Measurement } from "../api";
import AlertDialogSlide from "../components/dialog";
import { tags } from "../interfaces/tags";
import { getImageLink } from "../utils/fileUtils";

export default function MobileEdit() {
  const pathVariable: any = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const [chosenTags, setChosenTags] = useState<string[]>();
  const [measurement, setMeasurement] = useState<Measurement>();
  function handleSubmit(e: any) {
    e.preventDefault();
    if (!e.target.elements.latitude.value || !e.target.elements.laeq.value || !e.target.elements.longitude.value) {
      enqueueSnackbar("Please fill at least laeq, latitude and longitude", { variant: "error" });
      return;
    }
    let latitude = e.target.elements.latitude.value;
    let longitude = e.target.elements.longitude.value;
    if(e.target.elements.google.value){
      latitude = e.target.elements.google.value.split(",")[0];
      longitude = e.target.elements.google.value.split(",")[1].trim();
    }
    const measurementBody: CreateMeasurement = {
      title: e.target.elements.title.value,
      description: e.target.elements.description.value,
      notes: e.target.elements.notes.value,
      laeq: e.target.elements.laeq.value || 0,
      tags: chosenTags || [],
      location: {
        latitude: latitude,
        longitude: longitude,
        time: String(measurement?.location.time)
      }
    };
    DataService.editMeasurementApiDataIdPatch(pathVariable.id, measurementBody).then((_:any) => {
      enqueueSnackbar("The measurement was edited", {
        variant: "success",
      });
    }).catch((_:any) => {
      enqueueSnackbar("Ops! We have some error with measurement edit check your internet connection or login again", {
        variant: "error",
      });
    });
  }

  async function fetchData() {
    try {
      const mess = await DataService.getOneMeasurementApiDataIdGet(pathVariable.id);
      if (!mess) {
        enqueueSnackbar("Measurement not found", { variant: "error" });
        return;
      }
      setMeasurement(mess);
    }
    catch(e){
      enqueueSnackbar("Ops! We have some error with measurement edit check your internet connection or login again", {
        variant: "error",
      });
      window.history.pushState({}, "", `/editor`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  }


  useEffect(() => {
    if (pathVariable.id != null) {
      fetchData();
    }
  }, [pathVariable.id]);


  async function deleteMeasurement() {
    if(!measurement) {
      return;
    }
    for(const file of measurement.files) {
      await FilesService.deleteFileApiFilesDeleteIdGet(file.file_id).catch((_:any) => {
        enqueueSnackbar("we have some problem with deleting files", { variant: "error"});
      });
    }
    DataService.deleteMeasurementApiDataDeleteIdGet(pathVariable.id).then((_:any) => {
      enqueueSnackbar("The measurement was deleted", {
        variant: "success",
      });
      window.history.pushState({}, "", "/editor/pc");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }).catch((_:any) => {
      enqueueSnackbar("Please delete file first! Or check your internet connection or login again", {
        variant: "error",
      });
    });
  }

  return (
    <div>
      {!measurement
        ? <CircularProgress color='info' sx={{ margin: "48vh 0 0 48.5%" }} />
        :
        <form className='flex-col simple-form text-center min-h-screen justify-evenly flex m-auto' onSubmit={handleSubmit}>
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
            type={"number"}
            className='w-full'
            defaultValue={measurement.laeq}
            inputProps={{
              step: "0.1"
            }}
          />
          <TextField
            id="latitude"
            label="latitude"
            margin="normal"
            className='w-full'
            defaultValue={measurement.location.latitude}
          />
          <TextField
            id="longitude"
            label="longitude"
            margin="normal"
            className='w-full'
            defaultValue={measurement.location.longitude}
          />
          <TextField
            id="google"
            label="position from google"
            margin="normal"
            className='w-full'
            defaultValue={measurement.location.latitude + ", " + measurement.location.longitude}
          />
          <TextField
            id="time"
            label="time"
            margin="normal"
            className='w-full'
            disabled={true}
            defaultValue={measurement.location.time}
          />
          {getImageLink(measurement.files) ?
            <figure className='flex flex-col items-center justify-center'>
              <img src={getImageLink(measurement.files)} alt="measurement" className='w-full h-64' />
            </figure>
            :
            <div className='flex flex-col items-center justify-center'>
              <Typography variant='h5'>
                no image
              </Typography>
            </div>
          }
          <Autocomplete
            multiple
            id="tags-autocomplete"
            options={tags}
            getOptionLabel={(option) => option}
            onChange={(event, value) => {
              setChosenTags(value.map((option) => option));
            }}
            defaultValue={measurement.tags.filter((tag) => tags.includes(tag))}
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
          {window.outerWidth > 800 && 
            <Button type="submit" variant="contained" id="submit" href="/editor/pc" >back to pc</Button>
          }
          <br />
        </form>
      }
    </div>
  );
}
