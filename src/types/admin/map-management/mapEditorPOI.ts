export interface MapEditorPOICoordinates {
  x: number;
  y: number;
}

export interface CreateMapEditorPOIPayload {
  floorPlanId: string;
  name: string;
  category: string;
  description?: string;
  coordinates: MapEditorPOICoordinates;
  icon?: string;
  color?: string;
  isAccessible?: boolean;
}

export interface UpdateMapEditorPOIPayload {
  name?: string;
  category?: string;
  description?: string;
  coordinates?: MapEditorPOICoordinates;
  icon?: string;
  color?: string;
  isAccessible?: boolean;
  isActive?: boolean;
}

export interface MapEditorPOIQuery {
  floorPlanId: string;
  category?: string | undefined;
  isActive?: boolean | undefined;
  search?: string | undefined;
}

export interface MapEditorPOIOverview {
  id: string;
  floorPlan: {
    id: string;
    title: string;
    floorLabel: string;
  };
  name: string;
  category: string;
  description?: string;
  coordinates: MapEditorPOICoordinates;
  icon?: string;
  color?: string;
  isAccessible: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

