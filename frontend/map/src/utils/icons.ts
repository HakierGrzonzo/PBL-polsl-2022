import { Icon } from 'leaflet';

const BlueIconFactory = Icon.extend({
  options: {
    iconUrl: "/map/pin-blue.svg"
  }
})

const GoldIconFactory = Icon.extend({
  options: {
    iconUrl: "/map/pin-gold.svg"
  }
})

export const BlueIcon = new BlueIconFactory()
export const GoldIcon = new GoldIconFactory()
