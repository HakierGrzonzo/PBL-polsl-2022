import { Icon } from 'leaflet';

const BlueIconFactory = Icon.extend({
  options: {
    iconUrl: "/map/pin-blue.svg",
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  }
})

const GoldIconFactory = Icon.extend({
  options: {
    iconUrl: "/map/pin-gold.svg",
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  }
})

export const BlueIcon = new BlueIconFactory()
export const GoldIcon = new GoldIconFactory()
