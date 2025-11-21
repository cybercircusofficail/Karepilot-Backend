export interface LayerVisibility {
  floorPlan: boolean;
  pois: boolean;
  paths: boolean;
  zones: boolean;
  labels: boolean;
}

export interface MapEditorProperties {
  gridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
}

export interface MapEditorPreferencesResponse {
  id: string;
  userId: string;
  layerVisibility: LayerVisibility;
  properties: MapEditorProperties;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateMapEditorPreferencesPayload {
  layerVisibility?: Partial<LayerVisibility>;
  properties?: Partial<MapEditorProperties>;
}

