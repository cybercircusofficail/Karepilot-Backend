import { FloorPlanStatus } from "../../../models/admin/map-manager/enums";

export interface FloorPlanFileDTO {
  fileName: string;
  mimeType: string;
  fileSizeInBytes: number;
  url?: string;
}

export interface CreateFloorPlanDTO {
  organization: string;
  building: string;
  floor: string;
  name: string;
  status?: FloorPlanStatus;
  description?: string;
  scale?: string;
  tags?: string[];
  file?: FloorPlanFileDTO | null;
  previewUrl?: string;
}

export interface UpdateFloorPlanDTO {
  name?: string;
  status?: FloorPlanStatus;
  description?: string;
  scale?: string;
  tags?: string[];
  file?: FloorPlanFileDTO | null;
  previewUrl?: string | null;
}

export interface FloorPlanQuery {
  page?: number;
  limit?: number;
  organization?: string;
  building?: string;
  floor?: string;
  status?: FloorPlanStatus;
  search?: string;
  tag?: string;
}

export interface FloorPlanStats {
  total: number;
  published: number;
  draft: number;
  inProgress: number;
  archived: number;
}


