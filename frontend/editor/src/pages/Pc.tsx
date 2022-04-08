import { useState, useEffect } from "react";
import { Button, CircularProgress, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { DataService, FilesService, Measurement, Location } from "../api";
import { checkFiContainAllFiles } from "../utils/fileUtils";
import _ from 'lodash';

export default function MobileEdit() {
  const { enqueueSnackbar } = useSnackbar();
  const [measurements, setMeasurements] = useState<Measurement[]>();

  function showLocalization(localization: Location) {
    window.open(`https://www.google.com/maps/place/${localization.latitude} ${localization.longitude}`, "_blank");
  }

  function send(id: number) {
    const input = document.getElementById(`${id}`) as HTMLInputElement;
    if(!input || !input.files) {
      return;
    }

    for (const file of input.files) {
      let body = {
        uploaded_file: file
      }
      FilesService.uploadNewFileApiFilesPost(id, body).then(() => {
        enqueueSnackbar("The file was added", {
          variant: "success",
        });
      }).catch(() => {
        enqueueSnackbar(`Ops! We have some error with file upload check your internet connection or login again`, {
          variant: "error",
        });
      });
    }      
  }

  async function fetchData() {
    const measures = await DataService.getUsersMeasurementsApiDataMineGet();
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
          {_.sortBy(measurements, (m:Measurement) => {
            return checkFiContainAllFiles(m.files);
          }).map((measurement: Measurement) => {
            return (
              <div key={measurement.measurement_id}
                className={checkFiContainAllFiles(measurement.files) ? "measurement bg-stone-800" : "measurement bg-stone-700" }>
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
                <div onClick={() => showLocalization(measurement.location)} className='measurement-row cursor-pointer'>
                  <Typography variant="h6">localization:</Typography>
                  <div className='w-24' />
                  <Typography variant="body1">
                    {measurement.location.latitude} {measurement.location.longitude}</Typography>
                </div>
                <div className='measurement-row'>
                  <Typography variant="h6">files:</Typography>
                  <div className='w-24' />
                  <Typography variant="body1">{measurement.files.map((file, index, arr) => (
                    <span key={file.file_id}>
                      <a title={file?.optimized_mime} href={file.link}>{file.mime}</a>{index < arr.length - 1 ? ", " : ""}
                    </span>
                  ))}</Typography>
                </div>
                <div className='measurement-row'>
                  <input type="file" name="multipleFiles" multiple id={String(measurement.measurement_id)} />
                </div>
                <div className='measurement-row-last'>
                  <Button type="submit" variant="contained" onClick={() => send(measurement.measurement_id)} >send</Button>
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
