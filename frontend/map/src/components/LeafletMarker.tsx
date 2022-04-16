import { useMemo } from 'react';
import { LatLng } from 'leaflet';
import { Marker, Tooltip, useMap } from 'react-leaflet'
import { Measurement } from '../api';
import { BlueIcon, GoldIcon } from '../utils/icons';

interface MarkerProps {
  measurement: Measurement;
  clickCallback: (_: Measurement) => void;
  isSelected: boolean
}


export default function LeafletMarker(props: MarkerProps) {
  const {measurement, clickCallback, isSelected} = props;
  const {location, title, measurement_id} = measurement;
  const map = useMap()
  const loc:LatLng = new LatLng(location.latitude, location.longitude);
  const eventHandlers = useMemo(
    () => ({
      click() {
        map.panTo(loc)
        clickCallback(measurement)
      }
    }), [clickCallback, loc, map])
  return(
    <Marker eventHandlers={eventHandlers} position={loc} key={measurement_id+"M"} icon={isSelected ? BlueIcon : GoldIcon}>
      <Tooltip>{title}</Tooltip>
    </Marker>
  );
}
