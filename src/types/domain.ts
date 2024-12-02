export type AnnotationType = {
  type: 'rect' | 'arrow' | 'line' | 'text' | 'view';
  geometry: Geometry;
  attributes?: Attributes;
};

export type Geometry = {
  coordinates: number[][][];
  type: 'Polygon' | 'MultiPolygon';
};

export type Attributes = {
  strokeWidth?: string;
  strokeColor?: string;
  fontSize?: string;
  color?: string;
  text?: string;
  radius?: number;
};