import type {
  BaseSearchResult,
  CityInfo,
  DistrictData,
  DistrictServiceResponse,
  PostalEntry,
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

  return Object.entries(cityGroups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([cityName, cityEntries]) => ({
      city: cityName,
      subCities: cityEntries
        .map((entry) => ({
          sub: entry.sub,
          postalCode: entry.postalCode,
        }))
        .sort((a, b) => a.sub.localeCompare(b.sub)),
    }));
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

export async function getAllDistrictsService(): Promise<{
  data: string[];
  message: string;
}> {
  const districts = Object.keys(postalData).sort((a, b) => a.localeCompare(b));
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
  const cities = [...new Set(districtEntries.map((entry) => entry.city))].sort(
    (a, b) => a.localeCompare(b),
  );

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
  const subCities = districtEntries
    .filter((entry) => entry.city.toLowerCase() === lowerCity)
    .sort((a, b) => a.sub.localeCompare(b.sub));

  return {
    data: subCities,
    message: `Found ${subCities.length} sub-cities in ${matchedDistrict}`,
  };
}

export async function getAllDataService(): Promise<{
  data: DistrictServiceResponse[];
  message: string;
}> {
  const data = Object.entries(postalData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([district, subCities]) => ({
      district,
      cities: groupByCityAndFormat(subCities),
    }));
  return {
    data,
    message: `Found ${data.length} districts`,
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
  let dataToExport: any;

  if (district) {
    const districtResult = await searchByDistrictBase(district);
    if (districtResult.subCities.length === 0) {
      throw new Error("District not found");
    }

    if (city) {
      const cityEntries = districtResult.subCities.filter(
        (entry) =>
          entry.city.toLowerCase() === city.toLowerCase() ||
          entry.city.toLowerCase().includes(city.toLowerCase()),
      );

      if (cityEntries.length === 0) {
        throw new Error("City not found in the specified district");
      }

      dataToExport = cityEntries
        .map((entry) => ({
          district: districtResult.district,
          city: entry.city,
          sub: entry.sub,
          postalCode: entry.postalCode,
        }))
        .sort((a, b) => a.sub.localeCompare(b.sub));
    } else {
      dataToExport = districtResult.subCities
        .map((entry) => ({
          district: districtResult.district,
          city: entry.city,
          sub: entry.sub,
          postalCode: entry.postalCode,
        }))
        .sort((a, b) => a.sub.localeCompare(b.sub));
    }
  } else {
    dataToExport = Object.entries(postalData)
      .flatMap(([district, entries]) =>
        entries.map((entry) => ({
          district,
          city: entry.city,
          sub: entry.sub,
          postalCode: entry.postalCode,
        })),
      )
      .sort((a, b) => a.sub.localeCompare(b.sub));
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
