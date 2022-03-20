import { useState, useEffect } from "react";
import { Button, CircularProgress, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { DataService, Measurement } from "../api";

export default function MobileEdit() {
  const { enqueueSnackbar } = useSnackbar();
  const [measurements, setMeasurements] = useState<Measurement[]>();

  async function fetchData() {
    const measures = await DataService.getAllMeasurementsApiDataGet();
    if (measures.length === 0 || !measures) {
      enqueueSnackbar("Measurement not found", { variant: "error" });
      return;
    }
    setMeasurements(measures);
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
          {measurements.map((measurement: Measurement) => {
            return (
              <div className='measurement' key={measurement.measurement_id}>
                <div className='measurement-row'>
                  <Typography variant="h6">title:</Typography>
                  <div className='w-24' />
                  <Typography variant="h6">{measurement.title}</Typography>
                </div>
                <div className='measurement-row'>
                  <Typography variant="h6">description:</Typography>
                  <div className='w-24' />
                  <Typography variant="body1">{measurement.description}</Typography>
                </div>
                <div className='measurement-row'>
                  <Typography variant="h6">notes:</Typography>
                  <div className='w-24' />
                  <Typography variant="body1">{measurement.notes}</Typography>
                </div>
                <div className='measurement-row'>
                  <Typography variant="h6">tags:</Typography>
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
                  <Typography variant="h6">localization:</Typography>
                  <div className='w-24' />
                  <Typography variant="body1">{measurement.location.latitude} {measurement.location.longitude}</Typography>
                </div>
                <div className='measurement-row-last'>
                  <input type="file" name="multipleFiles" multiple />
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
