export interface PostalEntry {
  city: string;
  sub: string;
  postalCode: string;
}

export interface DistrictData {
  [districtName: string]: PostalEntry[];
}

export interface SubDistrictInfo {
  sub: string;
  postalCode: string;
}

export interface CityInfo {
  city: string;
  subDistricts: SubDistrictInfo[];
}

export interface DistrictInfo {
  district: string;
  cities: CityInfo[];
}

export interface SearchParams {
  district?: string;
  city?: string;
  sub?: string;
  code?: string;
}

export interface DistrictServiceResponse {
  district: string;
  cities: CityInfo[];
}

export interface SearchServiceResponse {
  data: Record<string, any> | null;
  message: string;
}

export interface BaseSearchResult {
  district: string;
  subDistricts: PostalEntry[];
}

export type FilterResult = PostalEntry | PostalEntry[];
