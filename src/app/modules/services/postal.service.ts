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

export async function getAllDistrictsService(): Promise<{
  data: string[];
  message: string;
}> {
  const districts = Object.keys(postalData);
  return {
    data: districts,
    message: `Found ${districts.length} districts`,
  };
}

export async function getCitiesByDistrictService(district: string): Promise<{
  data: string[];
  message: string;
}> {
  if (!district || typeof district !== "string") {
    throw new Error("District is required");
  }

  const lowerDistrict = district.toLowerCase();
  const matchedKey = Object.keys(postalData).find(
    (key) => key.toLowerCase() === lowerDistrict,
  );

  if (!matchedKey) {
    return { data: [], message: "District not found" };
  }

  const districtEntries = postalData[matchedKey as keyof DistrictData];
  const cities = [...new Set(districtEntries.map((entry) => entry.city))];

  return {
    data: cities,
    message: `Found ${cities.length} cities in ${matchedKey}`,
  };
}

export async function getSubCitiesByDistrictService(
  district: string,
  city: string,
): Promise<{
  data: PostalEntry[];
  message: string;
}> {
  if (!district || typeof district !== "string" || !district.trim()) {
    throw new Error("District is required");
  }

  if (!city || typeof city !== "string" || !city.trim()) {
    throw new Error("City is required");
  }

  const lowerDistrict = district.trim().toLowerCase();
  const lowerCity = city.trim().toLowerCase();

  const matchedDistrict = Object.keys(postalData).find(
    (key) => key.toLowerCase() === lowerDistrict,
  );

  if (!matchedDistrict) {
    return { data: [], message: "District not found" };
  }

  const districtEntries = postalData[matchedDistrict as keyof DistrictData];
  const subCities = districtEntries.filter(
    (entry) => entry.city.toLowerCase() === lowerCity,
  );

  return {
    data: subCities,
    message: `Found ${subCities.length} sub-cities in ${matchedDistrict}`,
  };
}

async function findEntriesWithDistrict(entries: PostalEntry[]): Promise<
  Array<{
    district: string;
    city: string;
    sub: string;
    postalCode: string;
  }>
