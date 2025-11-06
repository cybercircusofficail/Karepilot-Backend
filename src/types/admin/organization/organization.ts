import { IOrganization } from '../../../models/admin/organization/organization';

export interface CreateOrganizationData {
  organizationType: string;
  name: string;
  email: string;
  phone?: string;
  country: string;
  city: string;
  timezone: string;
  address?: string;
  venueTemplate: string;
  isActive?: boolean;
}

export interface UpdateOrganizationData {
  organizationType?: string;
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  timezone?: string;
  address?: string;
  venueTemplate?: string;
  isActive?: boolean;
}

export interface OrganizationQuery {
  page?: number;
  limit?: number;
  search?: string;
  name?: string;
  organizationType?: string;
  isActive?: boolean;
}

export interface OrganizationsListResult {
  organizations: IOrganization[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}

