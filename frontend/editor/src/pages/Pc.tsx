import { useState, useEffect, useReducer } from "react";
import { Button, Chip, CircularProgress, LinearProgress, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { DataService, FilesService, Measurement, Location, FileReference } from "../api";
import { checkFiContainAllFiles } from "../utils/fileUtils";
import { MeasuermentRow } from "../components/measurementRow";
import _ from 'lodash';

type CountAction = 
  | { type: 'add', newFiles: number}
  | { type: 'fileuploaded'};

interface CountState {
  max: number;
  now: number;
}

function countReducer(state: CountState, action: CountAction): CountState {
  switch (action.type) {
  case 'add':
    return {now: state.now + action.newFiles, max: action.newFiles};
  case 'fileuploaded':
    return {now: state.now - 1, max: state.max}
  default:
    throw new Error()
  }
}

export default function MobileEdit() {
  const { enqueueSnackbar } = useSnackbar();
  const [measurements, setMeasurements] = useState<Measurement[]>();
  const [uploadingFilesCount, dispatch] = useReducer(countReducer, {now: 0, max: 0});

  function showLocalization(localization: Location) {
    window.open(`https://www.google.com/maps/place/${localization.latitude} ${localization.longitude}`, "_blank");
  }

  async function send(id: number) {
    const input = document.getElementById(`${id}`) as HTMLInputElement;
    if(!input || !input.files) {
      return;
    }
    dispatch({type: 'add', newFiles: input.files.length})
    for (const file of input.files) {
      let body = {
        uploaded_file: file
      }
      try {
        await FilesService.uploadNewFileApiFilesPost(id, body)
        enqueueSnackbar("The file was added", {
          variant: "success",
        });
      } 
      catch {
        enqueueSnackbar(`Ops! We have some error with file upload check your internet connection or login again`, {
          variant: "error",
        });
      }
      dispatch({type: 'fileuploaded'})
    }      
    await fetchData()
  }

  async function fetchData() {
    try {
      const measures = await DataService.getUsersMeasurementsApiDataMineGet();
      if (measures.length === 0 || !measures) {
        enqueueSnackbar("Measurement not found", { variant: "error" });
        return;
      }
      setMeasurements(measures);
    }
    catch { 
      window.history.pushState({}, "", "/editor/");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  }

  async function deleteFile(file: FileReference, e: Event) {
    e.preventDefault()
    if (confirm(`Do you really want to delete "${file.original_name}"?`)) {
      try {
        await FilesService.deleteFileApiFilesDeleteIdGet(file.file_id)
        enqueueSnackbar(`Deleted ${file.original_name}`, {
          variant: "success",
        });
      }
      catch {
        enqueueSnackbar(`Ops! Grzez failed to delete ${file.original_name}`, {
          variant: "error",
        });
      }
      await fetchData()
    }
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
                <Typography variant="h6">
                  {measurement.title}
                </Typography>
                <MeasuermentRow name="description">
                  {measurement.description}
                </MeasuermentRow>
                <MeasuermentRow name="notes">
                  {measurement.notes}
                </MeasuermentRow>
                <MeasuermentRow name="tags">
                  {measurement.tags.map(
                    (tag, index) => <Chip key={tag + index} label={tag}/>)}
                </MeasuermentRow>
                <MeasuermentRow name="laeq">
                  {measurement.laeq}
                </MeasuermentRow>
                <MeasuermentRow name="time">
                  {new Date(Date.parse(measurement.location.time)).toLocaleString()}
                </MeasuermentRow>
                <MeasuermentRow name="location">
                  <Chip 
                    label={`${measurement.location.latitude} ${measurement.location.longitude}`} 
                    onClick={() => showLocalization(measurement.location)}/>
                </MeasuermentRow>
                <MeasuermentRow name="files">
                  {measurement.files.map((file) => <Chip 
                    key={file.file_id} 
                    label={file.original_name} 
                    color={file.optimized_mime ? "success" : "primary"}
                    component="a"
                    title={file.mime}
                    href={file.link}
                    onDelete={(e) => deleteFile(file, e)}
                    clickable
                  />
                  )}
                </MeasuermentRow>
                {uploadingFilesCount.now > 0 ? 
                  <>
                    <LinearProgress variant="determinate" value={100 - uploadingFilesCount.now / uploadingFilesCount.max * 100}/>
                  </>
                  : <>
                    <div className='measurement-row'>
                      <input type="file" name="multipleFiles" multiple id={String(measurement.measurement_id)} />
                    </div>
                  </>}
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
