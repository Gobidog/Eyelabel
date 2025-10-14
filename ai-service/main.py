#!/usr/bin/env python3
"""
AI Service - Label Creation Tool
AI-powered features using OpenAI GPT-4
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
from contextlib import asynccontextmanager
import uvicorn
import os
import json
from openai import AsyncOpenAI

# OpenAI configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_AVAILABLE = bool(OPENAI_API_KEY)

# ML models storage
ml_models = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage OpenAI client lifecycle"""
    # Startup: Initialize OpenAI client
    print(f"🚀 AI Service starting up...")
    if OPENAI_AVAILABLE:
        try:
            key_preview = f"{OPENAI_API_KEY[:7]}...{OPENAI_API_KEY[-4:]}" if OPENAI_API_KEY and len(OPENAI_API_KEY) > 11 else "None"
            print(f"🚀 Initializing with OPENAI_API_KEY: {key_preview}")
            ml_models["openai_client"] = AsyncOpenAI(api_key=OPENAI_API_KEY)
            print("✓ OpenAI client initialized")
        except Exception as e:
            print(f"Warning: Failed to initialize OpenAI client: {e}")
    else:
        print(f"⚠️ OPENAI_AVAILABLE is False - no client initialized")
    yield
    # Shutdown: Clean up resources
    ml_models.clear()

app = FastAPI(
    title="Label AI Service",
    description="AI-powered label creation assistance with OpenAI GPT-4",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SpecExtractionRequest(BaseModel):
    """Request model for specification extraction"""
    text: str
    product_type: Optional[str] = None


class SpecExtractionResponse(BaseModel):
    """Response model for specification extraction"""
    specifications: dict
    confidence: float


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "label-ai-service",
        "version": "1.0.0",
        "openai_configured": OPENAI_AVAILABLE
    }


@app.post("/api/extract-specs", response_model=SpecExtractionResponse)
async def extract_specifications(request: SpecExtractionRequest):
    """
    Extract product specifications from text using OpenAI GPT-4
    """
    if not OPENAI_AVAILABLE or "openai_client" not in ml_models:
        raise HTTPException(
            status_code=503,
            detail="OpenAI service is not configured"
        )

    client = ml_models["openai_client"]

    try:
        # Create system prompt for specification extraction
        system_prompt = """You are an AI assistant specialized in extracting technical specifications from product descriptions for lighting products.

Extract the following specifications if present:
- powerInput: Power input voltage and type (e.g., "240V AC 50Hz", "12V DC")
- temperatureRating: Operating temperature range (e.g., "-20°C to +40°C")
- ipRating: IP rating (e.g., "IP65", "IP44")
- classRating: Electrical class rating (e.g., "Class I", "Class II")
- cctOptions: Color temperature options if selectable (e.g., "3000K / 4000K / 5700K")
- powerOptions: Power wattage options if selectable (e.g., "40W / 50W / 60W")
- additionalSpecs: Any other relevant specifications as key-value pairs

Return a JSON object with the extracted specifications. Only include fields where you found explicit information.
If a specification is not mentioned, don't include it in the response."""

        user_prompt = f"""Product Type: {request.product_type or 'Not specified'}

Text to analyze:
{request.text}

Extract all technical specifications from this text."""

        # Call OpenAI API
        response = await client.chat.completions.create(
            model="gpt-5-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"}
        )

        # Parse the response
        extracted_data = json.loads(response.choices[0].message.content)

        # Calculate confidence based on number of extracted fields
        num_fields = len(extracted_data)
        confidence = min(0.95, 0.5 + (num_fields * 0.1))

        return {
            "specifications": extracted_data,
            "confidence": confidence
        }

    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse AI response: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI extraction failed: {str(e)}"
        )


class TemplateSuggestionRequest(BaseModel):
    """Request model for template suggestion"""
    product_type: str
    product_name: Optional[str] = None
    description: Optional[str] = None


