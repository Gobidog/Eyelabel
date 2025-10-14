# Label Creation Tool - Technical Design Document

## 1. Executive Summary

### 1.1 Purpose
Development of an AI-assisted web-based label creation system for EYE LIGHTING AUSTRALIA to streamline the product label generation process from data entry to supplier delivery.

### 1.2 Key Objectives
- Automate label generation from spreadsheet data
- Integrate AI for intelligent field population and validation
- Maintain compliance with GS1 barcode standards
- Support multiple label templates (Standard, CCT Selectable, Power Selectable, Emergency)
- Enable collaborative workflow between engineers and management

### 1.3 Success Metrics
- Reduce label creation time by 70%
- Zero errors in barcode generation
- 100% template accuracy matching product type
- Complete audit trail for compliance

## 2. System Architecture

### 2.1 High-Level Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │Dashboard │  │  Editor  │  │ Preview  │  │  AI UI │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
└─────────────────────────────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │   API Gateway   │
                    │   (Express.js)  │
                    └───────┬────────┘
                            │
     ┌──────────────────────┼──────────────────────┐
     │                      │                      │
┌────▼─────┐        ┌───────▼────────┐    ┌───────▼─────┐
│ Core API │        │   AI Service   │    │Storage API  │
│(Node.js) │        │(Python/FastAPI)│    │ (Node.js)   │
└────┬─────┘        └───────┬────────┘    └───────┬─────┘
     │                      │                      │
┌────▼─────┐        ┌───────▼────────┐    ┌───────▼─────┐
│PostgreSQL│        │  OpenAI/Claude │    │   AWS S3    │
└──────────┘        └────────────────┘    └─────────────┘
```

### 2.2 Technology Stack

#### Frontend
- **Framework**: React 18.x with TypeScript
- **State Management**: Redux Toolkit
- **UI Components**: Material-UI v5
- **Canvas Rendering**: Fabric.js or Konva.js
- **PDF Generation**: jsPDF with html2canvas
- **Data Grid**: AG-Grid for spreadsheet view
- **Build Tool**: Vite

#### Backend
- **API Server**: Node.js with Express.js
- **AI Service**: Python FastAPI
- **Database**: PostgreSQL 14+
- **Cache**: Redis
- **File Storage**: AWS S3 or Azure Blob Storage
- **Queue**: Bull/Redis for async jobs

#### AI/ML
- **LLM Integration**: OpenAI GPT-4 or Claude API
- **OCR**: Tesseract.js for document parsing
- **Barcode**: node-barcode for GS1 generation

## 3. Database Schema

### 3.1 Core Tables

```sql
-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gs1_barcode_number VARCHAR(20) UNIQUE NOT NULL,
    product_code VARCHAR(20) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Label templates table
CREATE TABLE label_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type ENUM('standard', 'cct_selectable', 'power_selectable', 'emergency'),
    template_data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Labels table
CREATE TABLE labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    template_id UUID REFERENCES label_templates(id),
    label_type ENUM('product', 'carton'),
    status ENUM('draft', 'in_design', 'review', 'approved', 'sent'),
    label_data JSONB NOT NULL,
    pdf_url TEXT,
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Label specifications table
CREATE TABLE label_specifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label_id UUID REFERENCES labels(id),
    power_input VARCHAR(100),
    temperature_rating VARCHAR(50),
    ip_rating VARCHAR(10),
    cct_options VARCHAR(100),
    power_options VARCHAR(100),
    optic_type VARCHAR(50),
    additional_specs JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    role ENUM('engineer', 'designer', 'approver', 'admin'),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Audit log table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES users(id),
    changes JSONB,
    timestamp TIMESTAMP DEFAULT NOW()
);
```

## 4. API Specification

### 4.1 Core Endpoints

#### Products API
```typescript
// Product endpoints
POST   /api/products                 // Create new product
GET    /api/products                 // List all products
GET    /api/products/:id            // Get product details
PUT    /api/products/:id            // Update product
DELETE /api/products/:id            // Delete product

