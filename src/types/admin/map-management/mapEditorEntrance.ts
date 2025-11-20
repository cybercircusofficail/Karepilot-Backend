export interface MapEditorEntranceCoordinates {
  x: number;
  y: number;
}

export interface CreateMapEditorEntrancePayload {
  floorPlanId: string;
  name: string;
  category: string;
  description?: string;
  coordinates: MapEditorEntranceCoordinates;
  icon?: string;
  color?: string;
  isAccessible?: boolean;
}

export interface UpdateMapEditorEntrancePayload {
  name?: string;
  category?: string;
  description?: string;
  coordinates?: MapEditorEntranceCoordinates;
  icon?: string;
  color?: string;
  isAccessible?: boolean;
  isActive?: boolean;
}

export interface MapEditorEntranceQuery {
  floorPlanId: string;
  category?: string | undefined;
  isActive?: boolean | undefined;
  search?: string | undefined;
}

export interface MapEditorEntranceOverview {
  id: string;
  floorPlan: {
    id: string;
    title: string;
    floorLabel: string;
  };
  name: string;
  category: string;
  description?: string;
  coordinates: MapEditorEntranceCoordinates;
  icon?: string;
  color?: string;
  isAccessible: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

