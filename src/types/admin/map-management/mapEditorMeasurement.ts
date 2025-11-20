export interface MapEditorMeasurementPoint {
  x: number;
  y: number;
}

export interface CreateMapEditorMeasurementPayload {
  floorPlanId: string;
  startPoint: MapEditorMeasurementPoint;
  endPoint: MapEditorMeasurementPoint;
  distance: number;
  unit: string;
  color?: string;
  strokeWidth?: number;
}

export interface UpdateMapEditorMeasurementPayload {
  startPoint?: MapEditorMeasurementPoint;
  endPoint?: MapEditorMeasurementPoint;
  distance?: number;
  unit?: string;
  color?: string;
  strokeWidth?: number;
  isActive?: boolean;
}

export interface MapEditorMeasurementQuery {
  floorPlanId: string;
  isActive?: boolean | undefined;
}

export interface MapEditorMeasurementOverview {
  id: string;
  floorPlan: {
    id: string;
    title: string;
    floorLabel: string;
  };
  startPoint: MapEditorMeasurementPoint;
  endPoint: MapEditorMeasurementPoint;
  distance: number;
  unit: string;
  color?: string;
  strokeWidth?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