// Bulk operations
POST   /api/products/import         // Import from CSV/Excel
POST   /api/products/bulk-create    // Create multiple products
```

#### Labels API
```typescript
// Label management
POST   /api/labels                   // Create new label
GET    /api/labels                   // List labels with filters
GET    /api/labels/:id              // Get label details
PUT    /api/labels/:id              // Update label
DELETE /api/labels/:id              // Delete label
POST   /api/labels/:id/approve      // Approve label
POST   /api/labels/:id/reject       // Reject with comments

// Label generation
POST   /api/labels/generate         // Generate label from data
POST   /api/labels/:id/export       // Export as PDF
POST   /api/labels/batch-export     // Export multiple labels
```

#### AI Service API
```typescript
// AI assistance endpoints
POST   /api/ai/analyze-product      // Analyze product data
POST   /api/ai/suggest-template     // Suggest template type
POST   /api/ai/extract-specs        // Extract specs from text
POST   /api/ai/validate-label       // Validate label compliance
POST   /api/ai/generate-barcode     // Generate GS1 barcode
```

### 4.2 Request/Response Examples

#### Create Label Request
```json
{
  "productId": "uuid",
  "templateType": "cct_selectable",
  "specifications": {
    "productName": "Poseidon MKII",
    "productCode": "183650",
    "powerInput": "120-240Vac ~ 50/60 Hz",
    "temperatureRating": "ta= 50°C",
    "opticType": "A40M OPTIC",
    "cctOptions": ["3000K", "4000K", "5000K"],
    "powerOptions": ["75W", "112W", "150W"],
    "ipRating": "IP66",
    "classRating": "Class I"
  }
}
```

## 5. Frontend Components

### 5.1 Component Architecture

```typescript
// Core component structure
src/
├── components/
│   ├── Dashboard/
│   │   ├── Pipeline.tsx
│   │   ├── StageCard.tsx
│   │   └── LabelCard.tsx
│   ├── Editor/
│   │   ├── Canvas.tsx
│   │   ├── Toolbar.tsx
│   │   ├── PropertyPanel.tsx
│   │   └── TemplateSelector.tsx
│   ├── AI/
│   │   ├── Assistant.tsx
│   │   ├── Suggestions.tsx
│   │   └── ValidationPanel.tsx
│   └── Common/
│       ├── DataGrid.tsx
│       ├── FileUploader.tsx
│       └── PDFViewer.tsx
├── hooks/
│   ├── useAI.ts
│   ├── useLabel.ts
│   └── useCanvas.ts
├── services/
│   ├── api.ts
│   ├── ai.service.ts
│   └── pdf.service.ts
└── store/
    ├── labelSlice.ts
    ├── productSlice.ts
    └── uiSlice.ts
```

### 5.2 Key Component Specifications

#### Canvas Editor Component
```typescript
interface CanvasEditorProps {
  labelData: LabelData;
  template: Template;
  onUpdate: (data: LabelData) => void;
  aiSuggestions: AISuggestion[];
}

// Features to implement:
// - Drag and drop field placement
// - Real-time preview
// - Grid snapping
// - Undo/redo functionality
// - Export to various formats
```

## 6. AI Integration - Comprehensive Feature Set

### 6.1 AI Service Architecture

```python
# AI Service Structure
from fastapi import FastAPI
from pydantic import BaseModel
import openai
from typing import List, Dict, Optional

app = FastAPI()

class ProductAnalyzer:
    """Intelligent product data analysis and specification extraction"""
    
    def detect_product_type(self, product_name: str, description: str) -> str:
        """
        Analyzes product description to determine type:
        - Standard: Single power/color configuration
        - CCT Selectable: Multiple color temperature options (3000K/4000K/5000K)
        - Power Selectable: Multiple wattage options (75W/112W/150W)
        - Emergency: Contains emergency battery/test features
        """
        pass
    
    def extract_specifications(self, raw_text: str) -> dict:
        """
        Intelligently extracts from messy spreadsheet data:
        Example input: "1800W LED Fixture Only DC Input: 5.8A, 297Vdc ta= 50°C 4000K"
        Returns:
        {
            "power": "1800W",
            "input_type": "DC",
            "current": "5.8A",
            "voltage": "297Vdc",
            "temperature_rating": "50°C",
            "color_temperature": "4000K",
            "fixture_type": "LED Fixture Only"
        }
        """
        pass
    
    def validate_compliance(self, specs: dict) -> dict:
        """
        Real-time validation with specific feedback:
        {
            "errors": ["Temperature format should be 'ta= 50°C'"],
            "warnings": ["Emergency products typically include test button notation"],
            "suggestions": ["Consider adding IP66 rating for outdoor fixtures"]
        }
        """
        pass

