import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Upload as UploadIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Label as LabelIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { RootState, AppDispatch } from '@/store';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkCreateProducts,
  clearError,
  setPage,
  setLimit,
} from '@/store/productsSlice';
import { CreateProductData, UpdateProductData } from '@/services/product.service';
import { Product } from '@/types';

export default function ProductsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { products, total, page, limit, isLoading, error } = useSelector(
    (state: RootState) => state.products
  );

  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<CreateProductData>({
    gs1BarcodeNumber: '',
    productCode: '',
    productName: '',
    description: '',
  });

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadResults, setUploadResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, [page, limit]);

  const loadProducts = () => {
    dispatch(fetchProducts({ search, page, limit }));
  };

  const handleSearch = () => {
    dispatch(setPage(1));
    loadProducts();
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    dispatch(setPage(newPage + 1));
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setLimit(parseInt(event.target.value, 10)));
    dispatch(setPage(1));
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        gs1BarcodeNumber: product.gs1BarcodeNumber,
        productCode: product.productCode,
        productName: product.productName,
        description: product.description || '',
        metadata: product.metadata,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        gs1BarcodeNumber: '',
        productCode: '',
        productName: '',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
    setFormData({
      gs1BarcodeNumber: '',
      productCode: '',
      productName: '',
      description: '',
    });
    dispatch(clearError());
  };

  const handleSubmit = async () => {
    let action;

    if (editingProduct) {
      const updateData: UpdateProductData = {
        productCode: formData.productCode,
        productName: formData.productName,
        description: formData.description,
        metadata: formData.metadata,
      };
      action = await dispatch(updateProduct({ id: editingProduct.id, data: updateData }));
    } else {
      action = await dispatch(createProduct(formData));
    }

    if (createProduct.fulfilled.match(action) || updateProduct.fulfilled.match(action)) {
      handleCloseDialog();
      loadProducts();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const action = await dispatch(deleteProduct(id));

      if (deleteProduct.rejected.match(action)) {
        // Show error message to user
        const errorMsg = action.payload as string;
        if (errorMsg.toLowerCase().includes('label')) {
          setDeleteError('Cannot delete this product because it has associated labels. Please delete the labels first from the Labels page, then try again.');
        } else {
          setDeleteError(errorMsg || 'Failed to delete product');
        }
      } else {
        loadProducts();
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setUploadResults(null);
    }
  };

  const handleUploadCSV = () => {
    if (!uploadFile) return;

    const isExcel = uploadFile.name.endsWith('.xlsx') || uploadFile.name.endsWith('.xls');

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

          if (jsonData.length < 2) {
            setUploadResults({ success: 0, failed: 0, errors: ['Excel file is empty'] });
            return;
          }

          const products: CreateProductData[] = jsonData.slice(1).map((row: any) => ({
            gs1BarcodeNumber: row[0] || '',
            productName: row[1] || '',
            productCode: row[2] || '',
            barcodeImageUrl: row[3] || undefined,
            datePrepared: row[4] ? new Date(row[4]) : undefined,
            cartonLabelInfo: row[5] || undefined,
            productLabelInfo: row[6] || undefined,
            remoteLabelRequired: row[7] === 'Yes' || row[7] === 'yes' || row[7] === true,
            productImageUrl: row[8] || undefined,
            status: row[9] || 'Active',
            description: row[1] || '',
          })).filter(p => p.gs1BarcodeNumber && p.productCode && p.productName);

          if (products.length === 0) {
            setUploadResults({ success: 0, failed: 0, errors: ['No valid products found in Excel file'] });
            return;
          }

          const action = await dispatch(bulkCreateProducts(products));

          if (bulkCreateProducts.fulfilled.match(action)) {
            const { created, errors } = action.payload;
            setUploadResults({
              success: created.length,
              failed: errors.length,
              errors: errors.map((item) => `Row ${item.index + 2}: ${item.error}`),
            });
            loadProducts();
          } else {
            setUploadResults({
              success: 0,
              failed: products.length,
              errors: [action.error?.message || 'Upload failed'],
            });
          }
        } catch (error: any) {
          setUploadResults({
            success: 0,
            failed: 0,
            errors: [`Excel parsing error: ${error.message}`],
          });
        }
      };
      reader.readAsBinaryString(uploadFile);
    } else {
      Papa.parse(uploadFile, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const products: CreateProductData[] = results.data.map((row: any) => ({
            gs1BarcodeNumber: row.gs1BarcodeNumber || row.barcode || '',
            productCode: row.productCode || row.code || '',
            productName: row.productName || row.name || '',
            description: row.description || '',
          })).filter(p => p.gs1BarcodeNumber && p.productCode && p.productName);

          if (products.length === 0) {
            setUploadResults({ success: 0, failed: 0, errors: ['No valid products found in CSV'] });
            return;
          }

          const action = await dispatch(bulkCreateProducts(products));

          if (bulkCreateProducts.fulfilled.match(action)) {
            const { created, errors } = action.payload;
            setUploadResults({
              success: created.length,
              failed: errors.length,
              errors: errors.map((item) => `Row ${item.index + 1}: ${item.error}`),
            });
            loadProducts();
          } else {
            setUploadResults({
              success: 0,
              failed: products.length,
              errors: [action.error?.message || 'Upload failed'],
            });
          }
        },
        error: (error) => {
          setUploadResults({
            success: 0,
            failed: 0,
            errors: [`CSV parsing error: ${error.message}`],
          });
        },
      });
    }
  };

  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
    setUploadFile(null);
    setUploadResults(null);
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Products
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={() => navigate('/products/import')}
          >
            Import CSV with Images
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => setUploadDialogOpen(true)}
          >
            Quick Upload
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by name, code, or barcode"
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{ minWidth: 100 }}
            >
              Search
            </Button>
            <Tooltip title="Refresh">
              <IconButton onClick={loadProducts}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product Code</TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell>GS1 Barcode</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id} hover>
                    <TableCell>
                      <Chip label={product.productCode} size="small" />
                    </TableCell>
                    <TableCell>{product.productName}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {product.gs1BarcodeNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {product.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(product.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Generate Label">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/labels/create?productId=${product.id}`)}
                          color="primary"
                        >
                          <LabelIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(product)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(product.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page - 1}
          onPageChange={handlePageChange}
          rowsPerPage={limit}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="GS1 Barcode Number"
              value={formData.gs1BarcodeNumber}
              onChange={(e) =>
                setFormData({ ...formData, gs1BarcodeNumber: e.target.value })
              }
              required
              disabled={!!editingProduct}
              helperText={editingProduct ? 'Barcode cannot be changed' : 'Format: 9300001234567'}
            />
            <TextField
              label="Product Code"
              value={formData.productCode}
              onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
              required
              helperText="Internal product code (e.g., DL-150-WH)"
            />
            <TextField
              label="Product Name"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
            />
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              !formData.gs1BarcodeNumber ||
              !formData.productCode ||
              !formData.productName ||
              isLoading
            }
          >
            {editingProduct ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Spreadsheet Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={handleCloseUploadDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Products from Spreadsheet</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Excel format: Column A = GS1 Barcode, B = Description, C = Product Code, D = Barcode Image, E = Date, F = Carton Label, G = Product Label, H = Remote Label (Yes/No), I = Product Image, J = Status
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Or CSV format with headers: gs1BarcodeNumber, productCode, productName, description
            </Typography>
            <Button variant="outlined" component="label" fullWidth>
              {uploadFile ? uploadFile.name : 'Choose Excel or CSV File'}
              <input type="file" accept=".xlsx,.xls,.csv" hidden onChange={handleFileChange} />
            </Button>

            {uploadResults && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="success.main">
                  ✓ Successfully imported: {uploadResults.success}
                </Typography>
                {uploadResults.failed > 0 && (
                  <Typography variant="body2" color="error.main">
                    ✗ Failed: {uploadResults.failed}
                  </Typography>
                )}
                {uploadResults.errors.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="error.main">Errors:</Typography>
                    {uploadResults.errors.slice(0, 5).map((err, i) => (
                      <Typography key={i} variant="caption" color="error.main" sx={{ display: 'block' }}>
                        • {err}
                      </Typography>
                    ))}
                    {uploadResults.errors.length > 5 && (
                      <Typography variant="caption" color="text.secondary">
                        ... and {uploadResults.errors.length - 5} more errors
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadDialog}>
            {uploadResults ? 'Close' : 'Cancel'}
          </Button>
          {!uploadResults && (
            <Button
              onClick={handleUploadCSV}
              variant="contained"
              disabled={!uploadFile || isLoading}
            >
              Upload
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Error Snackbar */}
      <Snackbar
        open={!!deleteError}
        autoHideDuration={10000}
        onClose={() => setDeleteError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setDeleteError(null)}
          severity="error"
          variant="filled"
          sx={{ width: '100%', maxWidth: 600 }}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={() => setDeleteError(null)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          <Typography variant="body2" fontWeight="bold">
            Cannot Delete Product
          </Typography>
          <Typography variant="body2">
            {deleteError}
          </Typography>
        </Alert>
      </Snackbar>
    </Box>
  );
}
