export type Attributes = {
  strokeWidth?: string;
  fontSize?: string;
  textWidth?: string;
  textHeight?: string;
  color?: string;
  value?: string;
};

export type AnnotationType = {
  type: "rect" | "arrow" | "line" | "text" | "view";
  geometry: Geometry;
  attributes?: Attributes;
};

export type Geometry = {
  coordinates: number[][][];
  type: "Polygon" | "MultiPolygon";
};
