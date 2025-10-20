# Eye Lighting Carton Label Template - Complete Code

## Template JSON Structure (NEW GRID FORMAT)

This is the exact JSON template code used to generate the Eye Lighting carton label with perfect grid structure.

```json
{
  "name": "Carton Label - Final Grid",
  "type": "static",
  "width": 400,
  "height": 400,
  "elements": [
    { "type": "rect", "left": 0, "top": 0, "width": 400, "height": 400, "fill": "#FFFFFF", "stroke": "#000000", "strokeWidth": 2 },

    { "type": "rect", "left": 0, "top": 0, "width": 257, "height": 40, "fill": "#000000" },
    { "type": "rect", "left": 257, "top": 0, "width": 143, "height": 40, "fill": "#000000" },

    { "type": "line", "x1": 257, "y1": 0, "x2": 257, "y2": 40, "stroke": "#FFFFFF", "strokeWidth": 1 },

    { "type": "line", "x1": 0, "y1": 40, "x2": 400, "y2": 40, "stroke": "#000000", "strokeWidth": 1 },

    { "type": "line", "x1": 257, "y1": 40, "x2": 257, "y2": 400, "stroke": "#000000", "strokeWidth": 1 },

    { "type": "line", "x1": 0, "y1": 166, "x2": 400, "y2": 166, "stroke": "#000000", "strokeWidth": 1 },
    { "type": "line", "x1": 0, "y1": 234, "x2": 400, "y2": 234, "stroke": "#000000", "strokeWidth": 1 },

    { "type": "line", "x1": 0, "y1": 320, "x2": 257, "y2": 320, "stroke": "#000000", "strokeWidth": 1 },
    { "type": "line", "x1": 0, "y1": 360, "x2": 257, "y2": 360, "stroke": "#000000", "strokeWidth": 1 },

    { "type": "rect", "left": 0, "top": 234, "width": 257, "height": 86, "fill": "transparent", "stroke": "#000000", "strokeWidth": 1 },
    { "type": "line", "x1": 85.6667, "y1": 234, "x2": 85.6667, "y2": 320, "stroke": "#000000", "strokeWidth": 1 },
    { "type": "line", "x1": 171.3333, "y1": 234, "x2": 171.3333, "y2": 320, "stroke": "#000000", "strokeWidth": 1 },

    { "type": "rect", "left": 0, "top": 320, "width": 257, "height": 40, "fill": "transparent", "stroke": "#000000", "strokeWidth": 1 },
    { "type": "line", "x1": 0, "y1": 340, "x2": 257, "y2": 340, "stroke": "#000000", "strokeWidth": 1 },

    { "type": "rect", "left": 0, "top": 360, "width": 257, "height": 40, "fill": "transparent", "stroke": "#000000", "strokeWidth": 1 },
    { "type": "text", "left": 12, "top": 372, "text": "Made in China", "fontSize": 16, "fontFamily": "Arial", "fill": "#000000" },

    { "type": "rect", "left": 257, "top": 166, "width": 143, "height": 20, "fill": "#000000" },
    { "type": "rect", "left": 257, "top": 186, "width": 143, "height": 14, "fill": "#FFFFFF", "stroke": "#000000", "strokeWidth": 1 },
    { "type": "line", "x1": 304.6667, "y1": 186, "x2": 304.6667, "y2": 200, "stroke": "#000000", "strokeWidth": 1 },
    { "type": "line", "x1": 352.3333, "y1": 186, "x2": 352.3333, "y2": 200, "stroke": "#000000", "strokeWidth": 1 },

    { "type": "rect", "left": 257, "top": 200, "width": 143, "height": 20, "fill": "#000000" },
    { "type": "rect", "left": 257, "top": 220, "width": 143, "height": 14, "fill": "#FFFFFF", "stroke": "#000000", "strokeWidth": 1 },
    { "type": "line", "x1": 304.6667, "y1": 220, "x2": 304.6667, "y2": 234, "stroke": "#000000", "strokeWidth": 1 },
    { "type": "line", "x1": 352.3333, "y1": 220, "x2": 352.3333, "y2": 234, "stroke": "#000000", "strokeWidth": 1 }
  ]
}
```

## Template Variables

The template uses the following dynamic variables:

- `{{productName}}` - Product name shown in top-left black header
- `{{productCode}}` - Product code shown in top-right black header
- `{{barcode}}` - Barcode placeholder in bottom-right section

## Dimensions

- **Canvas Size**: 400px × 400px (perfect square)
- **Left Column**: 257px wide (64.25%)
- **Right Column**: 143px wide (35.75%)

## Color Scheme

- **Background**: White (#FFFFFF)
- **Borders**: Black (#000000)
- **Header Bars**: Black (#000000) with white text
- **Section Headers**: Black (#000000) with white text

## Layout Structure

1. **Top Row** (Y: 0-40)
   - Left header: 257px wide, black background
   - Right header: 143px wide, black background
   - White vertical divider line between them

2. **Content Area** (Y: 40-166)
   - Full width section for product info/logo
   - 126px height

3. **Middle Sections** (Y: 166-234)
   - Two selectable option rows (CCT/PWR)
   - Each with black header bar and 3 columns
   - Total height: 68px

4. **Bottom Left Grid** (Y: 234-400)
   - 3×3 grid for certifications (234-320)
   - Two rows below for text (320-360, 360-400)
   - "Made in China" label at bottom

5. **Right Column** (X: 257-400, Y: 40-400)
   - Full height barcode/info area
   - 143px wide

## How to Use in Fabric.js

### Method 1: Direct Element Loading (RECOMMENDED)

```javascript
const canvas = new fabric.Canvas('labelCanvas', {selection: false});
const template = /* paste JSON above */;

template.elements.forEach(e => {
  let obj;
  if (e.type === 'rect') {
    obj = new fabric.Rect(e);
  } else if (e.type === 'line') {
    obj = new fabric.Line([e.x1, e.y1, e.x2, e.y2], e);
  } else if (e.type === 'text') {
    obj = new fabric.Text(e.text, e);
  }
  if (obj) canvas.add(obj);
});
canvas.renderAll();
```

### Method 2: loadFromJSON (if using Fabric's JSON format)

The system automatically:
1. Loads template JSON from database
2. Parses elements (rect, line, text)
3. Creates Fabric objects with exact coordinates
4. Renders on canvas
5. Replaces `{{variables}}` with product data
6. Generates barcode and adds to canvas

## Line Element Format

Lines use **x1, y1, x2, y2** coordinates (NOT left/top/width/height):

```json
{ "type": "line", "x1": 0, "y1": 40, "x2": 400, "y2": 40, "stroke": "#000000", "strokeWidth": 1 }
```

This creates a horizontal line from (0,40) to (400,40).

## Border Structure

- **Outer frame**: 2px black stroke
- **Grid lines**: 1px black stroke
- **Dividers**: White or black depending on context
- **Precise positioning**: All coordinates are exact pixel values