@app.post("/api/suggest-template")
async def suggest_template(request: TemplateSuggestionRequest):
    """
    Suggest appropriate template for product type using OpenAI
    """
    print(f"🤖 /api/suggest-template called for product: {request.product_type}")
    print(f"🤖 Global state: OPENAI_AVAILABLE={OPENAI_AVAILABLE}, has_client={('openai_client' in ml_models)}")

    if OPENAI_API_KEY:
        key_preview = f"{OPENAI_API_KEY[:7]}...{OPENAI_API_KEY[-4:]}" if len(OPENAI_API_KEY) > 11 else "****"
        print(f"🤖 Current global OPENAI_API_KEY: {key_preview}")

    if not OPENAI_AVAILABLE or "openai_client" not in ml_models:
        print(f"🤖 Using fallback (OpenAI not configured)")
        # Fallback to simple rule-based suggestion
        product_lower = request.product_type.lower()
        if 'emergency' in product_lower or 'exit' in product_lower:
            template_type = 'emergency'
        elif 'cct' in product_lower or 'selectable' in product_lower:
            template_type = 'cct_selectable'
        elif 'power' in product_lower and 'selectable' in product_lower:
            template_type = 'power_selectable'
        else:
            template_type = 'standard'

        return {
            "template_type": template_type,
            "confidence": 0.7,
            "reason": "Rule-based suggestion (OpenAI not configured)"
        }

    client = ml_models["openai_client"]
    print(f"🤖 Retrieved client from ml_models, making OpenAI API call...")

    try:
        # Create prompt for template suggestion
        system_prompt = """You are an AI assistant that suggests the most appropriate label template type for lighting products.

Available template types:
- standard: Basic product label with barcode and product info
- cct_selectable: For products with color temperature selection (3000K/4000K/5700K)
- power_selectable: For products with selectable power/wattage options
- emergency: For emergency lighting products with battery backup

Analyze the product information and suggest the most appropriate template type.
Return a JSON object with: template_type, confidence (0-1), and reason."""

        context = f"""Product Type: {request.product_type}"""
        if request.product_name:
            context += f"\nProduct Name: {request.product_name}"
        if request.description:
            context += f"\nDescription: {request.description}"

        # Call OpenAI API
        response = await client.chat.completions.create(
            model="gpt-5-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": context}
            ],
            response_format={"type": "json_object"}
        )

        # Parse the response
        suggestion = json.loads(response.choices[0].message.content)

        return suggestion

    except Exception as e:
        print(f"ERROR in suggest_template: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Template suggestion failed: {str(e)}"
        )


class DesignGenerationRequest(BaseModel):
    """Request model for design generation"""
    product_name: str
    product_code: str
    template_type: str
    specifications: dict
    canvas_width: Optional[int] = 800
    canvas_height: Optional[int] = 600
    num_variations: Optional[int] = 3


class DesignVariation(BaseModel):
    """A single design variation"""
    id: int
    layout_type: str
    description: str
    elements: List[dict]
    confidence: float


class DesignGenerationResponse(BaseModel):
    """Response model for design generation"""
    variations: List[DesignVariation]
    status: str


@app.post("/api/generate-design", response_model=DesignGenerationResponse)
async def generate_design(request: DesignGenerationRequest):
    """
    Generate label design variations using OpenAI GPT-4
    """
    if not OPENAI_AVAILABLE or "openai_client" not in ml_models:
        # Fallback to simple template-based design with basic elements
        canvas_width = request.canvas_width
        canvas_height = request.canvas_height

        return {
            "variations": [
                {
                    "id": 1,
                    "layout_type": "standard",
                    "description": "Standard left-aligned layout with product info and barcode",
                    "elements": [
                        {
                            "type": "text",
                            "x": 20,
                            "y": 20,
                            "width": canvas_width - 40,
                            "height": 40,
                            "fontSize": 24,
                            "text": request.product_name,
                            "fill": "#000000"
                        },
                        {
                            "type": "text",
                            "x": 20,
                            "y": 70,
                            "width": canvas_width - 40,
                            "height": 30,
                            "fontSize": 16,
                            "text": f"Code: {request.product_code}",
                            "fill": "#666666"
                        },
                        {
                            "type": "rectangle",
                            "x": 20,
                            "y": canvas_height - 120,
                            "width": 200,
                            "height": 80,
                            "fill": "#f0f0f0",
                            "stroke": "#000000",
                            "strokeWidth": 1
                        },
                        {
                            "type": "text",
                            "x": 230,
                            "y": canvas_height - 100,
                            "width": canvas_width - 250,
                            "height": 60,
                            "fontSize": 12,
                            "text": "Barcode placeholder - configure OpenAI for AI-generated designs",
                            "fill": "#999999"
                        }
                    ],
                    "confidence": 0.6
                }
            ],
            "status": "fallback"
        }

    client = ml_models["openai_client"]

    try:
        # Create prompt for design generation
        system_prompt = """You are an AI assistant specialized in generating label layout designs for lighting products.

Generate label layout variations that are:
- Professional and compliant with industry standards
- Clear and readable with proper hierarchy
- Suitable for printing at 300 DPI
- Following Australian electrical product labeling guidelines

For each variation, suggest specific element placements including:
- Product name and code positioning
- Barcode placement and size
- Specification text layout
- Safety symbols and compliance marks
- Company branding areas

Return a JSON object with an array of "variations", each containing:
- layout_type: "grid", "centered", "left_aligned", "modern", "compact"
- description: Brief description of the design approach
- elements: Array of element objects with type, x, y, width, height, fontSize, text content
- confidence: 0-1 confidence score

Element types: "text", "barcode", "rectangle", "line", "symbol"
Coordinates should be relative to canvas dimensions provided."""

        context = f"""Canvas dimensions: {request.canvas_width}x{request.canvas_height}px
Template type: {request.template_type}
Product: {request.product_name} ({request.product_code})

Specifications to include:
{json.dumps(request.specifications, indent=2)}

Generate {request.num_variations} design variations optimized for this product type."""

        # Call OpenAI API
        response = await client.chat.completions.create(
            model="gpt-5-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": context}
            ],
            response_format={"type": "json_object"}
        )

        # Parse the response
        design_data = json.loads(response.choices[0].message.content)

        # Ensure the response has the expected structure
        if "variations" not in design_data:
            raise ValueError("AI response missing 'variations' field")

        # Add IDs if not present
        for i, variation in enumerate(design_data["variations"]):
            if "id" not in variation:
                variation["id"] = i + 1
            if "confidence" not in variation:
                variation["confidence"] = 0.8

        return {
            "variations": design_data["variations"],
            "status": "success"
        }

    except json.JSONDecodeError as e:
        print(f"ERROR in generate_design (JSON): {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse AI response: {str(e)}"
        )
    except Exception as e:
        print(f"ERROR in generate_design: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Design generation failed: {str(e)}"
        )


