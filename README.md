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
git clone https://github.com/kiron0/zipbd.git
cd zipbd
npm install
```

### Development

```bash
bun run dev
```

### Production

```bash
bun run build
bun start
```

## 📚 API Endpoints

### Base URL
```
https://zipbd.vercel.app/api/v1
```

### 1. Get All Postal Data
```http
GET /api/v1/all
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "data": [
    {
      "district": "Dhaka",
      "cities": [
        {
          "city": "Dhaka City",
          "subCities": [
            {
              "sub": "Gulshan-1",
              "postalCode": "1212"
            }
          ]
        }
      ]
    }
  ],
  "message": "All postal data retrieved successfully"
}
```

### 2. Search by District
```http
GET /api/v1/district/:district
```

**Example:**
```http
GET /api/v1/district/dhaka
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "district": "Dhaka",
    "cities": [
      {
        "city": "Dhaka City",
        "subCities": [
          {
            "sub": "Gulshan-1",
            "postalCode": "1212"
          }
        ]
      }
    ]
  },
  "message": "Found 2 cities in Dhaka"
}
```

### 3. Search by City
```http
GET /api/v1/city/:city
```

**Example:**
```http
GET /api/v1/city/gulshan
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "data": [
    {
      "city": "Dhaka City",
      "subCities": [
        {
          "sub": "Gulshan-1",
          "postalCode": "1212"
        }
      ]
    }
  ],
  "message": "Found 1 cities with matching criteria"
}
```

### 4. Search by Sub-area
```http
GET /api/v1/sub/:sub
```

**Example:**
```http
GET /api/v1/sub/gulshan
```

### 5. Search by Postal Code
```http
GET /api/v1/code/:code
```

**Example:**
```http
GET /api/v1/code/1212
```

### 6. Multi-parameter Search
```http
GET /api/v1/search?district=dhaka&city=gulshan&sub=gulshan-1&code=1212
```

**Search Examples:**
- `?district=dhaka` - District only (partial match)
- `?district=dhaka&city=gulshan` - District + City (partial city match)
- `?district=dhaka&city=gulshan&sub=gulshan-1` - District + City + Sub (partial sub match)
- `?district=dhaka&city=gulshan&code=1212` - District + City + Code (exact code match)
- `?district=dhaka&city=gulshan&sub=gulshan-1&code=1212` - All parameters (exact match)

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "data": [
    {
      "city": "Gulshan",
      "sub": "Gulshan-1",
      "postalCode": "1212"
    }
  ],
  "message": "Found 1 entry(ies) for the specified location"
}
```

## 🔍 Search Logic

### Parameter Validation
- Only accepts valid parameters: `district`, `city`, `sub`, `code`
- Rejects invalid parameters with clear error messages

### Search Types
1. **District Only**: Partial matching for district names
2. **District + City**: Partial matching for cities within district
3. **District + City + Sub**: Exact city + partial sub matching
4. **District + City + Code**: Exact matching for all parameters
5. **All Parameters**: Exact matching for district, city, sub, and code

### Response Format
All responses follow a consistent structure:
```json
{
  "statusCode": 200,
  "success": true,
  "data": [...],
  "message": "Descriptive message"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

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
