import type {
  BaseSearchResult,
  DistrictInfo,
  PostalEntry,
  Response,
} from "../../../types";
import { postalData } from "../../../utils";

const districtsArray: DistrictInfo[] = postalData;

function flattenDistrict(d: DistrictInfo): PostalEntry[] {
  return d.cities.flatMap((c) =>
    c.postOffices.map((po) => ({
      city: c.city,
      postOffice: po.postOffice,
      postalCode: po.postalCode,
    })),
  );
}

async function searchByDistrictBase(
  district: string,
): Promise<BaseSearchResult> {
  if (!district || typeof district !== "string") {
    throw new Error("District is required");
  }

  const lowerDistrict = district.toLowerCase();

  const matched = districtsArray.find(
    (d) => d.district.toLowerCase() === lowerDistrict,
  );

  if (!matched) {
    return { district, postOffices: [] };
  }

  return {
    district: matched.district,
    postOffices: flattenDistrict(matched),
  };
}

export async function getAllDistrictsService(): Promise<{
  data: string[];
  message: string;
}> {
  const districts: string[] = districtsArray
    .map((d) => d.district)
    .sort((a, b) => a.localeCompare(b));
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
  const matched = districtsArray.find(
    (d) => d.district.toLowerCase() === lowerDistrict,
  );

  if (!matched) {
    return { data: [], message: "District not found" };
  }

  const cities: string[] = matched.cities
    .map((c) => c.city)
    .sort((a, b) => a.localeCompare(b));

  return {
    data: cities,
    message: `Found ${cities.length} cities in ${matched.district}`,
  };
}

export async function getPostOfficesByDistrictService(
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

  const matchedDistrict = districtsArray.find(
    (d) => d.district.toLowerCase() === lowerDistrict,
  );

  if (!matchedDistrict) {
    return { data: [], message: "District not found" };
  }

  const cityInfo = matchedDistrict.cities.find(
    (c) => c.city.toLowerCase() === lowerCity,
  );
  if (!cityInfo) {
    return { data: [], message: "City not found in the specified district" };
  }
  const postOffices: PostalEntry[] = cityInfo.postOffices
    .map((po) => ({
      city: cityInfo.city,
      postOffice: po.postOffice,
      postalCode: po.postalCode,
    }))
    .sort((a, b) => a.postOffice.localeCompare(b.postOffice));

  return {
    data: postOffices,
    message: `Found ${postOffices.length} post offices in ${matchedDistrict.district}`,
  };
}

export async function getAllDataService(): Promise<Response> {
  const data = [...districtsArray].sort((a, b) =>
    a.district.localeCompare(b.district),
  );

  const totalDistricts = data.length;
  const totalCities = data.reduce((acc, d) => acc + d.cities.length, 0);
  const totalPostOffices = data.reduce(
    (acc, d) => acc + d.cities.reduce((a, c) => a + c.postOffices.length, 0),
    0,
  );

  return {
    data,
    metadata: {
      totalDistricts,
      totalCities,
      totalPostOffices,
    },
    message: `Found ${totalDistricts} districts, ${totalCities} cities, and ${totalPostOffices} post offices`,
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
    if (districtResult.postOffices.length === 0) {
      throw new Error("District not found");
    }

    if (city) {
      const cityEntries = districtResult.postOffices.filter(
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
          postOffice: entry.postOffice,
          postalCode: entry.postalCode,
        }))
        .sort((a, b) => a.postOffice.localeCompare(b.postOffice));
    } else {
      dataToExport = districtResult.postOffices
        .map((entry) => ({
          district: districtResult.district,
          city: entry.city,
          postOffice: entry.postOffice,
          postalCode: entry.postalCode,
        }))
        .sort((a, b) => a.postOffice.localeCompare(b.postOffice));
    }
  } else {
    dataToExport = districtsArray
      .flatMap((d) =>
        d.cities.flatMap((c) =>
          c.postOffices.map((po) => ({
            district: d.district,
            city: c.city,
            postOffice: po.postOffice,
            postalCode: po.postalCode,
          })),
        ),
      )
      .sort((a, b) => a.postOffice.localeCompare(b.postOffice));
  }

  const timestamp = new Date().toISOString().split("T")[0];

  switch (format.toLowerCase()) {
    case "csv":
      const csvHeaders = "District,City,Post Office,Postal Code\n";
      const csvData = dataToExport
        .map(
          (entry: any) =>
            `"${entry.district}","${entry.city}","${entry.postOffice}","${entry.postalCode}"`,
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
    <postOffice>${entry.postOffice}</postOffice>
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
            `${entry.district}\t${entry.city}\t${entry.postOffice}\t${entry.postalCode}`,
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
