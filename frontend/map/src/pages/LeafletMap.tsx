import { LatLng } from 'leaflet'
import { MapContainer, TileLayer } from 'react-leaflet'
import { useState, useEffect, useCallback } from "react";
import { DataService, Measurement } from "../api";
import { useSnackbar } from "notistack";
import LeafletMarker from '../components/LeafletMarker';
import { Grid } from '@mui/material';
import MarkerPane from '../components/MarkerPane';
import { act } from 'react-dom/test-utils';

const localization = new LatLng(50.30016, 18.65059)

export default function LeafletMap() {
  const [measurements, setMeasurements] = useState<Measurement[]>();
  const [activeMeasurement, setActiveMeasurment] = useState<Measurement | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  
  const onMarkerClick = useCallback((m: Measurement) => {
    if (m.measurement_id !== activeMeasurement?.measurement_id) {
      setActiveMeasurment(m)
    }
  }, [activeMeasurement, setActiveMeasurment])

  const onPaneClose = useCallback(() => {
    setActiveMeasurment(null)
  }, [setActiveMeasurment])

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
    <Grid container spacing={0}> 
      <Grid item 
        xs={12} 
        sm={activeMeasurement !== null ? 8 : 12} 
        sx={{
          flexGrow: 1,
          height: {
            xs: activeMeasurement !== null ? '50vh' : '100vh',
            sm: '100vh'
          }}}
      >
        <MapContainer className="fullHeight" center={localization} zoom={13}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {measurements &&
          measurements.map((measurement: Measurement) => {
            return (
              <LeafletMarker 
                isSelected={measurement.measurement_id === activeMeasurement?.measurement_id}
                clickCallback={onMarkerClick}
                measurement={measurement}
                key={measurement.measurement_id}
              />
            );
          })}
        </MapContainer>
      </Grid>
      { activeMeasurement !== null &&
        <Grid item xs={12} sm={4}>
          <MarkerPane measurement={activeMeasurement} closeCallback={onPaneClose}/>
        </Grid>
      }
    </Grid>
  )
}
