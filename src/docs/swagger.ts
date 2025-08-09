import type { Application, Request, Response } from "express";
import swaggerJsdoc, { type Options } from "swagger-jsdoc";
import config from "../config";

const CSS_URL = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css";
const JS_BUNDLE_URL =
  "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js";
const JS_STANDALONE_URL =
  "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "ZipBD API",
    version: "1.0.0",
    description:
      "Bangladesh postal codes API. Use these endpoints to query districts, cities and post offices.",
  },
  tags: [
    { name: "Postal", description: "Districts, cities and post offices" },
    { name: "Export", description: "Data download and export" },
  ],
  components: {
    schemas: {
      PostalEntry: {
        title: "PostalEntry",
        description: "Represents a single post office entry within a city",
        type: "object",
        properties: {
          city: { type: "string", example: "Dhaka" },
          postOffice: { type: "string", example: "Banani" },
          postalCode: { type: "string", example: "1213" },
        },
        required: ["city", "postOffice", "postalCode"],
        example: {
          city: "Dhaka City",
          postOffice: "Banani",
          postalCode: "1213",
        },
      },
      DistrictListResponse: {
        title: "DistrictListResponse",
        description: "Response containing a list of district names",
        allOf: [
          { $ref: "#/components/schemas/ApiResponse" },
          {
            type: "object",
            properties: {
              data: {
                type: "array",
                items: { type: "string" },
                example: ["Dhaka", "Chittagong"],
              },
            },
          },
        ],
      },
      CityListResponse: {
        title: "CityListResponse",
        description: "Response containing a list of city names for a district",
        allOf: [
          { $ref: "#/components/schemas/ApiResponse" },
          {
            type: "object",
            properties: {
              data: {
                type: "array",
                items: { type: "string" },
                example: ["Banani", "Gulshan"],
              },
            },
          },
        ],
      },
      PostOfficeListResponse: {
        title: "PostOfficeListResponse",
        description:
          "Response containing a list of post office entries for a city",
        allOf: [
          { $ref: "#/components/schemas/ApiResponse" },
          {
            type: "object",
            properties: {
              data: {
                type: "array",
                items: { $ref: "#/components/schemas/PostalEntry" },
              },
            },
          },
        ],
      },
      AllDataResponse: {
        title: "AllDataResponse",
        description: "Complete dataset with metadata for all districts",
        allOf: [
          { $ref: "#/components/schemas/ApiResponse" },
          {
            type: "object",
            properties: {
              data: {
                type: "object",
                properties: {
                  postalData: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        district: { type: "string" },
                        cities: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              city: { type: "string" },
                              postOffices: {
                                type: "array",
                                items: {
                                  $ref: "#/components/schemas/PostalEntry",
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  metadata: { $ref: "#/components/schemas/Metadata" },
                },
              },
            },
          },
        ],
      },
      DownloadJsonResponse: {
        title: "DownloadJsonResponse",
        description: "Response returned when format=json is used for downloads",
        allOf: [
          { $ref: "#/components/schemas/ApiResponse" },
          {
            type: "object",
            properties: {
              data: {
                type: "object",
                properties: {
                  total: { type: "integer" },
                  timestamp: { type: "string" },
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        district: { type: "string" },
                        city: { type: "string" },
                        postOffice: { type: "string" },
                        postalCode: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      },
      ApiResponse: {
        title: "ApiResponse",
        description: "Standard API response wrapper used across endpoints",
        type: "object",
        properties: {
          statusCode: { type: "integer", example: 200 },
          success: { type: "boolean", example: true },
          message: { type: "string", nullable: true },
          data: { nullable: true },
          error: { type: "string", nullable: true },
          suggestions: {
            type: "array",
            items: { type: "string" },
            nullable: true,
            description:
              "Suggested names for district or city when an exact match is not found",
          },
        },
        required: ["statusCode", "success"],
      },
      Metadata: {
        title: "Metadata",
        description:
          "Aggregated statistics about the dataset returned by some endpoints",
        type: "object",
        properties: {
          totalDistricts: { type: "integer", example: 64 },
          totalCities: { type: "integer", example: 490 },
          totalPostOffices: { type: "integer", example: 1360 },
        },
        example: {
          totalDistricts: 64,
          totalCities: 490,
          totalPostOffices: 1360,
        },
      },
    },
  },
  paths: {
    "/api/v1/districts": {
      get: {
        tags: ["Postal"],
        summary: "List all districts",
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DistrictListResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/districts/{district}/cities": {
      get: {
        tags: ["Postal"],
        summary: "List cities in a district",
        parameters: [
          {
            name: "district",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CityListResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/districts/{district}/cities/{city}/post-offices": {
      get: {
        tags: ["Postal"],
        summary: "List post offices in a city within a district",
        parameters: [
          {
            name: "district",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "city",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PostOfficeListResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/all": {
      get: {
        tags: ["Postal"],
        summary: "Get all postal data with metadata",
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AllDataResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/download": {
      get: {
        tags: ["Export"],
        summary: "Download postal data in various formats",
        parameters: [
          {
            name: "format",
            in: "query",
            description: "Output format",
            required: false,
            schema: {
              type: "string",
              enum: ["json", "csv", "xml", "txt"],
              default: "json",
            },
          },
          {
            name: "district",
            in: "query",
            required: false,
            schema: { type: "string" },
          },
          {
            name: "city",
            in: "query",
            required: false,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DownloadJsonResponse" },
              },
              "text/csv": { schema: { type: "string" } },
              "application/xml": { schema: { type: "string" } },
              "text/plain": { schema: { type: "string" } },
            },
          },
        },
      },
    },
  },
} as const;

const options: Options = { definition: swaggerDefinition, apis: [] };
export const swaggerSpec = swaggerJsdoc(options);

export function mountSwagger(app: Application): void {
  app.get("/swagger-custom.js", (_req: Request, res: Response) => {
    const script = `
      (function () {
        function linkTitle() {
          var titleEl = document.querySelector('.swagger-ui .info .title');
          if (!titleEl) return;
          if (titleEl.getAttribute('data-home-linked') === 'true') return;
          titleEl.setAttribute('data-home-linked', 'true');
          titleEl.style.cursor = 'pointer';
          titleEl.addEventListener('click', function () { window.location.href = '/'; });
        }
        var observer = new MutationObserver(function () { linkTitle(); });
        observer.observe(document.body, { childList: true, subtree: true });
        linkTitle();
      })();
    `;
    res.type("application/javascript").send(script);
  });
  app.get("/docs.json", async (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  app.get("/docs", (_req: Request, res: Response) => {
    const validatorUrl = config.env === "production" ? "null" : "undefined";
    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>ZipBD API Docs</title>
    <link rel="stylesheet" href="${CSS_URL}" />
    <style>
      .topbar { display: none; }
      .swagger-ui .info .title small { background: #059669; }
      .swagger-ui .model-box { border-radius: 8px; }
      .swagger-ui .opblock-tag { font-size: 1.1rem; }
      .swagger-ui section.models, .swagger-ui .models { display: none !important; }
      .swagger-ui .info a.link { display: none !important; }
      .swagger-ui .info .base-url { display: none !important; }
      .swagger-ui .info .url { display: none !important; }
      body { margin: 0; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="${JS_BUNDLE_URL}"></script>
    <script src="${JS_STANDALONE_URL}"></script>
    <script src="/swagger-custom.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/docs.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        docExpansion: 'list',
        defaultModelsExpandDepth: -1,
        defaultModelExpandDepth: 0,
        displayRequestDuration: true,
        validatorUrl: ${validatorUrl},
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: 'StandaloneLayout'
      });
    </script>
  </body>
</html>`;
    res.type("text/html").send(html);
  });
}
