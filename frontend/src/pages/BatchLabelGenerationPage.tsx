import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Alert,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import {
  Upload,
  Download,
  Preview as PreviewIcon,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import Papa from 'papaparse';
import { fabric } from 'fabric';
import jsPDF from 'jspdf';
import { logger } from '@/utils/logger';

interface CSVRow {
  [key: string]: string;
}

interface ProductData {
  productName: string;
  productCode: string;
  gs1BarcodeNumber: string;
  powerInput: string;
  temperatureRating: string;
  ipRating: string;
  classRating: string;
  frequency: string;
  cctValue: string;
  madeIn: string;
}

interface ColumnMapping {
  productName: string;
  productCode: string;
  gs1BarcodeNumber: string;
  powerInput: string;
  temperatureRating: string;
  ipRating: string;
  classRating: string;
  frequency: string;
  cctValue: string;
  madeIn: string;
}

interface GeneratedLabel {
  index: number;
  productName: string;
  dataUrl: string;
  status: 'success' | 'error';
  error?: string;
}

const steps = ['Upload CSV', 'Map Columns', 'Generate Labels', 'Download PDFs'];

const BatchLabelGenerationPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [csvData, setCSVData] = useState<CSVRow[]>([]);
  const [csvHeaders, setCSVHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    productName: '',
    productCode: '',
    gs1BarcodeNumber: '',
    powerInput: '',
    temperatureRating: '',
    ipRating: '',
    classRating: '',
    frequency: '',
    cctValue: '',
    madeIn: '',
  });
  const [generatedLabels, setGeneratedLabels] = useState<GeneratedLabel[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  // Cleanup canvas on unmount
  useEffect(() => {
    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, []);

  // Helper function to normalize column names for matching
  const normalizeColumnName = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/_/g, '')
      .replace(/-/g, '');
  };

  // Auto-map CSV columns to label fields
  const autoMapColumns = (headers: string[]): ColumnMapping => {
    const mapping: ColumnMapping = {
      productName: '',
      productCode: '',
      gs1BarcodeNumber: '',
      powerInput: '',
      temperatureRating: '',
      ipRating: '',
      classRating: '',
      frequency: '',
      cctValue: '',
      madeIn: '',
    };

    const fieldNameMap: Record<string, keyof ColumnMapping> = {
      productname: 'productName',
      description: 'productName', // Also map "description" to productName
      productcode: 'productCode',
      gs1barcodenumber: 'gs1BarcodeNumber',
      powerinput: 'powerInput',
      temperaturerating: 'temperatureRating',
      iprating: 'ipRating',
      classrating: 'classRating',
      frequency: 'frequency',
      cctvalue: 'cctValue',
      madein: 'madeIn',
    };

    headers.forEach((header) => {
      const normalized = normalizeColumnName(header);
      const matchedField = fieldNameMap[normalized];
      if (matchedField) {
        mapping[matchedField] = header;
      }
    });

    return mapping;
  };

  // CSV Upload Handler with file size and row count validation
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // File size validation (10MB limit)
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxFileSize) {
      setError(`File size exceeds 10MB limit. Please use a smaller CSV file.`);
      return;
    }

    setError(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length === 0) {
          setError('CSV file is empty');
          return;
        }

        // Row count validation (500 rows limit)
        const maxRows = 500;
        if (results.data.length > maxRows) {
          setError(`CSV contains ${results.data.length} rows. Maximum allowed is ${maxRows} rows per batch. Please split your file into smaller batches.`);
          return;
        }

        const headers = Object.keys(results.data[0] as CSVRow);
        setCSVHeaders(headers);
        setCSVData(results.data as CSVRow[]);

        // Auto-map columns based on header names
        const autoMapping = autoMapColumns(headers);
        setColumnMapping(autoMapping);

        // Check if all required fields are mapped - if so, skip to generation
        const requiredFields: (keyof ColumnMapping)[] = [
          'productName',
          'productCode',
          'gs1BarcodeNumber',
        ];
        const allRequiredMapped = requiredFields.every((field) => autoMapping[field] !== '');

        if (allRequiredMapped) {
          // All required fields auto-mapped successfully - skip to generation step
          setActiveStep(2);
        } else {
          // Some required fields missing - show mapping page for manual adjustment
          setActiveStep(1);
        }
      },
      error: (error) => {
        setError(`Failed to parse CSV: ${error.message}`);
        setActiveStep(0);
      },
    });
  };

  // Column mapping handler
  const handleMappingChange = (field: keyof ColumnMapping, value: string) => {
    setColumnMapping((prev) => ({ ...prev, [field]: value }));
  };

  // Validate mapping
  const isMappingValid = () => {
    const requiredFields: (keyof ColumnMapping)[] = [
      'productName',
      'productCode',
      'gs1BarcodeNumber',
    ];
    return requiredFields.every((field) => columnMapping[field] !== '');
  };

  // Generate barcode from backend
  const generateBarcode = async (barcodeNumber: string): Promise<string> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/barcode/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: barcodeNumber,
          format: 'ean13',
          height: 50,
          width: 2,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate barcode');
      }

      const data = await response.json();
      return data.dataUrl;
    } catch (error) {
      logger.error('Barcode generation error:', error);
      throw error;
    }
  };

  // Create carton label on canvas
  const createCartonLabel = async (productData: ProductData, canvas: fabric.Canvas): Promise<void> => {
    canvas.clear();
    canvas.setDimensions({ width: 800, height: 600 });
    canvas.backgroundColor = '#FFFFFF';

    // Header - Product Name and Model
    const productNameText = new fabric.Text(productData.productName, {
      left: 50,
      top: 30,
      fontSize: 28,
      fontWeight: 'bold',
      fill: '#000000',
      fontFamily: 'Arial',
    });
    canvas.add(productNameText);

    const modelText = new fabric.Text(productData.productCode, {
      left: 50,
      top: 65,
      fontSize: 20,
      fill: '#333333',
      fontFamily: 'Arial',
    });
    canvas.add(modelText);

    // Specifications Box
    const specsBoxBorder = new fabric.Rect({
      left: 50,
      top: 110,
      width: 700,
      height: 80,
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 2,
    });
    canvas.add(specsBoxBorder);

    const specsText = `${productData.powerInput} ${productData.frequency} tₐ= ${productData.temperatureRating} ${productData.cctValue}`;
    const specsLabel = new fabric.Text(specsText, {
      left: 60,
      top: 130,
      fontSize: 18,
      fill: '#000000',
      fontFamily: 'Arial',
    });
    canvas.add(specsLabel);

    // Barcode - critical for label, throw error if fails
    try {
      const barcodeDataUrl = await generateBarcode(productData.gs1BarcodeNumber);
      const barcodeImg = await new Promise<fabric.Image>((resolve, reject) => {
        fabric.Image.fromURL(barcodeDataUrl, (img) => {
          if (img) {
            img.set({
              left: 50,
              top: 220,
              scaleX: 2.5,
              scaleY: 2.5,
            });
            resolve(img);
          } else {
            reject(new Error('Failed to load barcode image'));
          }
        });
      });
      canvas.add(barcodeImg);
    } catch (error) {
      throw new Error(`Barcode generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Symbols Row (IP Rating, Class Rating, Recycling, Bin)
    const symbolsY = 380;
    const symbolSpacing = 100;

    // IP Rating Symbol (IP66)
    const ipBox = new fabric.Rect({
      left: 50,
      top: symbolsY,
      width: 80,
      height: 80,
      fill: '#FFFFFF',
      stroke: '#000000',
      strokeWidth: 2,
      rx: 5,
      ry: 5,
    });
    canvas.add(ipBox);

    const ipText = new fabric.Text(productData.ipRating || 'IP66', {
      left: 60,
      top: symbolsY + 25,
      fontSize: 24,
      fontWeight: 'bold',
      fill: '#000000',
      fontFamily: 'Arial',
    });
    canvas.add(ipText);

    // Class Rating Symbol
    const classBox = new fabric.Rect({
      left: 50 + symbolSpacing,
      top: symbolsY,
      width: 80,
      height: 80,
      fill: '#FFFFFF',
      stroke: '#000000',
      strokeWidth: 2,
      rx: 5,
      ry: 5,
    });
    canvas.add(classBox);

    const classText = new fabric.Text(productData.classRating || 'Class I', {
      left: 55 + symbolSpacing,
      top: symbolsY + 20,
      fontSize: 16,
      fontWeight: 'bold',
      fill: '#000000',
      fontFamily: 'Arial',
      textAlign: 'center',
    });
    canvas.add(classText);

    // Recycling Symbol (simplified)
    const recycleCircle = new fabric.Circle({
      left: 50 + symbolSpacing * 2,
      top: symbolsY,
      radius: 40,
      fill: 'transparent',
      stroke: '#008000',
      strokeWidth: 3,
    });
    canvas.add(recycleCircle);

    const recycleText = new fabric.Text('♻', {
      left: 65 + symbolSpacing * 2,
      top: symbolsY + 15,
      fontSize: 40,
      fill: '#008000',
      fontFamily: 'Arial',
    });
    canvas.add(recycleText);

    // Bin Symbol (crossed-out bin)
    const binRect = new fabric.Rect({
      left: 50 + symbolSpacing * 3,
      top: symbolsY + 20,
      width: 50,
      height: 60,
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 2,
    });
    canvas.add(binRect);

    const binLine1 = new fabric.Line([50 + symbolSpacing * 3, symbolsY, 100 + symbolSpacing * 3, symbolsY + 80], {
      stroke: '#FF0000',
      strokeWidth: 3,
    });
    canvas.add(binLine1);

    const binLine2 = new fabric.Line([100 + symbolSpacing * 3, symbolsY, 50 + symbolSpacing * 3, symbolsY + 80], {
      stroke: '#FF0000',
      strokeWidth: 3,
    });
    canvas.add(binLine2);

    // Company Branding
    const brandingText = new fabric.Text('EYE LIGHTING AUSTRALIA', {
      left: 50,
      top: 500,
      fontSize: 22,
      fontWeight: 'bold',
      fill: '#000000',
      fontFamily: 'Arial',
    });
    canvas.add(brandingText);

    // Made In
    const madeInText = new fabric.Text(`Made in ${productData.madeIn || 'China'}`, {
      left: 50,
      top: 530,
      fontSize: 16,
      fill: '#666666',
      fontFamily: 'Arial',
    });
    canvas.add(madeInText);

    canvas.renderAll();
  };

  // Generate all labels
  const handleGenerateLabels = async () => {
    if (!canvasRef.current) return;

    setIsGenerating(true);
    setError(null);
    setProgress(0);
    const labels: GeneratedLabel[] = [];

    // Create canvas and store in ref for cleanup
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
    });
    fabricCanvasRef.current = canvas;

    for (let i = 0; i < csvData.length; i++) {
      try {
        const row = csvData[i];
        const productData: ProductData = {
          productName: row[columnMapping.productName] || '',
          productCode: row[columnMapping.productCode] || '',
          gs1BarcodeNumber: row[columnMapping.gs1BarcodeNumber] || '',
          powerInput: row[columnMapping.powerInput] || '',
          temperatureRating: row[columnMapping.temperatureRating] || '',
          ipRating: row[columnMapping.ipRating] || '',
          classRating: row[columnMapping.classRating] || '',
          frequency: row[columnMapping.frequency] || '50 Hz',
          cctValue: row[columnMapping.cctValue] || '4000K',
          madeIn: row[columnMapping.madeIn] || 'China',
        };

        await createCartonLabel(productData, canvas);

        // Use requestAnimationFrame instead of setTimeout for better performance
        await new Promise((resolve) => requestAnimationFrame(resolve));

        const dataUrl = canvas.toDataURL({
          format: 'png',
          quality: 1,
          multiplier: 2, // Reduced from 3 to 2 for better memory usage
        });

        labels.push({
          index: i,
          productName: productData.productName,
          dataUrl,
          status: 'success',
        });

        setProgress(((i + 1) / csvData.length) * 100);
      } catch (error) {
        labels.push({
          index: i,
          productName: csvData[i][columnMapping.productName] || `Row ${i + 1}`,
          dataUrl: '',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    canvas.dispose();
    fabricCanvasRef.current = null;
    setGeneratedLabels(labels);
    setIsGenerating(false);
    setActiveStep(3);
  };

  // Download all as PDF
  const handleDownloadPDFs = () => {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    generatedLabels.forEach((label, index) => {
      if (label.status === 'success') {
        if (index > 0) {
          pdf.addPage();
        }
        pdf.addImage(label.dataUrl, 'PNG', 10, 10, 277, 190, '', 'FAST');
      }
    });

    pdf.save(`carton-labels-batch-${Date.now()}.pdf`);
  };

  // Download individual PDF
  const handleDownloadSingle = (label: GeneratedLabel) => {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    pdf.addImage(label.dataUrl, 'PNG', 10, 10, 277, 190, '', 'FAST');
    pdf.save(`label-${label.productName.replace(/\s+/g, '-')}.pdf`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Batch Label Generation
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Upload CSV file to automatically generate carton labels in bulk
      </Typography>

      <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
        <strong>Note:</strong> This batch generator creates labels client-side for immediate PDF download.
        Labels are NOT saved to the database or associated with products. Use the standard label editor
        for labels that need to be tracked, approved, or integrated with inventory management.
      </Alert>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Step 1: Upload CSV */}
        {activeStep === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Button variant="contained" component="label" startIcon={<Upload />} size="large">
              Upload CSV File
              <input type="file" accept=".csv" hidden onChange={handleFileUpload} />
            </Button>
            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
              CSV should contain product information including name, code, barcode, specifications
            </Typography>
          </Box>
        )}

        {/* Step 2: Map Columns */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Map CSV Columns to Label Fields
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Found {csvData.length} rows in CSV. Columns have been automatically mapped based on header names.
              Review and adjust if needed.
            </Alert>

            <Grid container spacing={2}>
              {Object.keys(columnMapping).map((field) => (
                <Grid item xs={12} sm={6} key={field}>
                  <FormControl fullWidth>
                    <InputLabel>{field.replace(/([A-Z])/g, ' $1').trim()}</InputLabel>
                    <Select
                      value={columnMapping[field as keyof ColumnMapping]}
                      onChange={(e) => handleMappingChange(field as keyof ColumnMapping, e.target.value)}
                      label={field.replace(/([A-Z])/g, ' $1').trim()}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {csvHeaders.map((header) => (
                        <MenuItem key={header} value={header}>
                          {header}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button onClick={() => setActiveStep(0)}>Back</Button>
              <Button
                variant="contained"
                onClick={() => setActiveStep(2)}
                disabled={!isMappingValid()}
              >
                Continue to Generation
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 3: Generate Labels */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Generate Labels
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Ready to generate {csvData.length} carton labels
            </Alert>

            {isGenerating && (
              <Box sx={{ mb: 3 }}>
                <LinearProgress variant="determinate" value={progress} />
                <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                  Generating labels... {Math.round(progress)}%
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button onClick={() => setActiveStep(1)} disabled={isGenerating}>
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleGenerateLabels}
                disabled={isGenerating}
                startIcon={<PreviewIcon />}
              >
                Generate All Labels
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 4: Download PDFs */}
        {activeStep === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Download Labels
            </Typography>
            <Alert severity="success" sx={{ mb: 3 }}>
              Successfully generated {generatedLabels.filter((l) => l.status === 'success').length} labels
            </Alert>

            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleDownloadPDFs}
              sx={{ mb: 3 }}
              size="large"
            >
              Download All as PDF
            </Button>

            <Grid container spacing={2}>
              {generatedLabels.map((label) => (
                <Grid item xs={12} sm={6} md={4} key={label.index}>
                  <Card>
                    <CardContent>
                      {label.status === 'success' ? (
                        <>
                          <Box
                            component="img"
                            src={label.dataUrl}
                            alt={label.productName}
                            sx={{ width: '100%', height: 'auto', mb: 1 }}
                          />
                          <Typography variant="subtitle2" gutterBottom>
                            {label.productName}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <CheckCircle color="success" fontSize="small" />
                            <Typography variant="caption" color="success.main">
                              Generated
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadSingle(label)}
                              sx={{ ml: 'auto' }}
                            >
                              <Download fontSize="small" />
                            </IconButton>
                          </Box>
                        </>
                      ) : (
                        <>
                          <Typography variant="subtitle2" gutterBottom color="error">
                            {label.productName}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <ErrorIcon color="error" fontSize="small" />
                            <Typography variant="caption" color="error">
                              {label.error}
                            </Typography>
                          </Box>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Button
                onClick={() => {
                  setActiveStep(0);
                  setCSVData([]);
                  setGeneratedLabels([]);
                  setColumnMapping({
                    productName: '',
                    productCode: '',
                    gs1BarcodeNumber: '',
                    powerInput: '',
                    temperatureRating: '',
                    ipRating: '',
                    classRating: '',
                    frequency: '',
                    cctValue: '',
                    madeIn: '',
                  });
                }}
              >
                Start New Batch
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Hidden canvas for label generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Box>
  );
};

export default BatchLabelGenerationPage;