class DesignGenerator:
    """AI-powered design variation generator"""
    
    def generate_design_variations(
        self, 
        product_data: dict, 
        num_variations: int = 6
    ) -> List[Dict]:
        """
        Creates multiple label design options:
        - Traditional layout (vertical stack)
        - Modern grid (side-by-side boxes)
        - Minimalist (emphasis on whitespace)
        - Technical (table format)
        - Icon-enhanced (visual indicators)
        - Compact industrial (maximum density)
        """
        pass
    
    def adapt_to_content(self, specs: dict) -> dict:
        """
        Context-aware design decisions:
        - Emergency products: Red accents, warning sections
        - Premium products: Sophisticated typography, spacing
        - Industrial: Bold type, technical tables
        """
        pass
    
    def apply_brand_learning(self, design: dict, history: list) -> dict:
        """
        Learns from user choices:
        - Preferred layouts
        - Typography choices
        - Spacing preferences
        - Color usage patterns
        """
        pass

class IntelligentAssistant:
    """Real-time AI assistance during label creation"""
    
    def provide_contextual_suggestions(self, current_state: dict) -> List[str]:
        """
        Live suggestions based on current work:
        - "This product series typically uses A40M optic notation"
        - "Emergency variants require battery duration specification"
        - "CCT selectable products need all temperature options visible"
        """
        pass
    
    def auto_complete_fields(self, partial_data: dict) -> dict:
        """
        Predictive field completion:
        - Detects patterns (Poseidon = usually IP66)
        - Suggests common values
        - Maintains consistency across product lines
        """
        pass
    
    def chat_assistance(self, query: str, context: dict) -> str:
        """
        Natural language help:
        User: "How should I show dual voltage?"
        AI: "Use '120-240Vac ~ 50/60 Hz' format for dual voltage products"
        """
        pass
```

### 6.2 AI Feature Implementation Details

#### 6.2.1 Spreadsheet Import Intelligence

```python
class SmartImporter:
    """Handles messy real-world spreadsheet data"""
    
    def auto_map_columns(self, headers: list) -> dict:
        """
        Automatically recognizes column variations:
        - "GS1 Barcode Number" → barcodeNumber
        - "Description" or "Desc" or "Product Description" → description
        - Handles spelling mistakes and variations
        """
        pass
    
    def parse_mixed_content(self, cell_value: str) -> dict:
        """
        Extracts structured data from unstructured cells:
        Input: "600W/750W LED Remote Gearbox 220-420Vac ~ 50 Hz ta= 40°C"
        Output: {
            "power_options": ["600W", "750W"],
            "component": "Remote Gearbox",
            "voltage": "220-420Vac",
            "frequency": "50 Hz",
            "temperature": "40°C"
        }
        """
        pass
    
    def detect_product_families(self, products: list) -> dict:
        """
        Groups related products for consistent labeling:
        - Identifies Poseidon MKII series
        - Recognizes Hades variants
        - Suggests family-wide design consistency
        """
        pass
```

#### 6.2.2 Real-Time Design Assistant

```python
class DesignAssistant:
    """Interactive design guidance"""
    
    def suggest_layout_improvements(self, current_layout: dict) -> list:
        """
        Live layout optimization:
        - "Power ratings would be more readable in a horizontal arrangement"
        - "Consider increasing font size for safety warnings"
        - "Barcode placement may interfere with fold line"
        """
        pass
    
    def generate_alternatives(self, base_design: dict, instruction: str) -> list:
        """
        Natural language design modifications:
        User: "Make it look more premium"
        AI: Generates 3 variations with:
            - Increased whitespace
            - Refined typography
            - Subtle border treatments
        """
        pass
    
    def ensure_compliance(self, design: dict) -> dict:
        """
        Automatic compliance checking:
        - Minimum font sizes (6pt for legal text)
        - Required safety symbols present
        - GS1 barcode standards met
        - Correct notation formats (ta= not t=)
        """
        pass
