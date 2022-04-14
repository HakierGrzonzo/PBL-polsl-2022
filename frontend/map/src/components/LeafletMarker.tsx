import { useMemo } from 'react';
import { LatLng } from 'leaflet';
import { Marker, Popup, Tooltip } from 'react-leaflet'
import { Measurement } from '../api';
import { getImageLink } from '../utils/fileUtils';

interface MarkerProps {
  measurement: Measurement;
  clickCallback: (_: Measurement) => void;
}

export default function LeafletMarker(props: MarkerProps) {
  const {measurement, clickCallback} = props;
  const {location, title, measurement_id} = measurement;
  const loc:LatLng = new LatLng(location.latitude, location.longitude);
  const eventHandlers = useMemo(
    () => ({
      click() {
        clickCallback(measurement)
      }
    }), [])
  return(
    <Marker eventHandlers={eventHandlers} position={loc} key={measurement_id+"M"}>
      <Tooltip>{title}</Tooltip>
    </Marker>
  );
}
