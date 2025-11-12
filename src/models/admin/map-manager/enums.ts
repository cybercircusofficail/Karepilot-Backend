export enum FloorPlanStatus {
  DRAFT = "Draft",
  PUBLISHED = "Published",
  ARCHIVED = "Archived",
  IN_PROGRESS = "Building",
  NEW = "New",
}

export enum FloorPlanVersionStatus {
  DRAFT = "Draft",
  IN_REVIEW = "In Review",
  READY_FOR_PUBLISH = "Ready For Publish",
  PUBLISHED = "Published",
  ARCHIVED = "Archived",
}

export enum MapLayerType {
  FLOOR_PLAN = "floor-plan",
  POI = "poi",
  PATH = "path",
  ZONE = "zone",
  LABEL = "label",
  ENTRANCE = "entrance",
  ELEVATOR = "elevator",
  RESTRICTED_ZONE = "restricted-zone",
  TAG = "tag",
  RULER = "ruler",
  MEASUREMENT = "measurement",
  ANNOTATION = "annotation",
  MESSAGE = "message",
  MEDIA = "media",
}

export enum MapElementType {
  POI = "poi",
  PATH = "path",
  ZONE = "zone",
  LABEL = "label",
  ENTRANCE = "entrance",
  ELEVATOR = "elevator",
  RESTRICTED_ZONE = "restricted-zone",
  MEASUREMENT = "measurement",
  ANNOTATION = "annotation",
  MESSAGE = "message",
  TAG = "tag",
}

export enum MapElementStatus {
  DRAFT = "Draft",
  ACTIVE = "Active",
  HIDDEN = "Hidden",
  ARCHIVED = "Archived",
}

export enum DrawingToolCategory {
  BASIC = "Basic Tools",
  ADVANCED = "Advanced Tools",
  MEASUREMENT = "Measurement",
  ANNOTATION = "Annotation",
  ACCESSIBILITY = "Accessibility",
  CUSTOM = "Custom",
}

