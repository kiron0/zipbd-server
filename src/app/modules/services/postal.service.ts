import type {
  BaseSearchResult,
  CityInfo,
  DistrictData,
  DistrictServiceResponse,
  FilterResult,
  PostalEntry,
  SearchParams,
  SearchServiceResponse,
} from "../../../types";
import { postalData } from "../../../utils";

function groupByCityAndFormat(entries: PostalEntry[]): CityInfo[] {
  const cityGroups: { [city: string]: PostalEntry[] } = {};

  entries.forEach((entry) => {
    if (!cityGroups[entry.city]) {
      cityGroups[entry.city] = [];
    }
    cityGroups[entry.city].push(entry);
  });

  return Object.entries(cityGroups).map(([cityName, cityEntries]) => ({
    city: cityName,
    subCities: cityEntries.map((entry) => ({
      sub: entry.sub,
      postalCode: entry.postalCode,
    })),
  }));
}

function formatSearchResultsWithPostalCodes(entries: PostalEntry[]): Array<{
  city: string;
  sub: string;
  postalCode: string;
}> {
  return entries.map((entry) => ({
    city: entry.city,
    sub: entry.sub,
    postalCode: entry.postalCode,
  }));
}

function formatSearchResultsWithDistrict(
  entries: PostalEntry[],
  district: string,
): Array<{
  district: string;
  city: string;
  sub: string;
  postalCode: string;
}> {
  return entries.map((entry) => ({
    district,
    city: entry.city,
    sub: entry.sub,
    postalCode: entry.postalCode,
  }));
}

export function filterEntriesBy(
  field: keyof PostalEntry,
  value: string,
): FilterResult {
  const lowerValue = String(value).toLowerCase();
  const results: PostalEntry[] = [];

  for (const district of Object.values(postalData)) {
    for (const entry of district) {
      if (entry[field].toLowerCase().includes(lowerValue)) {
        results.push(entry);
      }
    }
  }

  return results.length === 1 ? results[0] : results;
}

async function searchByDistrictBase(
  district: string,
): Promise<BaseSearchResult> {
  if (!district || typeof district !== "string") {
    throw new Error("District is required");
  }

  const lowerDistrict = district.toLowerCase();

  const matchedKey = Object.keys(postalData).find(
    (key) => key.toLowerCase() === lowerDistrict,
  );

  if (!matchedKey) {
    return { district, subCities: [] };
  }

  return {
    district: matchedKey,
    subCities: postalData[matchedKey as keyof DistrictData],
  };
}

export async function searchByDistrictService(
  district: string,
): Promise<{ data: DistrictServiceResponse; message: string }> {
  const result = await searchByDistrictBase(district);

  return {
    data: {
      district: result.district,
      cities: groupByCityAndFormat(result.subCities),
    },
    message:
      result.subCities && result.subCities.length > 0
        ? `Found ${result.subCities.length} cities in ${result.district}`
        : "No districts found",
  };
}

export async function searchByCityService(
  city: string,
): Promise<{ data: CityInfo[]; message: string }> {
  if (!city || typeof city !== "string") {
    throw new Error("City is required");
  }

  const results = filterEntriesBy("city", city);

  const resultsArray = Array.isArray(results) ? results : [results];

  return {
    data: groupByCityAndFormat(resultsArray),
    message:
      Array.isArray(resultsArray) && resultsArray.length > 0
        ? `Found ${resultsArray.length} cities with matching criteria`
        : "No cities found",
  };
}

export async function searchBySubService(
  sub: string,
): Promise<{ data: CityInfo[]; message: string }> {
  if (!sub || typeof sub !== "string") {
    throw new Error("Sub is required");
  }

  const results = filterEntriesBy("sub", sub);

  const resultsArray = Array.isArray(results) ? results : [results];

  return {
    data: groupByCityAndFormat(resultsArray),
    message:
      Array.isArray(resultsArray) && resultsArray.length > 0
        ? `Found ${resultsArray.length} cities with matching sub-areas`
        : "No sub-areas found",
  };
}

export async function searchByCodeService(
  code: string,
): Promise<{ data: CityInfo[]; message: string }> {
  if (!code || typeof code !== "string") {
    throw new Error("Code is required");
  }

  const results = filterEntriesBy("postalCode", code);

  const resultsArray = Array.isArray(results) ? results : [results];

  return {
    data: groupByCityAndFormat(resultsArray),
    message:
      Array.isArray(resultsArray) && resultsArray.length > 0
        ? `Found ${resultsArray.length} cities with matching postal codes`
        : "No postal codes found",
  };
}

export async function getAllDataService(): Promise<{
  data: DistrictServiceResponse[];
  message: string;
}> {
  const data = Object.entries(postalData).map(([district, subCities]) => ({
    district,
    cities: groupByCityAndFormat(subCities),
  }));
  return {
    data,
    message: `Found ${data.length} districts`,
  };
}

async function searchByDistrict(district: string): Promise<PostalEntry[]> {
  const result = await searchByDistrictBase(district);
  return result.subCities;
}

