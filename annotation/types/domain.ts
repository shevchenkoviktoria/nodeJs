import { Point, LineString, Polygon, MultiPolygon } from 'geojson'

export type Dictionary<T = string | undefined> = { [key: string]: T }

export type Attributes = Dictionary

export type Annotation = {
  type: 'rect' | 'arrow' | 'line' | 'text'
  geometry: Point | LineString | Polygon
  attributes?: {
    strokeWidth?: string
    fontSize?: string
    textWidth?: string
    color?: string
    value?: string
  }
}

type Bounds = {
  x: number
  y: number
  width: number
  height: number
}

export type IssueImage = {
  id: string
  x: number
  y: number
  bounds?: Bounds
  annotations?: Annotation[]
}

export type Issue = {
  id: string
  createdAt: string
  references: {
    assetId: string
    inspectorId?: string
  }
  images: IssueImage[]
  observation: Dictionary<string>
  category: string
}

export type IssueProcessedForPdf = Issue & {
  mainImage: string
  additionalImages: string[]
  count?: number
}

export type ObservationFilters = {
  [key: string]: string
}

export type InspectionOrder = {
  id: string
  createdAt: string
  updatedAt: string
  references: InspectionOrderReferences
  geometry: Polygon | MultiPolygon
  attributes: Attributes
  completed: boolean
  approvedAt: string
  dueOn?: string
}

export type InspectionOrderProcessedForPdf = InspectionOrder & {
  mapImage: string
}

type InspectionOrderReferences = {
  companyId: string
  inspectorId: string
  inspectionListId: string
  assetIds: string[]
  inspectedAssetIds: string[]
  reflyAssetIds: string[]
  projectId: string
}

export type InspectionRoute = {
  id: string
  createdAt: string
  updatedAt: string
  completion: number
  // references: {}
  geometry: LineString
}

export type InspectionList = {
  id: string
  name?: string
  attributes: Attributes
  groups: InspectionListGroup[]
  // TODO deprecated ↓
  constructionGroups?: InspectionListNestedEntity[]
  categories: InspectionListCategories[]
  confirmationList: InspectionListNestedEntity[]
  severities: string[]
  locations: InspectionListNestedEntity[]
  conditions: InspectionListNestedEntity[]
  components: InspectionListNestedEntity[]
  structureTypes: InspectionListNestedEntity[]
}

export type InspectionListOption = {
  code: string
  name: string
  position?: number
  enable?: InspectionListFieldConstraint
}

export type InspectionListField = {
  key: string
  label: string
  defaultValue: string
  position: number
  dataType: 'list' | 'text' | 'textarea' | 'bool'
  mandatory: boolean
  enable?: InspectionListFieldConstraint[]
  options?: InspectionListOption[]
}

type InspectionListFieldConstraint = {
  field: string
  code: string
  value: boolean
}

export type InspectionListGroup = {
  type: string
  title: string
  position: number
  fields: InspectionListField[]
}

type InspectionListNestedEntity = {
  value: string
  label: string
}

type InspectionListCategories = {
  title: string
  items: Category[]
}

type Category = {
  key: string
  name: string
  description: string
  defaultSeverity: string
}

type AssetGeometry = Point | LineString | Polygon
export type Asset = {
  id: string
  attributes?: Attributes
  references: { companyId: string }
  geometry: AssetGeometry
  height?: string
  width?: number
  externalId: string
}

export type AssetProcessedForPdf = Asset & {
  mapImage: string
  image?: string
}

export type Company = {
  id: string
  name: string
  attributes?: Attributes
}

export type Project = {
  id: string
  name: string
  attributes?: Attributes
}

export type User = {
  id: string
  email: string
  attributes?: Attributes
}

type ImageFieldOfView = {
  horizontal: number
  vertical: number
}

type ImageResolution = {
  width: number
  height: number
}

type ImageSensor = {
  focalPoint: Point
  fieldOfView: ImageFieldOfView
  resolution: ImageResolution
  yaw: number
  pitch: number
  roll: number
}

type ImageProjection = {
  center: Point
  topLeft: Point
  bottomLeft: Point
  bottomRight: Point
  topRight: Point
}

export type Image = {
  id: string
  attributes?: Attributes
  references: { assetId?: string }
  fileUrl?: string
  sourceUrl?: string
  sensor?: ImageSensor
  sensorName?: string
  projection?: ImageProjection
  geometry?: Polygon
  category: string
}

export type StructureDetection = {
  id: string
  createdAt: string
  attributes: Attributes
  references: { assetId: string; imageId: string }
  category: 'structure-image'
}