> {
  const entriesWithDistrict: Array<{
    district: string;
    city: string;
    sub: string;
    postalCode: string;
  }> = [];

  for (const entry of entries) {
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

  // Handle district-only search
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

    const entriesWithDistrict = districtEntries.map((entry) => ({
      district: matchedDistrict,
      city: entry.city,
      sub: entry.sub,
      postalCode: entry.postalCode,
    }));

    return {
      data: entriesWithDistrict,
      message: `Found ${entriesWithDistrict.length} entries in ${matchedDistrict}`,
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

    const entriesWithDistrict = cityEntries.map((entry) => ({
      district: districtResult.district,
      city: entry.city,
      sub: entry.sub,
      postalCode: entry.postalCode,
    }));

    return {
      data: entriesWithDistrict,
      message: `Found ${entriesWithDistrict.length} entries in ${districtResult.district}`,
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

    const subEntries = cityEntries.filter(
      (entry) =>
        entry.sub.toLowerCase() === sub.toLowerCase() ||
        entry.sub.toLowerCase().includes(sub.toLowerCase()),
    );

    if (subEntries.length === 0) {
      return {
        data: null,
        message: "Sub-area not found in the specified city",
      };
    }

    const entriesWithDistrict = subEntries.map((entry) => ({
      district: districtResult.district,
      city: entry.city,
      sub: entry.sub,
      postalCode: entry.postalCode,
    }));

    return {
      data: entriesWithDistrict,
      message: `Found ${entriesWithDistrict.length} entries in ${districtResult.district}`,
    };
  }

  const searchPromises = validParams.map(async ([key, value]) => {
    try {
      const results = filterEntriesBy(key as keyof PostalEntry, value);
      const resultsArray = Array.isArray(results) ? results : [results];
      const entriesWithDistrict = await findEntriesWithDistrict(resultsArray);

      return { key, success: true, result: entriesWithDistrict };
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

  const uniqueResults = allResults.filter((item, index, self) => {
    const key = `${item.district}-${item.city}-${item.sub}-${item.postalCode}`;
    return (
      index ===
      self.findIndex(
        (t) => `${t.district}-${t.city}-${t.sub}-${t.postalCode}` === key,
      )
    );
  });

  return {
    data: hasValidResults ? uniqueResults : null,
    message: hasValidResults
      ? "Search completed successfully"
      : "No results found for the provided parameters",
  };
}

export async function downloadDataService(
  format: string = "json",
  district?: string,
  city?: string,
): Promise<{
  data: any;
  message: string;
  contentType: string;
  filename: string;
}> {
  // Get all data or filter by district/city
  let dataToExport: any;

  if (district) {
    const districtResult = await searchByDistrictBase(district);
    if (districtResult.subCities.length === 0) {
      throw new Error("District not found");
    }

    if (city) {
      // Filter by both district and city
      const cityEntries = districtResult.subCities.filter(
        (entry) =>
          entry.city.toLowerCase() === city.toLowerCase() ||
          entry.city.toLowerCase().includes(city.toLowerCase()),
      );

      if (cityEntries.length === 0) {
        throw new Error("City not found in the specified district");
      }

      dataToExport = cityEntries.map((entry) => ({
        district: districtResult.district,
        city: entry.city,
        sub: entry.sub,
        postalCode: entry.postalCode,
      }));
    } else {
      // Filter by district only
      dataToExport = districtResult.subCities.map((entry) => ({
        district: districtResult.district,
        city: entry.city,
        sub: entry.sub,
        postalCode: entry.postalCode,
      }));
    }
  } else {
    // Get all data
    dataToExport = Object.entries(postalData).flatMap(([district, entries]) =>
      entries.map((entry) => ({
        district,
        city: entry.city,
        sub: entry.sub,
        postalCode: entry.postalCode,
      })),
    );
  }

  const timestamp = new Date().toISOString().split("T")[0];

  switch (format.toLowerCase()) {
    case "csv":
      const csvHeaders = "District,City,Sub-City,Postal Code\n";
      const csvData = dataToExport
        .map(
          (entry: any) =>
            `"${entry.district}","${entry.city}","${entry.sub}","${entry.postalCode}"`,
        )
        .join("\n");
      const csvContent = csvHeaders + csvData;

      return {
        data: csvContent,
        message: `Downloaded ${dataToExport.length} records in CSV format`,
        contentType: "text/csv",
        filename: `postal-codes-${district || "all"}-${timestamp}.csv`,
      };

    case "xml":
      const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<postalCodes>
  ${dataToExport
    .map(
      (entry: any) => `
  <entry>
    <district>${entry.district}</district>
    <city>${entry.city}</city>
    <sub>${entry.sub}</sub>
    <postalCode>${entry.postalCode}</postalCode>
  </entry>`,
    )
    .join("")}
</postalCodes>`;

      return {
        data: xmlContent,
        message: `Downloaded ${dataToExport.length} records in XML format`,
        contentType: "application/xml",
        filename: `postal-codes-${district || "all"}-${timestamp}.xml`,
      };

    case "txt":
      const txtContent = dataToExport
        .map(
          (entry: any) =>
            `${entry.district}\t${entry.city}\t${entry.sub}\t${entry.postalCode}`,
        )
        .join("\n");

      return {
        data: txtContent,
        message: `Downloaded ${dataToExport.length} records in TXT format`,
        contentType: "text/plain",
        filename: `postal-codes-${district || "all"}-${timestamp}.txt`,
      };

    case "json":
    default:
      return {
        data: {
          total: dataToExport.length,
          timestamp: new Date().toISOString(),
          data: dataToExport,
        },
        message: `Downloaded ${dataToExport.length} records in JSON format`,
        contentType: "application/json",
        filename: `postal-codes-${district || "all"}-${timestamp}.json`,
      };
  }
}
