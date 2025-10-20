import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Stage, Layer, Rect, Line, Text } from 'react-konva';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { RootState, AppDispatch } from '@/store';
import { fetchProducts } from '@/store/productsSlice';
import { fetchActiveTemplates } from '@/store/templatesSlice';
import { createLabel, updateLabel, fetchLabelById } from '@/store/labelsSlice';
import { LabelType } from '@/types';
import type { CreateLabelData } from '@/services/label.service';
import { useNotifications } from '@/utils/notifications';
import { logger } from '@/utils/logger';

export default function KonvaLabelEditor() {
  const notifications = useNotifications();
  const { labelId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const stageRef = useRef<any>(null);

  const { products } = useSelector((state: RootState) => state.products);
  const { templates } = useSelector((state: RootState) => state.templates);
  const { isLoading, error, currentLabel } = useSelector((state: RootState) => state.labels);

  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [labelType, setLabelType] = useState<LabelType>(LabelType.PRODUCT);
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(600);
  const [templateElements, setTemplateElements] = useState<any[]>([]);
  const [baseTemplateElements, setBaseTemplateElements] = useState<any[]>([]);

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 100 }));
    dispatch(fetchActiveTemplates());
  }, [dispatch]);

  useEffect(() => {
    if (labelId) {
      dispatch(fetchLabelById(labelId));
    }
  }, [labelId, dispatch]);

  useEffect(() => {
    if (currentLabel && labelId) {
      setSelectedProduct(currentLabel.productId);
      setSelectedTemplate(currentLabel.templateId || '');
      setLabelType(currentLabel.labelType);
    }
  }, [currentLabel, labelId]);

  // Populate product data when product selection changes
  useEffect(() => {
    if (selectedProduct && baseTemplateElements.length > 0) {
      const product = products.find(p => p.id === selectedProduct);
      if (product) {
        logger.debug('Populating template with product:', product.productName);
        setTemplateElements(populateProductData(baseTemplateElements, product));
      }
    }
  }, [selectedProduct, baseTemplateElements, products]);

  const populateProductData = (elements: any[], product: any) => {
    return elements.map(el => {
      if (el.type === 'text' || el.type === 'i-text') {
        let text = el.text || '';

        // Replace placeholders with actual product data
        text = text.replace(/\{\{productCode\}\}/g, product.productCode || '');
        text = text.replace(/\{\{productName\}\}/g, product.productName || '');
        text = text.replace(/\{\{gs1BarcodeNumber\}\}/g, product.gs1BarcodeNumber || '');
        text = text.replace(/\{\{description\}\}/g, product.description || '');
        text = text.replace(/\{\{barcode\}\}/g, product.gs1BarcodeNumber || '');

        return { ...el, text };
      }
      return el;
    });
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find((t) => t.id === templateId);

    if (template) {
      logger.debug('Loading template:', template.name, template.templateData);

      setCanvasWidth(template.templateData.width || 800);
      setCanvasHeight(template.templateData.height || 600);

      const elements = template.templateData.elements || [];
      setBaseTemplateElements(elements);

      // If product is already selected, populate data immediately
      if (selectedProduct) {
        const product = products.find(p => p.id === selectedProduct);
        if (product) {
          setTemplateElements(populateProductData(elements, product));
        } else {
          setTemplateElements(elements);
        }
      } else {
        setTemplateElements(elements);
      }
    }
  };

  const handleSave = async () => {
    if (!selectedProduct || !selectedTemplate) {
      notifications.warning('Please select a product and template');
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    const labelData: CreateLabelData['labelData'] = {
      fields: {
        productCode: product.productCode,
        productName: product.productName,
        gs1BarcodeNumber: product.gs1BarcodeNumber,
        description: product.description ?? '',
      },
      design: {
        width: canvasWidth,
        height: canvasHeight,
        elements: templateElements,
      },
    };

    const labelPayload: CreateLabelData = {
      productId: selectedProduct,
      templateId: selectedTemplate,
      labelType,
      labelData,
      notes: '',
    };

    if (labelId) {
      await dispatch(updateLabel({ id: labelId, data: labelPayload }));
    } else {
      await dispatch(createLabel(labelPayload));
    }

    if (!error) {
      navigate('/labels');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
      <Box
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button startIcon={<BackIcon />} onClick={() => navigate('/labels')}>
            Back
          </Button>
          <Typography variant="h5">Label Editor</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 250 }} size="small">
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

          <FormControl sx={{ minWidth: 250 }} size="small">
            <InputLabel>Template</InputLabel>
            <Select
              value={selectedTemplate}
              label="Template"
              onChange={(e) => handleTemplateChange(e.target.value)}
            >
              <MenuItem value="">Blank Canvas</MenuItem>
              {templates.map((template) => (
                <MenuItem key={template.id} value={template.id}>
                  {template.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }} size="small">
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

          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={isLoading || !selectedProduct || !selectedTemplate}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: '#f0f0f0',
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 3,
        }}
      >
        <Stage width={canvasWidth} height={canvasHeight} ref={stageRef}>
          <Layer>
            <Rect
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
              fill="white"
            />

            {templateElements.map((el, index) => {
              if (el.type === 'line') {
                const x1 = el.x1 !== undefined ? el.x1 : el.left || 0;
                const y1 = el.y1 !== undefined ? el.y1 : el.top || 0;
                const x2 = el.x2 !== undefined ? el.x2 : (el.left || 0) + (el.width || 0);
                const y2 = el.y2 !== undefined ? el.y2 : (el.top || 0) + (el.height || 0);

                return (
                  <Line
                    key={`line-${index}`}
                    points={[x1, y1, x2, y2]}
                    stroke={el.stroke || '#000000'}
                    strokeWidth={el.strokeWidth || 1}
                  />
                );
              }

              if (el.type === 'rect') {
                return (
                  <Rect
                    key={`rect-${index}`}
                    x={el.left || 0}
                    y={el.top || 0}
                    width={el.width || 0}
                    height={el.height || 0}
                    fill={el.fill || 'transparent'}
                    stroke={el.stroke || undefined}
                    strokeWidth={el.strokeWidth || 0}
                  />
                );
              }

              if (el.type === 'text' || el.type === 'i-text') {
                return (
                  <Text
                    key={`text-${index}`}
                    x={el.left || 0}
                    y={el.top || 0}
                    text={el.text || 'Text'}
                    fontSize={el.fontSize || 14}
                    fontFamily={el.fontFamily || 'Arial'}
                    fill={el.fill || '#000000'}
                  />
                );
              }

              return null;
            })}
          </Layer>
        </Stage>
      </Box>
    </Box>
  );
}