```

### 6.3 Complete AI Workflow Integration

#### Step-by-Step AI Assistance

```typescript
interface AIWorkflow {
    // STAGE 1: Data Import
    importAssistance: {
        columnMapping: AutoMapping,           // Recognizes headers automatically
        dataExtraction: FieldExtraction,      // Pulls specs from messy cells
        validation: ImportValidation,         // Checks for missing data
        suggestions: ImportSuggestions        // "5 products missing temperature ratings"
    },
    
    // STAGE 2: Product Analysis
    productAnalysis: {
        typeDetection: ProductType,           // Standard/CCT/Power/Emergency
        specificationExtraction: Specs,       // All technical details
        familyGrouping: ProductFamily,        // Related products identified
        complianceCheck: ComplianceStatus     // Missing required fields
    },
    
    // STAGE 3: Design Generation
    designCreation: {
        templateSelection: Template,          // Auto-selects best template
        layoutVariations: DesignOption[],     // 6 different designs
        fieldPopulation: AutoFillData,        // Pre-fills all fields
        confidenceIndicators: Confidence      // Green/Yellow/Red highlights
    },
    
    // STAGE 4: Interactive Editing
    editingAssistance: {
        realTimeSuggestions: Suggestion[],    // Context-aware tips
        complianceWarnings: Warning[],        // Format/requirement issues
        smartCorrections: AutoCorrection,     // Fixes common mistakes
        chatSupport: ChatResponse            // Natural language Q&A
    },
    
    // STAGE 5: Quality Assurance
    qualityCheck: {
        completenessValidation: CheckResult,  // All required fields present
        formatValidation: FormatCheck,        // Proper notation (ta=, IP66)
        logicValidation: LogicCheck,          // Power ratings in order
        printReadiness: PrintCheck            // Resolution, margins, bleeds
    }
}
```

### 6.4 AI Prompts Library - Comprehensive Set

```python
PROMPTS = {
    # Data Extraction Prompts
    "extract_specs": """
    Extract ALL technical specifications from this product description:
    {description}
    
    Identify and return:
    - Product name and model
    - Power specifications (wattage, voltage, current)
    - Temperature ratings (ambient ta=)
    - IP ratings
    - CCT options if multiple (e.g., 3000K, 4000K, 5000K)
    - Power options if selectable (e.g., 75W, 112W, 150W)
    - Special features (emergency, dimming, sensors)
    - Optic types (A40M, A60W, etc.)
    - Class ratings (Class I, Class II)
    
    Handle messy formatting and extract clean values.
    """,
    
    # Design Generation Prompts
    "generate_label_designs": """
    Create 6 distinct label design variations for:
    Product: {product_name}
    Specifications: {specs}
    Type: {product_type}
    
    Generate designs with these styles:
    1. Classic - Traditional vertical layout
    2. Modern - Clean with geometric elements
    3. Technical - Specification table format
    4. Minimal - Maximum whitespace, essential info only
    5. Premium - Sophisticated typography and spacing
    6. Compact - Space-efficient for small labels
    
    Each design must include ALL required elements:
    - Product name and code
    - Technical specifications
    - Compliance markings
    - Barcode placement
    - Manufacturer details
    """,
    
    # Validation Prompts
    "validate_label": """
    Perform comprehensive validation of this label:
    {label_data}
    
    Check for:
    1. REQUIRED FIELDS
       - Product identification
       - Power specifications
       - Safety markings
       - Temperature ratings
       - IP ratings
       - Compliance text
    
    2. FORMAT STANDARDS
       - Temperature: must be "ta= XXX°C" format
       - Voltage: "XXX-XXXVac ~ 50/60 Hz" format
       - IP ratings: IP65, IP66, or IP67 only
    
    3. LOGICAL CONSISTENCY
       - Power options in ascending order
       - CCT options in ascending order
       - Matching specs between product and carton labels
    
    4. GS1 COMPLIANCE
       - Valid barcode format
       - Correct check digits
       - Proper placement and size
    
    Return specific issues with severity levels.
    """,
    
    # Assistance Prompts
    "provide_suggestions": """
    Based on the current label state:
    {current_state}
    
    Provide contextual suggestions:
    - Missing typical specifications for this product type
    - Format improvements
    - Compliance recommendations
    - Design optimization tips
    
    Reference similar products: {product_history}
    """,
    
    # Natural Language Understanding
    "interpret_design_request": """
    User request: "{user_input}"
    Current design: {current_design}
    
    Interpret and execute:
    - Design preference (modern, classic, minimal)
    - Layout changes (spacing, alignment, hierarchy)
    - Emphasis adjustments (make X more prominent)
    - Style modifications (premium, industrial, clean)
    
    Return specific design parameter changes.
    """
}
```

## 7. Workflow Implementation

### 7.1 State Machine

```typescript
enum LabelStatus {
  DRAFT = 'draft',
  DATA_ENTRY = 'data_entry',
  IN_DESIGN = 'in_design',
  ENGINEER_REVIEW = 'engineer_review',
  APPROVAL_PENDING = 'approval_pending',
  APPROVED = 'approved',
  SENT_TO_SUPPLIER = 'sent_to_supplier'
}