class UpdateKeyRequest(BaseModel):
    """Request model for updating API key"""
    api_key: str


@app.post("/api/update-key")
async def update_api_key(request: UpdateKeyRequest):
    """
    Update OpenAI API key at runtime (without container restart)
    """
    global OPENAI_API_KEY, OPENAI_AVAILABLE

    try:
        key_preview = f"{request.api_key[:7]}...{request.api_key[-4:]}" if len(request.api_key) > 11 else "****"
        print(f"🔑 /api/update-key called with key: {key_preview}")

        # Create new client with provided API key
        new_client = AsyncOpenAI(api_key=request.api_key)
        print(f"🔑 Created new AsyncOpenAI client")

        # Test the connection quickly
        models = await new_client.models.list()
        print(f"🔑 Connection test succeeded, found {len(models.data)} models")

        # If successful, update global state
        old_key_preview = f"{OPENAI_API_KEY[:7]}...{OPENAI_API_KEY[-4:]}" if OPENAI_API_KEY and len(OPENAI_API_KEY) > 11 else "None"
        print(f"🔑 Updating global OPENAI_API_KEY from {old_key_preview} to {key_preview}")

        OPENAI_API_KEY = request.api_key
        OPENAI_AVAILABLE = True
        ml_models["openai_client"] = new_client

        print(f"🔑 Global state updated: OPENAI_AVAILABLE={OPENAI_AVAILABLE}, ml_models has client={('openai_client' in ml_models)}")
        print(f"✓ OpenAI API key updated successfully")

        return {
            "success": True,
            "message": "API key updated and validated successfully",
        }

    except Exception as e:
        print(f"❌ Failed to update API key: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "message": f"Failed to validate API key: {str(e)}",
        }


@app.get("/api/test-ai")
async def test_ai_connection():
    """
    Test OpenAI connection with current API key
    """
    if not OPENAI_AVAILABLE or "openai_client" not in ml_models:
        return {
            "success": False,
            "message": "OpenAI API key is not configured",
            "configured": False,
        }

    client = ml_models["openai_client"]

    try:
        # Test with a minimal API call
        models = await client.models.list()

        # Check if we got a valid response
        if models and hasattr(models, 'data') and len(models.data) > 0:
            return {
                "success": True,
                "message": "OpenAI API connection successful",
                "configured": True,
                "models_count": len(models.data),
            }
        else:
            return {
                "success": False,
                "message": "OpenAI API returned empty response",
                "configured": True,
            }

    except Exception as e:
        return {
            "success": False,
            "message": f"OpenAI API connection failed: {str(e)}",
            "configured": True,
        }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
