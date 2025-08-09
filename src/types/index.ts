export interface PostalEntry {
  city: string;
  postOffice: string;
  postalCode: string;
}

export interface DistrictData {
  [districtName: string]: PostalEntry[];
}

export interface PostOfficeInfo {
  postOffice: string;
  postalCode: string;
}

export interface CityInfo {
  city: string;
  postOffices: PostOfficeInfo[];
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
  postOffices: PostalEntry[];
}