const labelWorkflow = {
  [LabelStatus.DRAFT]: [LabelStatus.DATA_ENTRY],
  [LabelStatus.DATA_ENTRY]: [LabelStatus.IN_DESIGN],
  [LabelStatus.IN_DESIGN]: [LabelStatus.ENGINEER_REVIEW],
  [LabelStatus.ENGINEER_REVIEW]: [LabelStatus.APPROVAL_PENDING, LabelStatus.IN_DESIGN],
  [LabelStatus.APPROVAL_PENDING]: [LabelStatus.APPROVED, LabelStatus.IN_DESIGN],
  [LabelStatus.APPROVED]: [LabelStatus.SENT_TO_SUPPLIER]
};
```

### 7.2 Notification System

```javascript
// Webhook notifications for status changes
const notificationTriggers = {
  'engineer_review': ['engineer@company.com'],
  'approval_pending': ['russell@company.com'],
  'approved': ['wei@company.com', 'supplier@vendor.com']
};
```

## 8. File Processing

### 8.1 CSV/Excel Import

```typescript
interface ImportService {
  parseExcel(file: File): Promise<ProductData[]>;
  parseCSV(file: File): Promise<ProductData[]>;
  validateData(data: ProductData[]): ValidationResult;
  mapFields(data: any[], mapping: FieldMapping): ProductData[];
}

// Column mapping configuration
const defaultMapping = {
  'GS1 Barcode Number': 'barcodeNumber',
  'Description': 'description',
  'Product Code': 'productCode',
  'Date Assigned': 'dateAssigned',
  'Carton Label': 'cartonLabelSpecs',
  'Fixture / Product label info': 'productLabelSpecs'
};
```

### 8.2 PDF Generation

```typescript
interface PDFGenerator {
  generateLabel(labelData: LabelData, template: Template): Promise<Blob>;
  generateBatch(labels: LabelData[]): Promise<Blob>;
  addBarcode(pdf: jsPDF, barcode: string, position: Position): void;
  exportForPrint(pdf: jsPDF): Blob;
}
```

## 9. Security & Authentication

### 9.1 Authentication Flow
```typescript
// JWT-based authentication
interface AuthService {
  login(email: string, password: string): Promise<AuthToken>;
  refresh(refreshToken: string): Promise<AuthToken>;
  logout(): void;
  validateToken(token: string): UserClaims;
}

