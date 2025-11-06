import { IVenueTemplate } from '../../../models/admin/organization/venueTemplate';

export interface CreateVenueTemplateData {
  name: string;
  description?: string;
  includedFeatures?: string[];
  defaultPOICategories?: string[];
}

export interface UpdateVenueTemplateData {
  name?: string;
  description?: string;
  includedFeatures?: string[];
  defaultPOICategories?: string[];
}

export interface VenueTemplateQuery {
  page?: number;
  limit?: number;
  search?: string;
  name?: string;
}

export interface VenueTemplatesListResult {
  venueTemplates: IVenueTemplate[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}

