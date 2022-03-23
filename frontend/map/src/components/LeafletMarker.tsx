import { LatLng } from 'leaflet';
import { Marker, Popup } from 'react-leaflet'
import { Measurement } from '../api';
import { getImageLink } from '../utils/fileUtils';

export default function LeafletMarker({measurement}:{measurement:Measurement}) {
  const {location, description, title, laeq, tags, files, measurement_id} = measurement;
  const loc:LatLng = new LatLng(location.latitude, location.longitude);
    return(
      <Marker position={loc} key={measurement_id+"M"}>
        <Popup>
          <div>
            <h3>{title}</h3>
            <p>{description}</p>
            <p>{laeq}</p>
            <p>{tags}</p>
            <figure className='wi'>
              <img src={`https://pbl.grzegorzkoperwas.site`+getImageLink(files)} alt={title}/>
            </figure>
          </div>
        </Popup>
      </Marker>
    );
}