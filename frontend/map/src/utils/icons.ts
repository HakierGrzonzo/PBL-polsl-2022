import { Icon } from 'leaflet';

const BlueIconFactory = Icon.extend({
  options: {
    iconUrl: "/map/pin-blue.svg",
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  }
})

const iconCache: Record<string, unknown> = {}

export function ScoreIconFactory(score: number): unknown {
  const key = score.toFixed(0);
  const icon = iconCache[key];
  if (icon !== undefined) {
    return icon;
  }
  const new_icon = new (Icon.extend({
    options: {
      iconUrl: `/api/markers/${key}`,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    }
  }))();
  iconCache[key] = new_icon;
  return new_icon
}

export const BlueIcon = new BlueIconFactory()
