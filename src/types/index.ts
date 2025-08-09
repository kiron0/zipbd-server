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

export interface Response {
  data: DistrictInfo[];
  metadata: {
    totalDistricts: number;
    totalCities: number;
    totalPostOffices: number;
  };
  message: string;
}

export interface BaseSearchResult {
  district: string;
  postOffices: PostalEntry[];
}
