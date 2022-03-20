import { useState, useEffect } from "react";
import { Autocomplete, Button, CircularProgress, TextField, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { useParams } from "react-router-dom";
import { CreateMeasurement, DataService, Measurement } from "../api";
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

    const measurementBody: CreateMeasurement = {
      title: e.target.elements.title.value,
      description: e.target.elements.description.value,
      notes: e.target.elements.notes.value,
      laeq: e.target.elements.laeq.value || 0,
      tags: chosenTags || [],
      location: {
        latitude: e.target.elements.latitude.value,
        longitude: e.target.elements.longitude.value,
        time: String(measurement?.location.time)
      }
    };
    DataService.editMeasurementApiDataIdPatch(pathVariable.id, measurementBody).then(_ => {
      enqueueSnackbar("The measurement was edited", {
        variant: "success",
      });
    }).catch(_ => {
      enqueueSnackbar("Ops! We have some error with measurement edit check your internet connection or login again", {
        variant: "error",
      });
    });
  }

  async function fetchData() {
    const mess = await DataService.getOneMeasurementApiDataIdGet(pathVariable.id);
    if (!mess) {
      enqueueSnackbar("Measurement not found", { variant: "error" });
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
    DataService.deleteMeasurementApiDataIdDelete(pathVariable.id).then(_ => {
      enqueueSnackbar("The measurement was deleted", {
        variant: "success",
      });
      window.history.pushState({}, "", "/editor/pc");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }).catch(_ => {
      enqueueSnackbar("Ops! We have some error check your internet connection or login again", {
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
          <figure className='flex flex-col items-center justify-center'>
            <img src={getImageLink(measurement.files)} alt="measurement" className='w-full h-64' />
          </figure>
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
