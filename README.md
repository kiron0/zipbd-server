# 🚀 ZipBD - Bangladesh Postal Code API

A comprehensive REST API providing postal code data for all 64 districts of Bangladesh. Built with Node.js, Express.js, and TypeScript.

## 🌟 Features

- **Complete Coverage**: All 64 districts of Bangladesh
- **Flexible Search**: Multiple search parameters and combinations
- **Partial Matching**: Smart search with partial text matching
- **RESTful API**: Clean, consistent API design
- **TypeScript**: Fully typed for better development experience
- **Error Handling**: Comprehensive error handling and validation
- **Documentation**: Interactive API documentation

## 🤝 Contributing

We welcome contributions! Please follow the structured workflow below to keep changes easy to review and ship.

### 1) Development Setup
- Fork and clone the repo
- Install deps: `bun install`
- Create `.env` (see `.env.example`)
- Start dev server: `bun run dev`
- Open docs: `http://localhost:8000/docs`

### 2) Branching & Commits
- Branch names:
  - `feat/<short-name>` for features
  - `fix/<short-name>` for bug fixes
  - `docs/<short-name>` for docs-only changes
- Use Conventional Commits where possible, e.g.
  - `feat(api): add XML download`
  - `fix(service): guard empty district input`

### 3) Coding Standards
- TypeScript strict mode is enabled; avoid `any`
- Keep functions small and well-named; prefer early returns
- Format with Prettier: `bun run format`

### 4) API Endpoints (for local testing)
```bash
# List all districts
curl http://localhost:8000/api/v1/districts

# List cities in a district
curl http://localhost:8000/api/v1/districts/dhaka/cities

# List post offices for a city in a district
curl http://localhost:8000/api/v1/districts/dhaka/cities/gulshan/post-offices

# All data with metadata
curl http://localhost:8000/api/v1/all

# Download (json|csv|xml|txt)
curl "http://localhost:8000/api/v1/download?format=json&district=dhaka&city=dhaka"
```

Notes:
- When a district or city is not found, responses may include a `suggestions: string[]` field with close matches.
- Interactive docs live at `/docs`; raw OpenAPI at `/docs.json`.

### 5) Updating Postal Codes (Data Model)
Data lives in `src/utils/postal-code.ts` and follows this shape:

```ts
type PostalEntry = { postOffice: string; postalCode: string };
type CityInfo = { city: string; postOffices: PostalEntry[] };
type DistrictInfo = { district: string; cities: CityInfo[] };

export const postalData: DistrictInfo[] = [
  {
    district: "Dhaka",
    cities: [
      {
        city: "Dhaka City",
        postOffices: [
          { postOffice: "Banani", postalCode: "1213" },
          { postOffice: "Gulshan-1", postalCode: "1212" },
        ],
      },
    ],
  },
];
```

Guidelines:
- Keep lists sorted A–Z (districts, cities, post offices)
- Avoid duplicates and ensure 4‑digit postal codes
- Use proper casing (e.g., `Gulshan-1`, not `gulshan-1`)

### 6) Swagger / Docs
- If you change endpoints or response shapes, update `src/docs/swagger.ts`
- We hide the global Schemas panel; focus on examples under each operation

### 7) Pull Request Checklist
- [ ] Branch is up-to-date with `main`
- [ ] Prettier run: `bun run format`
- [ ] New/changed endpoints are reflected in `src/docs/swagger.ts`
- [ ] Data changes validated locally against endpoints above
- [ ] PR description explains the what/why, and includes screenshots when UI is affected

### 8) Getting Help
- Check existing issues and discussions
- Open a new issue with clear reproduction or change request
- Small PRs are easier to review than large ones—iterate if needed

Thank you for contributing and helping make ZipBD better for everyone! 🚀

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/kiron0/zipbd/blob/main/LICENSE) file for details.

## 🙏 Acknowledgments

- Original data source and concept
- All contributors and users
- The Bangladesh postal service for the data

---

⭐ **Star this repository if it helped you!**

Happy coding! 🚀
