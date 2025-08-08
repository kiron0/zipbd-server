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
  subCities: SubDistrictInfo[];
}

export interface DistrictInfo {
  district: string;
  cities: CityInfo[];
}

export interface DistrictServiceResponse {
  district: string;
  cities: CityInfo[];
}

export interface BaseSearchResult {
  district: string;
  subCities: PostalEntry[];
}
