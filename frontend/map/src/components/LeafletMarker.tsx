import { useMemo } from 'react';
import { LatLng } from 'leaflet';
import { Marker, Tooltip, useMap } from 'react-leaflet'
import { Measurement } from '../api';
import { BlueIcon, ScoreIconFactory } from '../utils/icons';

interface MarkerProps {
  measurement: Measurement;
  clickCallback: (_: Measurement) => void;
  isSelected: boolean
}


export default function LeafletMarker(props: MarkerProps) {
  const {measurement, clickCallback, isSelected} = props;
  const {location, title, measurement_id, score} = measurement;
  const map = useMap()
  const loc:LatLng = new LatLng(location.latitude, location.longitude);
  const icon = ScoreIconFactory(score ?? 3);
  const eventHandlers = useMemo(
    () => ({
      click() {
        map.panTo(loc)
        clickCallback(measurement)
      }
    }), [clickCallback, loc, map])
  return(
    <Marker eventHandlers={eventHandlers} position={loc} key={measurement_id+"M"} icon={isSelected ? BlueIcon : icon}>
      <Tooltip>{title}</Tooltip>
    </Marker>
  );
}
