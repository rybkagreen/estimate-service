# BIM & CAD Integration Service

## Overview

The BIM & CAD Integration Service provides comprehensive functionality for processing Building Information Modeling (BIM) and Computer-Aided Design (CAD) files, extracting structural data, performing OCR on documents, and generating quantity takeoffs for construction estimation.

## Features

### 1. BIM File Processing
- **IFC Parser**: Parse Industry Foundation Classes (IFC) files using web-ifc
- **RVT Parser**: Parse Autodesk Revit files (placeholder for Forge API integration)
- **Element Extraction**: Extract building elements (walls, floors, columns, etc.)
- **Geometry Calculation**: Calculate volumes, areas, and dimensions
- **Quantity Takeoff**: Automatic quantity extraction from BIM models

### 2. CAD File Processing
- **DWG Parser**: Parse AutoCAD DWG files using ezdxf
- **PDF CAD Parser**: Extract CAD drawings from PDF files
- **Drawing Recognition**: AI-powered recognition of drawing elements
- **Dimension Extraction**: Extract measurements and dimensions
- **Layer Management**: Organize elements by layers

### 3. OCR & Text Extraction
- **Multi-language OCR**: Support for Russian and English text extraction
- **PDF Text Extraction**: Extract text from construction documents
- **NLP Processing**: Natural language processing for structured data extraction
- **Specification Parsing**: Extract equipment specifications and materials

### 4. Volume Extraction & Quantity Takeoff
- **Automatic Volume Calculation**: Calculate volumes from BIM/CAD elements
- **Material Quantification**: Group quantities by material type
- **ФСБЦ Mapping**: Map extracted quantities to Russian construction cost database codes
- **Export Reports**: Generate detailed quantity takeoff reports

### 5. Equipment Specification Parser
- **Specification Extraction**: Parse equipment specifications from documents
- **Catalog Matching**: Match equipment to standard catalogs
- **Technical Parameter Extraction**: Extract power, dimensions, capacity, etc.

## API Endpoints

### BIM Endpoints
- `POST /bim/parse/ifc` - Parse IFC file
- `POST /bim/parse/rvt` - Parse Revit file
- `GET /bim/elements/:projectId` - Get BIM elements for a project
- `POST /bim/extract-quantities/:projectId` - Extract quantities from BIM model

### CAD Endpoints
- `POST /cad/parse/dwg` - Parse DWG file
- `POST /cad/parse/pdf` - Parse PDF with CAD drawings
- `GET /cad/elements/:drawingId` - Get CAD elements
- `POST /cad/recognize-drawing/:drawingId` - Apply AI recognition
- `POST /cad/extract-dimensions/:drawingId` - Extract dimensions

### OCR Endpoints
- `POST /ocr/extract-text` - Extract text from image/PDF
- `POST /ocr/extract-specifications` - Extract equipment specifications

### Volume Extraction Endpoints
- `POST /volume-extraction/extract/:projectId` - Extract volumes
- `GET /volume-extraction/quantity-takeoff/:projectId` - Get quantity takeoff
- `POST /volume-extraction/map-to-fsbc/:projectId` - Map to ФСБЦ codes

### Equipment Parser Endpoints
- `POST /equipment/parse` - Parse equipment specifications
- `GET /equipment/catalog/:equipmentId` - Get equipment from catalog

## Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

## Configuration

Create a `.env` file with the following variables:

```env
# Service Configuration
PORT=3025
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/bim_cad_db"

# File Storage
UPLOAD_PATH="./uploads"

# OCR Configuration
TESSERACT_LANG="rus+eng"

# API Keys (if needed)
AUTODESK_FORGE_CLIENT_ID="your_forge_client_id"
AUTODESK_FORGE_CLIENT_SECRET="your_forge_client_secret"
```

## Usage Examples

### 1. Parse IFC File

```bash
curl -X POST http://localhost:3025/bim/parse/ifc \
  -F "file=@building.ifc" \
  -H "Content-Type: multipart/form-data"
```

### 2. Extract Text from PDF

```bash
curl -X POST http://localhost:3025/ocr/extract-text \
  -F "file=@specification.pdf" \
  -F "processNlp=true" \
  -H "Content-Type: multipart/form-data"
```

### 3. Get Quantity Takeoff

```bash
curl http://localhost:3025/volume-extraction/quantity-takeoff/{projectId}
```

## Development

### Running the Service

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

### Testing

```bash
# Unit tests
npm run test

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## Architecture

The service follows a modular architecture with the following main modules:

1. **BIM Module**: Handles IFC and RVT file processing
2. **CAD Module**: Processes DWG files and CAD drawings in PDFs
3. **OCR Module**: Text extraction and NLP processing
4. **Volume Extraction Module**: Quantity takeoff calculations
5. **Equipment Parser Module**: Equipment specification extraction
6. **Storage Module**: File management
7. **Prisma Module**: Database operations

## Database Schema

The service uses PostgreSQL with Prisma ORM. Main entities include:

- `BimProject`: BIM project metadata
- `BimElement`: Individual BIM elements
- `CadDrawing`: CAD drawing metadata
- `CadElement`: Individual CAD elements
- `ExtractedDocument`: OCR processed documents
- `QuantityTakeoff`: Calculated quantities
- `Equipment`: Parsed equipment specifications

## Future Enhancements

1. **Autodesk Forge Integration**: Full Revit file support
2. **pyRevit Integration**: Alternative Revit processing via Python
3. **AI Model Training**: Improve drawing recognition accuracy
4. **3D Visualization**: WebGL-based 3D model viewer
5. **Real-time Collaboration**: WebSocket support for multi-user editing
6. **Advanced NLP**: Better specification parsing with domain-specific models
7. **Cloud Storage**: S3/Azure Blob storage integration
8. **Performance Optimization**: Implement caching and parallel processing

## Contributing

Please follow the project's coding standards and submit pull requests for any enhancements.

## License

This service is part of the Estimate Service platform and follows the same licensing terms.
