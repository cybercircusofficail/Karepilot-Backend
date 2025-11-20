export interface MapEditorElevatorCoordinates {
  x: number;
  y: number;
}

export interface CreateMapEditorElevatorPayload {
  floorPlanId: string;
  name: string;
  description?: string;
  coordinates: MapEditorElevatorCoordinates;
  connectsToFloors: string[];
  icon?: string;
  color?: string;
  isAccessible?: boolean;
}

export interface UpdateMapEditorElevatorPayload {
  name?: string;
  description?: string;
  coordinates?: MapEditorElevatorCoordinates;
  connectsToFloors?: string[];
  icon?: string;
  color?: string;
  isAccessible?: boolean;
  isActive?: boolean;
}

export interface MapEditorElevatorQuery {
  floorPlanId: string;
  isActive?: boolean | undefined;
  search?: string | undefined;
}

export interface MapEditorElevatorOverview {
  id: string;
  floorPlan: {
    id: string;
    title: string;
    floorLabel: string;
  };
  name: string;
  description?: string;
  coordinates: MapEditorElevatorCoordinates;
  connectsToFloors: string[];
  icon?: string;
  color?: string;
  isAccessible: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
