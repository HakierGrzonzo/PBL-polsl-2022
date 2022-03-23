import { LatLng } from 'leaflet'
import { MapContainer, TileLayer } from 'react-leaflet'
import { useState, useEffect } from "react";
import { DataService, Measurement } from "../api";
import { useSnackbar } from "notistack";
import LeafletMarker from '../components/LeafletMarker';

const localization = new LatLng(50.30016, 18.65059)

export default function LeafletMap() {
  const [measurements, setMeasurements] = useState<Measurement[]>();
  const { enqueueSnackbar } = useSnackbar();

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
    <MapContainer className="fullHeight" center={localization} zoom={13}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {measurements &&
      measurements.map((measurement: Measurement) => {
            return (
              <LeafletMarker measurement={measurement} />
            );
        })}
    </MapContainer>
  )
}
