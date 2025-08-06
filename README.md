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

## 🚀 Quick Start

### Installation

```bash
git clone https://github.com/kiron0/zipbd-server.git
cd zipbd-server
bun install
```

### Environment Setup

Create a `.env` file in the server directory:

```bash
touch .env
```

Add the following environment variables to your `.env` file:

```env
NODE_ENV=development
PORT=8000
```

### Development

```bash
bun run dev
```

### Production

```bash
bun run build
```

## 🤝 Contributing

We welcome contributions! Here's how you can help improve ZipBD:

### General Contribution Guidelines

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 📮 Updating Postal Codes

If you need to update or add postal codes, follow these steps:

#### Step 1: Locate the Data File
The postal code data is stored in the `src/utils/postal-code.ts` file. The data is organized by districts with each district containing an array of postal entries.

#### Step 2: Understand the Data Structure
The postal data follows this structure in the `postalData` object:

```typescript
export const postalData: DistrictData = {
  "DistrictName": [
    {
      city: "City Name",
      sub: "Sub-area Name",
      postalCode: "1234"
    },
    {
      city: "Another City",
      sub: "Another Sub-area",
      postalCode: "1235"
    }
  ]
}
```

Each entry contains:
- `city`: The city name
- `sub`: The sub-area or specific location name
- `postalCode`: The 4-digit postal code

#### Step 3: Add or Update Postal Codes

**To add a new postal entry to an existing district:**
- Find the district in the `postalData` object
- Add a new entry to the district's array:

```typescript
"Existing District": [
  // ... existing entries
  {
    city: "New City",
    sub: "New Sub-area",
    postalCode: "1234"
  }
]
```

**To update an existing postal code:**
- Find the specific entry in the district array
- Update the `city`, `sub`, or `postalCode` values as needed

#### Step 4: Validate Your Changes
After updating the data:

1. **Test the API locally:**
   ```bash
   bun run dev
   ```

2. **Test your new postal codes:**
   ```bash
   # Test district search
   curl http://localhost:8000/api/v1/district/your-district-name

   # Test city search
   curl http://localhost:8000/api/v1/city/your-city-name

   # Test postal code search
   curl http://localhost:8000/api/v1/code/your-postal-code
   ```

3. **Verify search functionality:**
   - Test partial matching for district/city names
   - Test exact matching for postal codes
   - Test multi-parameter searches

#### Step 5: Submit Your Changes

1. **Create a descriptive commit message:**
   ```bash
   git commit -m "Add postal codes for [District/City/Area]"
   ```

2. **Include in your PR description:**
   - What postal codes you added/updated
   - Which districts/cities were affected
   - Any special considerations or notes

#### Step 6: Quality Checklist

Before submitting your PR, ensure:

- [ ] All new postal codes are valid and accurate
- [ ] Data structure follows the established format (flat array under each district)
- [ ] API endpoints return correct results for your changes
- [ ] No duplicate entries exist within the same district
- [ ] District, city, and sub-area names are properly formatted
- [ ] Postal codes are in the correct format (4 digits for Bangladesh)
- [ ] Each entry has all three required fields: `city`, `sub`, and `postalCode`
- [ ] The `postalData` object structure is maintained

#### Common Issues to Avoid

- **Duplicate entries**: Check existing data within the same district before adding
- **Incorrect formatting**: Follow the exact TypeScript structure with `city`, `sub`, and `postalCode` fields
- **Invalid postal codes**: Ensure codes are 4 digits and valid for Bangladesh
- **Missing data**: Ensure all three required fields (`city`, `sub`, `postalCode`) are present
- **Wrong data structure**: Don't use nested objects - use flat arrays under each district
- **Inconsistent naming**: Use consistent naming conventions for districts, cities, and sub-areas

#### Need Help?

If you're unsure about the data structure or need help with your contribution:

1. Check existing data entries for reference
2. Open an issue describing what you want to add/update
3. Ask questions in the issue or PR comments

Your contributions help make ZipBD more comprehensive and accurate for everyone! 🚀

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/kiron0/zipbd/blob/main/LICENSE) file for details.

## 👨‍💻 Author

**Toufiq Hasan Kiron**
- Website: [kiron.dev](https://kiron.dev)
- GitHub: [@kiron0](https://github.com/kiron0)
- Email: hello@kiron.dev

## 🙏 Acknowledgments

- Original data source and concept
- All contributors and users
- The Bangladesh postal service for the data

---

⭐ **Star this repository if it helped you!**

Happy coding! 🚀