// Role-based access control
const permissions = {
  engineer: ['create', 'edit', 'submit_for_review'],
  designer: ['create', 'edit', 'design'],
  approver: ['approve', 'reject', 'comment'],
  admin: ['*']
};
```

### 9.2 Data Security
- All API endpoints require authentication
- Sensitive data encrypted at rest
- HTTPS only for all communications
- Input validation and sanitization
- Rate limiting on API endpoints
- Audit logging for all changes

## 10. Integration Requirements

### 10.1 SharePoint Integration
```typescript
interface SharePointService {
  uploadFile(file: Blob, path: string): Promise<string>;
  createFolder(folderName: string): Promise<void>;
  listFiles(path: string): Promise<FileInfo[]>;
  syncLabel(labelId: string): Promise<void>;
}
```

### 10.2 GS1 Barcode Integration
```typescript
interface BarcodeService {
  generate(gs1Number: string): Promise<string>;
  validate(barcode: string): boolean;
  encode(data: BarcodeData): string;
  renderSVG(barcode: string): string;
  renderPNG(barcode: string): Buffer;
}
```

## 11. Performance Requirements

### 11.1 Response Times
- API response: < 200ms (p95)
- PDF generation: < 3 seconds
- CSV import (1000 rows): < 5 seconds
- AI suggestions: < 2 seconds
- Page load: < 1 second

### 11.2 Scalability
- Support 100 concurrent users
- Process 10,000 labels per month
- Store 100,000 historical labels
- Handle files up to 50MB

## 12. Testing Strategy

### 12.1 Test Coverage Requirements
- Unit tests: 80% coverage minimum
- Integration tests for all API endpoints
- E2E tests for critical workflows
- AI accuracy tests with test dataset

### 12.2 Test Scenarios
```typescript
// Critical test cases
describe('Label Creation Workflow', () => {
  test('Create label from CSV import');
  test('AI template selection accuracy');
  test('Barcode generation validation');
  test('PDF export quality');
  test('Approval workflow');
  test('SharePoint sync');
});
```

## 13. Deployment

### 13.1 Environment Configuration
```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
  
  api:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL
      - REDIS_URL
      - AI_API_KEY
      - S3_BUCKET
  
  ai-service:
    build: ./ai-service
    ports:
      - "5000:5000"
  
  postgres:
    image: postgres:14
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:alpine
```

### 13.2 CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm test
      - run: npm run build
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          docker build -t label-tool .
          docker push registry/label-tool:latest
          kubectl apply -f k8s/
```

## 14. Monitoring & Logging

### 14.1 Metrics to Track
- Label creation rate
- Error rates by stage
- AI suggestion accuracy
- User session duration
- PDF generation success rate
- API response times

### 14.2 Logging Strategy
```typescript
// Structured logging
const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log all label status changes
logger.info('Label status changed', {
  labelId: label.id,
  previousStatus: oldStatus,
  newStatus: newStatus,
  userId: user.id,
  timestamp: new Date()
});
```

## 15. Phase-wise Development Plan

### Phase 1: MVP (Weeks 1-4)
- Basic CRUD operations
- Single template support
- Manual data entry
- PDF export

### Phase 2: AI Integration (Weeks 5-8)
- AI field suggestions
- Template auto-selection
- Bulk import from CSV
- Validation rules

### Phase 3: Advanced Features (Weeks 9-12)
- All template types
- SharePoint integration
- Approval workflow
- Audit logging

### Phase 4: Polish & Optimization (Weeks 13-14)
- Performance optimization
- UI/UX refinements
- Comprehensive testing
- Documentation

## 16. Success Criteria

### 16.1 Acceptance Criteria
- [ ] Successfully import and process Excel/CSV files
- [ ] Generate accurate barcodes for all products
- [ ] Support all 4 label template types
- [ ] AI correctly identifies template type 95% of the time
- [ ] Export print-ready PDFs
- [ ] Complete audit trail for compliance
- [ ] Zero data loss during the process
- [ ] Support concurrent users

### 16.2 Performance Benchmarks
- Label creation time: < 2 minutes (vs 10 minutes manual)
- Error rate: < 1%
- User satisfaction: > 90%
- System uptime: 99.9%
