export enum RestrictionType {
  STAFF_ONLY = "Staff Only",
  AUTHORIZED_PERSONNEL = "Authorized Personnel",
  EMERGENCY_ACCESS_ONLY = "Emergency Access Only",
}

export interface MapEditorRestrictedZoneCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CreateMapEditorRestrictedZonePayload {
  floorPlanId: string;
  name: string;
  description?: string;
  restrictionType: RestrictionType;
  coordinates: MapEditorRestrictedZoneCoordinates;
  color?: string;
}

export interface UpdateMapEditorRestrictedZonePayload {
  name?: string;
  description?: string;
  restrictionType?: RestrictionType;
  coordinates?: MapEditorRestrictedZoneCoordinates;
  color?: string;
  isActive?: boolean;
}

export interface MapEditorRestrictedZoneQuery {
  floorPlanId: string;
  isActive?: boolean | undefined;
  search?: string | undefined;
}

export interface MapEditorRestrictedZoneOverview {
  id: string;
  floorPlan: {
    id: string;
    title: string;
    floorLabel: string;
  };
  name: string;
  description?: string;
  restrictionType: RestrictionType;
  coordinates: MapEditorRestrictedZoneCoordinates;
  color?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