async function searchByDistrictForSearch(district: string): Promise<
  Array<{
    district: string;
    city: string;
    sub: string;
    postalCode: string;
  }>
> {
  const entries = await searchByDistrict(district);
  return formatSearchResultsWithDistrict(entries, district);
}

async function searchByCityForSearch(city: string): Promise<
  Array<{
    district: string;
    city: string;
    sub: string;
    postalCode: string;
  }>
> {
  const results = filterEntriesBy("city", city);
  const resultsArray = Array.isArray(results) ? results : [results];

  // Find district for each entry
  const entriesWithDistrict: Array<{
    district: string;
    city: string;
    sub: string;
    postalCode: string;
  }> = [];

  for (const entry of resultsArray) {
    for (const [districtName, districtEntries] of Object.entries(postalData)) {
      if (
        districtEntries.some(
          (districtEntry) =>
            districtEntry.city === entry.city &&
            districtEntry.sub === entry.sub &&
            districtEntry.postalCode === entry.postalCode,
        )
      ) {
        entriesWithDistrict.push({
          district: districtName,
          city: entry.city,
          sub: entry.sub,
          postalCode: entry.postalCode,
        });
        break;
      }
    }
  }

  return entriesWithDistrict;
}

async function searchBySubForSearch(sub: string): Promise<
  Array<{
    district: string;
    city: string;
    sub: string;
    postalCode: string;
  }>
> {
  const results = filterEntriesBy("sub", sub);
  const resultsArray = Array.isArray(results) ? results : [results];

  // Find district for each entry
  const entriesWithDistrict: Array<{
    district: string;
    city: string;
    sub: string;
    postalCode: string;
  }> = [];

  for (const entry of resultsArray) {
    for (const [districtName, districtEntries] of Object.entries(postalData)) {
      if (
        districtEntries.some(
          (districtEntry) =>
            districtEntry.city === entry.city &&
            districtEntry.sub === entry.sub &&
            districtEntry.postalCode === entry.postalCode,
        )
      ) {
        entriesWithDistrict.push({
          district: districtName,
          city: entry.city,
          sub: entry.sub,
          postalCode: entry.postalCode,
        });
        break;
      }
    }
  }

  return entriesWithDistrict;
}

async function searchByCodeForSearch(code: string): Promise<
  Array<{
    district: string;
    city: string;
    sub: string;
    postalCode: string;
  }>
> {
  const results = filterEntriesBy("postalCode", code);
  const resultsArray = Array.isArray(results) ? results : [results];

  // Find district for each entry
  const entriesWithDistrict: Array<{
    district: string;
    city: string;
    sub: string;
    postalCode: string;
  }> = [];

  for (const entry of resultsArray) {
    for (const [districtName, districtEntries] of Object.entries(postalData)) {
      if (
        districtEntries.some(
          (districtEntry) =>
            districtEntry.city === entry.city &&
            districtEntry.sub === entry.sub &&
            districtEntry.postalCode === entry.postalCode,
        )
      ) {
        entriesWithDistrict.push({
          district: districtName,
          city: entry.city,
          sub: entry.sub,
          postalCode: entry.postalCode,
        });
        break;
      }
    }
  }

  return entriesWithDistrict;
}

