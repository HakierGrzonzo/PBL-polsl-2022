import { LatLng } from 'leaflet'
import { MapContainer, TileLayer } from 'react-leaflet'
import { useState, useEffect, useCallback } from "react";
import { DataService, Measurement } from "../api";
import { useSnackbar } from "notistack";
import LeafletMarker from '../components/LeafletMarker';
import CloseIcon from '@mui/icons-material/Close';
import { Grid, Box, AppBar, Toolbar, Typography, IconButton, Button } from '@mui/material';
import MarkerPane from '../components/MarkerPane';

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
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
    }}>
      <AppBar position="sticky">
        <Toolbar>
          <Button variant='text' color='inherit'> 
            About
          </Button>
          <Box sx={{ flexGrow: 1}}/>
          <Typography variant="h6" component="div">
            {activeMeasurement?.title ?? "PBL 2022"}
          </Typography>
          {activeMeasurement &&
            <IconButton onClick={onPaneClose} size="large">
              <CloseIcon/>
            </IconButton>
          }
        </Toolbar>
      </AppBar>
      <Grid container spacing={0} sx={{
        flexGrow: 1,
      }}> 
        <Grid item 
          xs={12} 
          sm={8} 
          sx={{
            flexGrow: 1,
            display: {
              xs: activeMeasurement !== null ? 'none' : 'flex',
              sm: 'flex',
            }
          }}
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
        { activeMeasurement !== null ? 
          <Grid item xs={12} sm={4}>
            <MarkerPane measurement={activeMeasurement} />
          </Grid>
          :
          <Grid item xs={12} sm={4} sx={{
            display: {
              xs: 'none',
              sm: 'block',
            }
          }}>
            <Box sx={{margin: '1em'}}>
              <Typography variant="h5">
                Click on map to select or something
              </Typography>
            </Box>
          </Grid>
        }
      </Grid>
    </Box>
  )
}
