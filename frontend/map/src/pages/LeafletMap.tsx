import { LatLng } from 'leaflet'
import { MapContainer, TileLayer } from 'react-leaflet'
import { useState, useEffect, useCallback } from "react";
import { DataService, Measurement } from "../api";
import { useSnackbar } from "notistack";
import LeafletMarker from '../components/LeafletMarker';
import About from '../components/about';
import CloseIcon from '@mui/icons-material/Close';
import { Grid, Box, AppBar, Toolbar, Typography, IconButton, Button, Skeleton, Modal } from '@mui/material';
import MarkerPane from '../components/MarkerPane';
import Section from '../components/Section';

export default function LeafletMap() {
  const [localization, setLocalization] = useState<LatLng|null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>();
  const [activeMeasurement, setActiveMeasurment] = useState<Measurement | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const handleOpen = () => setAboutOpen(true);
  const handleClose = () => setAboutOpen(false);
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
    const point = measures[0].location
    setLocalization(new LatLng(point.latitude, point.longitude))
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
      <AppBar position="static">
        <Toolbar>
          <Button variant='text' color='inherit' onClick={handleOpen}> 
            O Aplikacji
          </Button>
          <Button variant='text' color='inherit' href='/api/geojson/'>
            GeoJSON
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
      <Modal
        open={aboutOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <About/>
      </Modal>
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
          {measurements && localization ?
            <MapContainer className="map" center={localization} zoom={13}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {measurements.map((measurement: Measurement) => {
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
            :
            <Box sx={{
              flex: 1,
              display: 'grid',
              m: '1em',
              gridTemplateColumns: '1fr 2fr',
              gridGap: '1em',
              gridTemplateRows: '1fr 3fr'
            }}>
              <Skeleton variant="circular" height={'inherit'}/>
              <Skeleton variant="rectangular" height={'inherit'}/>
              <Skeleton variant="rectangular" height={'inherit'}/>
              <Skeleton variant="rectangular" height={'inherit'}/>
            </Box>
          }
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
              <Section level="h5" title="Tutaj zrobimy jakieś filtry, ale na razie klikamy samemu na mapie.">
                <Typography variant="body1">
                  Mamy na razie {measurements?.length ?? '????'} pomiarów.
                </Typography>
              </Section>
            </Box>
          </Grid>
        }
      </Grid>
    </Box>
  )
}
