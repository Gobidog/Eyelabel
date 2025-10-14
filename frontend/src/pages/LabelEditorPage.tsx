import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fabric } from 'fabric';
import jsPDF from 'jspdf';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import {
  TextFields as TextIcon,
  RectangleOutlined as RectangleIcon,
  CircleOutlined as CircleIcon,
  QrCode2 as BarcodeIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  AutoAwesome as AIIcon,
  Psychology as BrainIcon,
} from '@mui/icons-material';
import type { CreateLabelData } from '@/services/label.service';
import { AIService } from '@/services/ai.service';
import { RootState, AppDispatch } from '@/store';
import { fetchProducts } from '@/store/productsSlice';
import { fetchActiveTemplates } from '@/store/templatesSlice';
import { createLabel, updateLabel, fetchLabelById } from '@/store/labelsSlice';
import { LabelType } from '@/types';

export default function LabelEditorPage() {
  const { labelId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  const { products } = useSelector((state: RootState) => state.products);
  const { templates } = useSelector((state: RootState) => state.templates);
  const { isLoading, error, currentLabel } = useSelector((state: RootState) => state.labels);

  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [labelType, setLabelType] = useState<LabelType>(LabelType.PRODUCT);
  const [notes, setNotes] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState('');

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 100 }));
    dispatch(fetchActiveTemplates());
  }, [dispatch]);

  // Load existing label data in edit mode
  useEffect(() => {
    if (labelId) {
      dispatch(fetchLabelById(labelId));
    }
  }, [labelId, dispatch]);

  // Populate form when label is loaded
  useEffect(() => {
    if (currentLabel && labelId) {
      setSelectedProduct(currentLabel.productId);
      setSelectedTemplate(currentLabel.templateId || '');
      setLabelType(currentLabel.labelType);
      setNotes(currentLabel.notes || '');

      // Load canvas design if it exists
      if (currentLabel.labelData?.design && fabricCanvasRef.current) {
        fabricCanvasRef.current.loadFromJSON(
          currentLabel.labelData.design,
          () => {
            fabricCanvasRef.current?.renderAll();
          }
        );
      }
    }
  }, [currentLabel, labelId]);

  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: '#ffffff',
      });
      fabricCanvasRef.current = canvas;

      // Add grid
      const gridSize = 20;
      for (let i = 0; i < 800 / gridSize; i++) {
        canvas.add(
          new fabric.Line([i * gridSize, 0, i * gridSize, 600], {
            stroke: '#ccc',
            selectable: false,
            evented: false,
          })
        );
        canvas.add(
          new fabric.Line([0, i * gridSize, 800, i * gridSize], {
            stroke: '#ccc',
            selectable: false,
            evented: false,
          })
        );
      }
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, []);

  const addText = () => {
    if (!fabricCanvasRef.current) return;
    const text = new fabric.IText('Double-click to edit', {
      left: 100,
      top: 100,
      fontFamily: 'Arial',
      fontSize: 20,
      fill: '#000000',
    });
    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.renderAll();
  };

  const addRectangle = () => {
    if (!fabricCanvasRef.current) return;
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 200,
      height: 100,
      fill: 'rgba(0,123,255,0.3)',
      stroke: '#007bff',
      strokeWidth: 2,
    });
    fabricCanvasRef.current.add(rect);
    fabricCanvasRef.current.setActiveObject(rect);
    fabricCanvasRef.current.renderAll();
  };

  const addCircle = () => {
    if (!fabricCanvasRef.current) return;
    const circle = new fabric.Circle({
      left: 100,
      top: 100,
      radius: 50,
      fill: 'rgba(40,167,69,0.3)',
      stroke: '#28a745',
      strokeWidth: 2,
    });
    fabricCanvasRef.current.add(circle);
    fabricCanvasRef.current.setActiveObject(circle);
    fabricCanvasRef.current.renderAll();
  };

  const addBarcode = async () => {
    if (!fabricCanvasRef.current) return;

    // Get selected product's barcode number
    const product = products.find((p) => p.id === selectedProduct);
    if (!product) {
      alert('Please select a product first to generate barcode');
      return;
    }

    try {
      // Call backend to generate barcode
      const response = await fetch(`${import.meta.env.VITE_API_URL}/barcode/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: product.gs1BarcodeNumber,
          format: 'ean13',
          height: 50,
          width: 2,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate barcode');
      }

      const data = await response.json();

      // Load barcode image into Fabric canvas
      fabric.Image.fromURL(data.dataUrl, (img) => {
        img.set({
          left: 100,
          top: 100,
          scaleX: 1,
          scaleY: 1,
        });
        fabricCanvasRef.current!.add(img);
        fabricCanvasRef.current!.setActiveObject(img);
        fabricCanvasRef.current!.renderAll();
      });
    } catch (error) {
      console.error('Barcode generation error:', error);
      alert('Failed to generate barcode. Please try again.');
    }
  };

  const deleteSelected = () => {
    if (!fabricCanvasRef.current) return;
    const activeObjects = fabricCanvasRef.current.getActiveObjects();
    if (activeObjects.length) {
      fabricCanvasRef.current.remove(...activeObjects);
      fabricCanvasRef.current.discardActiveObject();
      fabricCanvasRef.current.renderAll();
    }
  };

  const loadTemplate = () => {
    if (!fabricCanvasRef.current || !selectedTemplate) return;
    const template = templates.find((t) => t.id === selectedTemplate);
    if (!template) return;

    // Clear canvas except grid
    const objects = fabricCanvasRef.current.getObjects();
    objects.forEach((obj) => {
      if (obj.selectable !== false) {
        fabricCanvasRef.current!.remove(obj);
      }
    });

    // Set canvas size from template
    fabricCanvasRef.current.setWidth(template.templateData.width * 3);
    fabricCanvasRef.current.setHeight(template.templateData.height * 3);

    // Load template elements
    template.templateData.elements?.forEach((element: any) => {
      let obj: fabric.Object | null = null;

      if (element.type === 'text') {
        obj = new fabric.IText(element.properties?.text || 'Text', {
          left: element.x * 3,
          top: element.y * 3,
          fontSize: (element.properties?.fontSize || 14) * 3,
          fill: element.properties?.fill || '#000000',
        });
      } else if (element.type === 'rect') {
        obj = new fabric.Rect({
          left: element.x * 3,
          top: element.y * 3,
          width: element.width * 3,
          height: element.height * 3,
          fill: element.properties?.fill || '#ffffff',
          stroke: element.properties?.stroke || '#000000',
          strokeWidth: element.properties?.strokeWidth || 1,
        });
      }

      if (obj) {
        fabricCanvasRef.current!.add(obj);
      }
    });

    fabricCanvasRef.current.renderAll();
  };

  const handleSave = async () => {
    if (!fabricCanvasRef.current || !selectedProduct) {
      alert('Please select a product before saving');
      return;
    }

    // Get canvas data
    const canvasData = fabricCanvasRef.current.toJSON();

    // Find selected product
    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    if (!selectedTemplate) {
      alert('Please select a template before saving');
      return;
    }

    const labelData: CreateLabelData['labelData'] = {
      fields: {
        productCode: product.productCode,
        productName: product.productName,
        gs1BarcodeNumber: product.gs1BarcodeNumber,
        description: product.description ?? '',
      },
      design: canvasData as unknown as Record<string, any>,
    };

    const labelPayload: CreateLabelData = {
      productId: selectedProduct,
      templateId: selectedTemplate,
      labelType,
      labelData,
      notes,
    };

    if (labelId) {
      await dispatch(updateLabel({ id: labelId, data: labelPayload }));
    } else {
      await dispatch(createLabel(labelPayload));
    }

    if (!error) {
      setSaveDialogOpen(false);
      navigate('/labels');
    }
  };

  const exportToPDF = async () => {
    if (!fabricCanvasRef.current || !selectedProduct) {
      alert('Please select a product and add elements to the canvas before exporting');
      return;
    }

    try {
      const product = products.find((p) => p.id === selectedProduct);

      // Export canvas at high resolution (300 DPI equivalent)
      const dataURL = fabricCanvasRef.current.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 3.75, // 3.75x for 300 DPI from 80 DPI default
      });

      // Create PDF with canvas dimensions
      const canvasWidth = fabricCanvasRef.current.getWidth();
      const canvasHeight = fabricCanvasRef.current.getHeight();

      // Convert pixels to mm (assuming 96 DPI)
      const pdfWidth = (canvasWidth * 25.4) / 96;
      const pdfHeight = (canvasHeight * 25.4) / 96;

      const pdf = new jsPDF({
        orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
      });

      // Add canvas image to PDF
      pdf.addImage(dataURL, 'PNG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');

      // Save PDF with product name
      const filename = product
        ? `${product.productName.replace(/\s+/g, '-')}-label.pdf`
        : 'label.pdf';

      pdf.save(filename);
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const aiSuggestTemplate = async () => {
    if (!selectedProduct) {
      alert('Please select a product first');
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    setAiLoading(true);
    setAiMessage('AI is analyzing product and suggesting template...');

    try {
      const response = await AIService.suggestTemplate({
        product_type: product.productCode || 'standard',
        product_name: product.productName,
        description: product.description,
      });

      // Find matching template
      const matchedTemplate = templates.find((t) =>
        t.name.toLowerCase().includes(response.template_type.toLowerCase())
      );

      if (matchedTemplate) {
        setSelectedTemplate(matchedTemplate.id);
        setTimeout(loadTemplate, 100);
        setAiMessage(
          `AI Suggestion: ${response.template_type} template (Confidence: ${Math.round(
            response.confidence * 100
          )}%). Reason: ${response.reason}`
        );
      } else {
        setAiMessage(
          `AI suggested "${response.template_type}" but no matching template found. ${response.reason}`
        );
      }
    } catch (error) {
      console.error('AI template suggestion error:', error);
      setAiMessage('Failed to get AI template suggestion. Please try manually.');
    } finally {
      setAiLoading(false);
    }
  };

  const autoFillTemplate = async () => {
    if (!selectedProduct || !selectedTemplate) {
      alert('Please select both product and template first');
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    const template = templates.find((t) => t.id === selectedTemplate);
    if (!product || !template || !fabricCanvasRef.current) return;

    setAiLoading(true);
    setAiMessage('Auto-filling template with product data...');

    try {
      // Get all text objects on canvas
      const objects = fabricCanvasRef.current.getObjects();

      // Auto-fill text fields based on common placeholder patterns
      objects.forEach((obj) => {
        if (obj.type === 'i-text' || obj.type === 'text') {
          const textObj = obj as fabric.IText;
          const currentText = textObj.text?.toLowerCase() || '';

          // Replace placeholders with actual product data
          if (currentText.includes('product') && currentText.includes('name')) {
            textObj.set({ text: product.productName });
          } else if (currentText.includes('product') && currentText.includes('code')) {
            textObj.set({ text: product.productCode });
          } else if (currentText.includes('description')) {
            textObj.set({ text: product.description || '' });
          } else if (currentText.includes('power') && currentText.includes('input')) {
            textObj.set({ text: product.metadata?.powerInput || '' });
          } else if (currentText.includes('temperature')) {
            textObj.set({ text: product.metadata?.temperatureRating || '' });
          } else if (currentText.includes('ip') && (currentText.includes('rating') || currentText.includes('66'))) {
            textObj.set({ text: product.metadata?.ipRating || '' });
          } else if (currentText.includes('class')) {
            textObj.set({ text: product.metadata?.classRating || '' });
          } else if (currentText.includes('frequency') || currentText.includes('hz')) {
            textObj.set({ text: product.metadata?.frequency || '' });
          } else if (currentText.includes('cct') || currentText.includes('4000k')) {
            textObj.set({ text: product.metadata?.cctValue || '' });
          } else if (currentText.includes('made') && currentText.includes('in')) {
            textObj.set({ text: product.metadata?.madeIn || 'Made in China' });
          }
        }
      });

      // Generate and add barcode if product has barcode number
      if (product.gs1BarcodeNumber) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/barcode/generate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: product.gs1BarcodeNumber,
              format: 'ean13',
              height: 50,
              width: 2,
            }),
          });

          if (response.ok) {
            const data = await response.json();

            // Find existing barcode placeholder or add new one
            let barcodeExists = false;
            objects.forEach((obj) => {
              if (obj.type === 'image' && obj.get('data-barcode')) {
                barcodeExists = true;
              }
            });

            if (!barcodeExists) {
              fabric.Image.fromURL(data.dataUrl, (img) => {
                img.set({
                  left: 600,
                  top: 450,
                  scaleX: 1,
                  scaleY: 1,
                });
                img.set('data-barcode', true);
                fabricCanvasRef.current!.add(img);
                fabricCanvasRef.current!.renderAll();
              });
            }
          }
        } catch (error) {
          console.error('Barcode generation failed:', error);
        }
      }

      fabricCanvasRef.current.renderAll();
      setAiMessage(`✓ Template auto-filled with product data: ${product.productName} (${product.productCode})`);
    } catch (error) {
      console.error('Auto-fill error:', error);
      setAiMessage('Failed to auto-fill template. Please fill manually.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Label Editor
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate('/labels')}>
            Cancel
          </Button>
          <Button
            variant="outlined"
            startIcon={<PdfIcon />}
            onClick={exportToPDF}
            color="secondary"
          >
            Export PDF
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => setSaveDialogOpen(true)}
          >
            Save Label
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Sidebar */}
        <Card sx={{ width: 300 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Label Settings
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Product</InputLabel>
              <Select
                value={selectedProduct}
                label="Product"
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <MenuItem value="">Select Product</MenuItem>
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.productName} ({product.productCode})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Template</InputLabel>
              <Select
                value={selectedTemplate}
                label="Template"
                onChange={(e) => {
                  setSelectedTemplate(e.target.value);
                  setTimeout(loadTemplate, 100);
                }}
              >
                <MenuItem value="">Blank Canvas</MenuItem>
                {templates.map((template) => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Label Type</InputLabel>
              <Select
                value={labelType}
                label="Label Type"
                onChange={(e) => setLabelType(e.target.value as LabelType)}
              >
                <MenuItem value={LabelType.PRODUCT}>Product</MenuItem>
                <MenuItem value={LabelType.CARTON}>Carton</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              AI Assistant
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<BrainIcon />}
                onClick={aiSuggestTemplate}
                fullWidth
                disabled={!selectedProduct || aiLoading}
              >
                AI Suggest Template
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<AIIcon />}
                onClick={autoFillTemplate}
                fullWidth
                disabled={!selectedProduct || !selectedTemplate || aiLoading}
              >
                Auto-Fill Template
              </Button>
            </Box>

            {aiMessage && (
              <Box
                sx={{
                  p: 2,
                  mb: 2,
                  backgroundColor: 'info.light',
                  borderRadius: 1,
                  fontSize: '0.875rem',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  AI Assistant:
                </Typography>
                <Typography variant="body2">{aiMessage}</Typography>
              </Box>
            )}

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Tools
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<TextIcon />}
                onClick={addText}
                fullWidth
              >
                Add Text
              </Button>
              <Button
                variant="outlined"
                startIcon={<RectangleIcon />}
                onClick={addRectangle}
                fullWidth
              >
                Add Rectangle
              </Button>
              <Button
                variant="outlined"
                startIcon={<CircleIcon />}
                onClick={addCircle}
                fullWidth
              >
                Add Circle
              </Button>
              <Button
                variant="outlined"
                startIcon={<BarcodeIcon />}
                onClick={addBarcode}
                fullWidth
              >
                Add Barcode
              </Button>
              <Button
                variant="outlined"
                startIcon={<DeleteIcon />}
                onClick={deleteSelected}
                color="error"
                fullWidth
              >
                Delete Selected
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Canvas Area */}
        <Paper sx={{ flex: 1, p: 2, overflow: 'auto' }}>
          <canvas ref={canvasRef} />
        </Paper>
      </Box>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Label</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to save this label?
          </Typography>
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
