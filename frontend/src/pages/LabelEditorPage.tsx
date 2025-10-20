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
import { useNotifications } from '@/utils/notifications';
import { logger } from '@/utils/logger';

export default function LabelEditorPage() {
  const notifications = useNotifications();
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
      notifications.warning('Please select a product first to generate barcode');
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
      logger.error('Barcode generation error:', error);
      notifications.warning('Failed to generate barcode. Please try again.');
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

  const loadTemplate = (templateId?: string) => {
    const templateToLoad = templateId || selectedTemplate;
    if (!fabricCanvasRef.current || !templateToLoad) return;
    const template = templates.find((t) => t.id === templateToLoad);
    if (!template) {
      logger.error('Template not found:', templateToLoad);
      return;
    }

    logger.debug('Loading template:', template.name);
    logger.debug('Template data:', template.templateData);
    logger.debug('Elements count:', template.templateData.elements?.length);

    // Clear canvas completely (including old grid lines)
    fabricCanvasRef.current.clear();

    // Set canvas size from template
    fabricCanvasRef.current.setWidth(template.templateData.width);
    fabricCanvasRef.current.setHeight(template.templateData.height);
    fabricCanvasRef.current.backgroundColor = '#ffffff';

    // Load template elements by creating fabric objects directly
    if (template.templateData.elements && template.templateData.elements.length > 0) {
      logger.debug('Loading elements:', template.templateData.elements.length);

      template.templateData.elements.forEach((el: any) => {
        try {
          let obj: any;

          if (el.type === 'line') {
            // Support both formats: x1/y1/x2/y2 (new) and left/top/width/height (old)
            const coords = el.x1 !== undefined
              ? [el.x1, el.y1, el.x2, el.y2]
              : [el.left || 0, el.top || 0, (el.left || 0) + (el.width || 0), (el.top || 0) + (el.height || 0)];

            obj = new fabric.Line(coords, {
              stroke: el.stroke || '#000000',
              strokeWidth: el.strokeWidth || 1,
              selectable: el.selectable !== false,
              evented: el.evented !== false,
            });
          } else if (el.type === 'rect') {
            obj = new fabric.Rect({
              left: el.left || 0,
              top: el.top || 0,
              width: el.width || 0,
              height: el.height || 0,
              fill: el.fill || 'transparent',
              stroke: el.stroke || null,
              strokeWidth: el.strokeWidth || 0,
              rx: el.rx || 0,
              ry: el.ry || 0,
              selectable: el.selectable !== false,
              evented: el.evented !== false,
            });
          } else if (el.type === 'text' || el.type === 'i-text') {
            obj = new fabric.IText(el.text || 'Text', {
              left: el.left || 0,
              top: el.top || 0,
              fontSize: el.fontSize || 14,
              fontFamily: el.fontFamily || 'Arial',
              fontWeight: el.fontWeight || 'normal',
              fill: el.fill || '#000000',
              selectable: el.selectable !== false,
              evented: el.evented !== false,
            });
          } else if (el.type === 'circle') {
            obj = new fabric.Circle({
              left: el.left || 0,
              top: el.top || 0,
              radius: el.radius || 50,
              fill: el.fill || 'transparent',
              stroke: el.stroke || null,
              strokeWidth: el.strokeWidth || 0,
              selectable: el.selectable !== false,
              evented: el.evented !== false,
            });
          } else if (el.type === 'polygon') {
            obj = new fabric.Polygon(el.points || [], {
              left: el.left || 0,
              top: el.top || 0,
              fill: el.fill || 'transparent',
              stroke: el.stroke || null,
              strokeWidth: el.strokeWidth || 0,
              selectable: el.selectable !== false,
              evented: el.evented !== false,
            });
          }

          if (obj) {
            fabricCanvasRef.current!.add(obj);
          }
        } catch (error) {
          logger.error('Error creating object:', el.type, error);
        }
      });

      fabricCanvasRef.current.renderAll();
      logger.debug('Template loaded:', fabricCanvasRef.current.getObjects().length, 'objects');
    }
  };

  const handleSave = async () => {
    if (!fabricCanvasRef.current || !selectedProduct) {
      notifications.warning('Please select a product before saving');
      return;
    }

    // Get canvas data
    const canvasData = fabricCanvasRef.current.toJSON();

    // Find selected product
    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    if (!selectedTemplate) {
      notifications.warning('Please select a template before saving');
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
      notifications.warning('Please select a product and add elements to the canvas before exporting');
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
      logger.error('PDF export error:', error);
      notifications.warning('Failed to export PDF. Please try again.');
    }
  };

  const aiSuggestTemplate = async () => {
    if (!selectedProduct) {
      notifications.warning('Please select a product first');
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
        setTimeout(() => loadTemplate(matchedTemplate.id), 100);
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
      logger.error('AI template suggestion error:', error);
      setAiMessage('Failed to get AI template suggestion. Please try manually.');
    } finally {
      setAiLoading(false);
    }
  };

  const autoFillTemplate = async () => {
    if (!selectedProduct || !selectedTemplate) {
      notifications.warning('Please select both product and template first');
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    const template = templates.find((t) => t.id === selectedTemplate);
    if (!product || !template || !fabricCanvasRef.current) return;

    setAiLoading(true);
    setAiMessage('Auto-filling template with product data...');

    try {
      // Get all objects on canvas
      const objects = fabricCanvasRef.current.getObjects();

      // Mapping of placeholders to product data
      const placeholderMap: Record<string, string> = {
        '{{productName}}': product.productName,
        '{{productCode}}': product.productCode,
        '{{description}}': product.description || '',
        '{{powerInput}}': product.metadata?.powerInput || '120-240Vac ~ 50/60 Hz',
        '{{temperatureRating}}': product.metadata?.temperatureRating || 'ta= 50°C A40M OPTIC',
        '{{ipRating}}': product.metadata?.ipRating || 'IP66',
        '{{classRating}}': product.metadata?.classRating || 'Class I',
        '{{lotNumber}}': product.metadata?.lotNumber || '',
        '{{productImage}}': '[ICON]',
      };

      // Replace text placeholders
      objects.forEach((obj) => {
        if (obj.type === 'i-text' || obj.type === 'text') {
          const textObj = obj as fabric.IText;
          const currentText = textObj.text || '';

          // Check if text contains any placeholder
          for (const [placeholder, value] of Object.entries(placeholderMap)) {
            if (currentText.includes(placeholder)) {
              textObj.set({ text: currentText.replace(placeholder, value) });
            }
          }
        }
      });

      // Generate and replace barcode placeholder
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

            // Find barcode placeholder text and replace with image
            let barcodeTextObj: any = null;
            objects.forEach((obj) => {
              if ((obj.type === 'i-text' || obj.type === 'text') &&
                  (obj as fabric.IText).text?.includes('{{barcode}}')) {
                barcodeTextObj = obj;
              }
            });

            if (barcodeTextObj) {
              // Remove the placeholder text
              fabricCanvasRef.current!.remove(barcodeTextObj);

              // Add barcode image centered in the barcode box (168x133 at position 232,180)
              fabric.Image.fromURL(data.dataUrl, (img) => {
                const barcodeBoxLeft = 232;
                const barcodeBoxTop = 180;
                const barcodeBoxWidth = 168;
                const barcodeBoxHeight = 133;

                // Scale barcode to fit within box (leave some padding)
                const maxWidth = barcodeBoxWidth - 10;
                const maxHeight = barcodeBoxHeight - 20;
                const scaleX = maxWidth / (img.width || 200);
                const scaleY = maxHeight / (img.height || 100);
                const scale = Math.min(scaleX, scaleY, 1);

                img.set({
                  left: barcodeBoxLeft + 5,
                  top: barcodeBoxTop + 10,
                  scaleX: scale,
                  scaleY: scale,
                });
                fabricCanvasRef.current!.add(img);
                fabricCanvasRef.current!.renderAll();
              });
            }
          }
        } catch (error) {
          logger.error('Barcode generation failed:', error);
        }
      }

      fabricCanvasRef.current.renderAll();
      setAiMessage(`✓ Template auto-filled with product data: ${product.productName} (${product.productCode})`);
    } catch (error) {
      logger.error('Auto-fill error:', error);
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
                  const templateId = e.target.value;
                  setSelectedTemplate(templateId);
                  if (templateId) {
                    setTimeout(() => loadTemplate(templateId), 100);
                  }
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
