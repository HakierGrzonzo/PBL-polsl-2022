import { useState, useEffect } from "react";
import { Button, CircularProgress, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { DataService, Measurement } from "../api";

export default function MobileEdit() {
  const { enqueueSnackbar } = useSnackbar();
  const [measurements, setMeasurements] = useState<Measurement[]>();

  async function fetchData() {
    const messures = await DataService.getAllMeasurementsApiDataGet();
    if (messures.length === 0 || !messures) {
      enqueueSnackbar("Measurement not found", { variant: "error" });
      return;
    }
    setMeasurements(messures);
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      {!measurements
        ? <CircularProgress color='info' sx={{ margin: "48vh 0 0 48.5%" }} />
        :
        <div className='measurements'>
          <h1 className='page-title'>measurements</h1>
          {/* display all measurements */}
          {measurements.map((measurement: Measurement) => {
            return (
              <div className='measurement' key={measurement.measurement_id}>
                <div className='measurement-row'>
                  <Typography variant="h6">tytuł:</Typography>
                  <div className='w-24' />
                  <Typography variant="h6">{measurement.title}</Typography>
                </div>
                <div className='measurement-row'>
                  <Typography variant="h6">opis:</Typography>
                  <div className='w-24' />
                  <Typography variant="body1">{measurement.description}</Typography>
                </div>
                <div className='measurement-row'>
                  <Typography variant="h6">notatki:</Typography>
                  <div className='w-24' />
                  <Typography variant="body1">{measurement.notes}</Typography>
                </div>
                <div className='measurement-row'>
                  <Typography variant="h6">tagi:</Typography>
                  <div className='w-24' />
                  <Typography variant="body1">{measurement.tags.join(", ")}</Typography>
                </div>
                <div className='measurement-row'>
                  <Typography variant="h6">laeq:</Typography>
                  <div className='w-24' />
                  <Typography variant="body1">{measurement.laeq}</Typography>
                </div>
                <div className='measurement-row'>
                  <Typography variant="h6">data:</Typography>
                  <div className='w-24' />
                  <Typography variant="body1">{measurement.location.time}</Typography>
                </div>
                <div className='measurement-row'>
                  <Typography variant="h6">lokalizacja:</Typography>
                  <div className='w-24' />
                  <Typography variant="body1">{measurement.location.latitude} {measurement.location.longitude}</Typography>
                </div>
                <div className='measurement-row-last'>
                  <input type="file" name="filefield" multiple />
                  <Button type="submit" variant="contained" 
                    href={`/editor/mobile_edit/${measurement.measurement_id}`} target="_blank" >edit</Button>
                </div>
              </div>
            );
          }
          )}
        </div>
      }
    </div>
  );
}
