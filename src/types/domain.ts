export type Bounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Attributes = {
  strokeWidth?: string;
  fontSize?: string;
  textWidth?: string;
  textHeight?: string;
  color?: string;
  value?: string;
  strokeColor?: string;
  strokeOpacity?: string;
};

export type AnnotationType = {
  type: 'rect' | 'arrow' | 'line' | 'text' | 'view' | 'pin';
  geometry: Geometry;
  attributes?: Attributes;
};

export type Geometry = {
  coordinates: number[][][];
  type: 'Polygon'| 'LineString'| 'Point';
};