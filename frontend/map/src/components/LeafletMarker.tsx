import { LatLng } from 'leaflet';
import { Marker, Popup } from 'react-leaflet'
import { Measurement } from '../api';
import { getImageLink } from '../utils/fileUtils';

export default function LeafletMarker({measurement}:{measurement:Measurement}) {
  const {location, description, title, laeq, tags, files, measurement_id} = measurement;
  const loc:LatLng = new LatLng(location.latitude, location.longitude);
  const image = getImageLink(files)
  return(
    <Marker position={loc} key={measurement_id+"M"}>
      <Popup>
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
          <p>{laeq}</p>
          <p>{tags}</p>
          {( image !== null ?
            <figure className='wi'>
              <img src={`${image}?optimized=true`} alt={title}/>
            </figure>
            :
            <p>no image</p>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