export async function searchService(
  params: SearchParams,
): Promise<SearchServiceResponse> {
  const validParams = Object.entries(params).filter(
    ([_, value]) =>
      value && typeof value === "string" && value.trim().length > 0,
  );

  if (validParams.length === 0) {
    return { data: null, message: "No valid search parameters provided" };
  }

  if (validParams.length === 1 && validParams[0][0] === "district") {
    const district = validParams[0][1];
    const lowerDistrict = district.toLowerCase();

    const matchedDistrict = Object.keys(postalData).find(
      (key) =>
        key.toLowerCase() === lowerDistrict ||
        key.toLowerCase().includes(lowerDistrict),
    );

    if (!matchedDistrict) {
      return { data: null, message: "District not found" };
    }

    const districtEntries = postalData[matchedDistrict as keyof DistrictData];
    return {
      data: districtEntries,
      message: `Found ${districtEntries.length} entries in ${matchedDistrict}`,
    };
  }

  if (
    validParams.length === 2 &&
    validParams.some(([key]) => key === "district") &&
    validParams.some(([key]) => key === "city")
  ) {
    const district = validParams.find(([key]) => key === "district")![1];
    const city = validParams.find(([key]) => key === "city")![1];

    const districtResult = await searchByDistrictBase(district);
    if (districtResult.subCities.length === 0) {
      return { data: null, message: "District not found" };
    }

    const cityEntries = districtResult.subCities.filter(
      (entry) =>
        entry.city.toLowerCase() === city.toLowerCase() ||
        entry.city.toLowerCase().includes(city.toLowerCase()),
    );

    if (cityEntries.length === 0) {
      return {
        data: null,
        message: "City not found in the specified district",
      };
    }

    return {
      data: cityEntries,
      message: `Found ${cityEntries.length} entries in ${districtResult.district}`,
    };
  }

  if (
    validParams.length === 3 &&
    validParams.some(([key]) => key === "district") &&
    validParams.some(([key]) => key === "city") &&
    validParams.some(([key]) => key === "sub")
  ) {
    const district = validParams.find(([key]) => key === "district")![1];
    const city = validParams.find(([key]) => key === "city")![1];
    const sub = validParams.find(([key]) => key === "sub")![1];

    const districtResult = await searchByDistrictBase(district);
    if (districtResult.subCities.length === 0) {
      return { data: null, message: "District not found" };
    }

    const cityEntries = districtResult.subCities.filter(
      (entry) => entry.city.toLowerCase() === city.toLowerCase(),
    );

    if (cityEntries.length === 0) {
      return {
        data: null,
        message: "City not found in the specified district",
      };
    }

    const matchingEntries = cityEntries.filter((entry) =>
      entry.sub.toLowerCase().includes(sub.toLowerCase()),
    );

    if (matchingEntries.length === 0) {
      return {
        data: null,
        message: "Sub-area not found in the specified city and district",
      };
    }

    return {
      data: matchingEntries,
      message: `Found ${matchingEntries.length} entries in ${cityEntries[0].city}, ${districtResult.district}`,
    };
  }

  if (
    validParams.length === 3 &&
    validParams.some(([key]) => key === "district") &&
    validParams.some(([key]) => key === "city") &&
    validParams.some(([key]) => key === "code")
  ) {
    const district = validParams.find(([key]) => key === "district")![1];
    const city = validParams.find(([key]) => key === "city")![1];
    const code = validParams.find(([key]) => key === "code")![1];

    const districtResult = await searchByDistrictBase(district);
    if (districtResult.subCities.length === 0) {
      return { data: null, message: "District not found" };
    }

    if (!code || code.trim() === "") {
      const cityEntries = districtResult.subCities.filter(
        (entry) => entry.city.toLowerCase() === city.toLowerCase(),
      );

      if (cityEntries.length === 0) {
        return {
          data: null,
          message: "City not found in the specified district",
        };
      }

      return {
        data: cityEntries,
        message: `Found ${cityEntries.length} entries for ${cityEntries[0].city} in ${districtResult.district}`,
      };
    }

    const matchingEntries = districtResult.subCities.filter(
      (entry) =>
        entry.city.toLowerCase() === city.toLowerCase() &&
        entry.postalCode === code,
    );

    if (matchingEntries.length === 0) {
      return {
        data: null,
        message: "Postal code not found for the specified city and district",
      };
    }

    return {
      data: matchingEntries,
      message: `Found ${matchingEntries.length} entry(ies) for postal code ${code}`,
    };
  }

  if (
    validParams.length === 4 &&
    validParams.some(([key]) => key === "district") &&
    validParams.some(([key]) => key === "city") &&
    validParams.some(([key]) => key === "sub") &&
    validParams.some(([key]) => key === "code")
  ) {
    const district = validParams.find(([key]) => key === "district")![1];
    const city = validParams.find(([key]) => key === "city")![1];
    const sub = validParams.find(([key]) => key === "sub")![1];
    const code = validParams.find(([key]) => key === "code")![1];

    const districtResult = await searchByDistrictBase(district);
    if (districtResult.subCities.length === 0) {
      return { data: null, message: "District not found" };
    }

    const matchingEntries = districtResult.subCities.filter(
      (entry) =>
        entry.city.toLowerCase() === city.toLowerCase() &&
        entry.sub.toLowerCase() === sub.toLowerCase() &&
        entry.postalCode === code,
    );

    if (matchingEntries.length === 0) {
      return {
        data: null,
        message: "Postal code not found for the specified location",
      };
    }

    return {
      data: matchingEntries,
      message: `Found ${matchingEntries.length} entry(ies) for the specified location`,
    };
  }

  const searchPromises = validParams.map(async ([key, value]) => {
    try {
      let result;
      switch (key) {
        case "district":
          result = await searchByDistrictForSearch(value);
          break;
        case "city":
          result = await searchByCityForSearch(value);
          break;
        case "sub":
          result = await searchBySubForSearch(value);
          break;
        case "code":
          result = await searchByCodeForSearch(value);
          break;
        default:
          return { key, success: false, error: "Invalid search parameter" };
      }

      return { key, success: true, result };
    } catch (error) {
      return {
        key,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        result: null,
      };
    }
  });

  const searchResults = await Promise.all(searchPromises);

  const allResults: Array<{
    district: string;
    city: string;
    sub: string;
    postalCode: string;
  }> = [];

  let hasValidResults = false;

  searchResults.forEach(({ key, success, result, error }) => {
    if (success && result && Array.isArray(result)) {
      allResults.push(...result);
      hasValidResults = true;
    }
  });

  return {
    data: hasValidResults ? allResults : null,
    message: hasValidResults
      ? "Search completed successfully"
      : "No results found for the provided parameters",
  };
}
