import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { productService, CSVImportResult } from '@/services/product.service';

export default function ProductImportPage() {
  const navigate = useNavigate();
  const csvInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CSVImportResult | null>(null);

  const handleCSVSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('CSV file must be less than 10MB');
      return;
    }

    setCsvFile(file);
    setError(null);
    setResult(null);
  };

  const handleImagesSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith('image/');
      const isUnder5MB = file.size <= 5 * 1024 * 1024;
      return isImage && isUnder5MB;
    });

    if (validFiles.length !== files.length) {
      setError('Some files were skipped (only images under 5MB are allowed)');
    }

    setImageFiles(validFiles);
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImport = async () => {
    if (!csvFile) {
      setError('Please select a CSV file');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const importResult = await productService.importCSV(csvFile, imageFiles);
      setResult(importResult);

      if (importResult.summary.failed === 0) {
        setTimeout(() => {
          navigate('/products');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to import products. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setCsvFile(null);
    setImageFiles([]);
    setResult(null);
    setError(null);
    if (csvInputRef.current) csvInputRef.current.value = '';
    if (imagesInputRef.current) imagesInputRef.current.value = '';
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Import Products from CSV
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload a CSV file with product data and optional product images. Products will be added to the database.
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>CSV Format:</strong> Your CSV should include columns: Product Code, Description (or Product Name), and GS1 Barcode Number.
        <br />
        <strong>Images:</strong> Name image files with the product code (e.g., PROD123.jpg) for automatic matching.
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {result && (
        <Alert
          severity={result.summary.failed === 0 ? 'success' : 'warning'}
          sx={{ mb: 3 }}
          icon={result.summary.failed === 0 ? <SuccessIcon /> : <InfoIcon />}
        >
          <Typography variant="body2" gutterBottom>
            <strong>Import Complete:</strong>
          </Typography>
          <Typography variant="body2">
            - {result.summary.successful} products imported successfully
            {result.summary.failed > 0 && ` - ${result.summary.failed} errors`}
            {result.summary.imagesUploaded > 0 && ` - ${result.summary.imagesUploaded} images uploaded`}
          </Typography>
          {result.summary.failed === 0 && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Redirecting to Products page...
            </Typography>
          )}
        </Alert>
      )}

      {result && result.errors.length > 0 && (
        <Card sx={{ mb: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <ErrorIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Import Errors ({result.errors.length})
            </Typography>
            <List dense>
              {result.errors.slice(0, 10).map((err, idx) => (
                <ListItem key={idx}>
                  <ListItemText
                    primary={`Row ${err.index + 1}: ${err.error}`}
                  />
                </ListItem>
              ))}
              {result.errors.length > 10 && (
                <ListItem>
                  <ListItemText primary={`... and ${result.errors.length - 10} more errors`} />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            1. Select CSV File
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleCSVSelect}
            />
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => csvInputRef.current?.click()}
              disabled={isUploading}
            >
              Choose CSV File
            </Button>
            {csvFile && (
              <Chip
                label={csvFile.name}
                onDelete={() => setCsvFile(null)}
                color="primary"
              />
            )}
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            2. Select Product Images (Optional)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload product images. File names should match product codes for automatic association.
          </Typography>
          <Box sx={{ mb: 2 }}>
            <input
              ref={imagesInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleImagesSelect}
            />
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => imagesInputRef.current?.click()}
              disabled={isUploading}
            >
              Choose Images
            </Button>
          </Box>
          {imageFiles.length > 0 && (
            <List dense>
              {imageFiles.map((file, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveImage(index)}
                      disabled={isUploading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={file.name}
                    secondary={`${(file.size / 1024).toFixed(2)} KB`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            3. Import Products
          </Typography>
          {isUploading && <LinearProgress sx={{ mb: 2 }} />}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleImport}
              disabled={!csvFile || isUploading}
              size="large"
            >
              {isUploading ? 'Importing...' : 'Import Products'}
            </Button>
            <Button
              variant="outlined"
              onClick={handleReset}
              disabled={isUploading}
            >
              Reset
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
