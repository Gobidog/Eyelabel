import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
import { Canvas } from 'react-design-editor';
import 'react-design-editor/dist/react-design-editor.css';
import { RootState, AppDispatch } from '@/store';
import { fetchProducts } from '@/store/productsSlice';
import { fetchActiveTemplates } from '@/store/templatesSlice';
import { createLabel, updateLabel, fetchLabelById } from '@/store/labelsSlice';
import { LabelType } from '@/types';
import type { CreateLabelData } from '@/services/label.service';
import { useNotifications } from '@/utils/notifications';

export default function NewLabelEditorPage() {
  const notifications = useNotifications();
  const { labelId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const canvasRef = useRef<any>(null);

  const { products } = useSelector((state: RootState) => state.products);
  const { templates } = useSelector((state: RootState) => state.templates);
  const { isLoading, error, currentLabel } = useSelector((state: RootState) => state.labels);

  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [labelType, setLabelType] = useState<LabelType>(LabelType.PRODUCT);

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

  const handleSave = async () => {
    if (!selectedProduct || !selectedTemplate) {
      notifications.warning('Please select a product and template');
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    // Get canvas data from react-design-editor
    const canvasData = canvasRef.current?.handler?.exportJSON() || {};

    const labelData: CreateLabelData['labelData'] = {
      fields: {
        productCode: product.productCode,
        productName: product.productName,
        gs1BarcodeNumber: product.gs1BarcodeNumber,
        description: product.description ?? '',
      },
      design: canvasData,
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

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find((t) => t.id === templateId);
    if (template && canvasRef.current) {
      // Load template data into the editor
      canvasRef.current.handler?.importJSON(template.templateData);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
      {/* Header */}
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

      {/* Canvas Editor - Full Height */}
      <Box sx={{ flex: 1, overflow: 'hidden', backgroundColor: '#ffffff', borderRadius: 1, border: 1, borderColor: 'divider' }}>
        <Canvas
          ref={canvasRef}
          minZoom={30}
          maxZoom={500}
          propertiesToInclude={['id', 'name', 'locked', 'file', 'src', 'link', 'tooltip']}
          objectOption={{
            rotation: 0,
            strokeUniform: true,
          }}
          canvasOption={{
            selectionColor: 'rgba(8, 151, 156, 0.3)',
            selection: true,
          }}
          gridOption={{
            enabled: true,
            grid: 20,
            snapToGrid: false,
          }}
        />
      </Box>
    </Box>
  );
}
