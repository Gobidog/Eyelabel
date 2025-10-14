import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  MenuItem,
  Paper,
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
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '@/store';
import {
  fetchLabels,
  deleteLabel,
  setPage,
  setLimit,
} from '@/store/labelsSlice';
import { Label, LabelStatus, LabelType, UserRole } from '@/types';

const statusColors: Record<LabelStatus, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  [LabelStatus.DRAFT]: 'default',
  [LabelStatus.IN_DESIGN]: 'info',
  [LabelStatus.REVIEW]: 'warning',
  [LabelStatus.APPROVED]: 'success',
  [LabelStatus.SENT]: 'success',
};

const statusLabels: Record<LabelStatus, string> = {
  [LabelStatus.DRAFT]: 'Draft',
  [LabelStatus.IN_DESIGN]: 'In Design',
  [LabelStatus.REVIEW]: 'Review',
  [LabelStatus.APPROVED]: 'Approved',
  [LabelStatus.SENT]: 'Sent',
};

export default function LabelsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { labels, total, page, limit, isLoading } = useSelector(
    (state: RootState) => state.labels
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [statusFilter, setStatusFilter] = useState<LabelStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<LabelType | ''>('');

  useEffect(() => {
    loadLabels();
  }, [page, limit, statusFilter, typeFilter]);

  const loadLabels = () => {
    const filters: any = { page, limit };
    if (statusFilter) filters.status = statusFilter;
    if (typeFilter) filters.labelType = typeFilter;
    dispatch(fetchLabels(filters));
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    dispatch(setPage(newPage + 1));
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setLimit(parseInt(event.target.value, 10)));
    dispatch(setPage(1));
  };

  const handleDelete = async (id: string, label: Label) => {
    const isAdmin = user?.role === UserRole.ADMIN;
    const confirmMessage = isAdmin
      ? 'Are you sure you want to delete this label? (Admin override - can delete any status)'
      : 'Are you sure you want to delete this label? Only draft labels can be deleted.';

    if (window.confirm(confirmMessage)) {
      await dispatch(deleteLabel(id));
      loadLabels();
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Labels
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/labels/create')}
        >
          Create Label
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LabelStatus | '')}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value={LabelStatus.DRAFT}>Draft</MenuItem>
              <MenuItem value={LabelStatus.IN_DESIGN}>In Design</MenuItem>
              <MenuItem value={LabelStatus.REVIEW}>Review</MenuItem>
              <MenuItem value={LabelStatus.APPROVED}>Approved</MenuItem>
              <MenuItem value={LabelStatus.SENT}>Sent</MenuItem>
            </TextField>
            <TextField
              select
              label="Type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as LabelType | '')}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value={LabelType.PRODUCT}>Product</MenuItem>
              <MenuItem value={LabelType.CARTON}>Carton</MenuItem>
            </TextField>
            <Box sx={{ flexGrow: 1 }} />
            <Tooltip title="Refresh">
              <IconButton onClick={loadLabels}>
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
                <TableCell>Product</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : labels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No labels found
                  </TableCell>
                </TableRow>
              ) : (
                labels.map((label: Label) => (
                  <TableRow key={label.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {label.labelData?.fields?.productName || 'Unknown Product'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {label.labelData?.fields?.productCode || '-'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={label.labelType === LabelType.PRODUCT ? 'Product' : 'Carton'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusLabels[label.status as LabelStatus]}
                        color={statusColors[label.status as LabelStatus]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {label.createdBy ? `${label.createdBy.firstName} ${label.createdBy.lastName}` : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(label.createdAt).toLocaleDateString()}
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
                        {label.notes || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/labels/edit/${label.id}`)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/labels/edit/${label.id}`)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      {(label.status === LabelStatus.DRAFT || user?.role === UserRole.ADMIN) && (
                        <Tooltip title={user?.role === UserRole.ADMIN ? "Delete (Admin)" : "Delete"}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(label.id, label)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
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
    </Box>
  );
}
