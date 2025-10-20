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
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  ToggleOn as ActiveIcon,
  ToggleOff as InactiveIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '@/store';
import {
  fetchTemplates,
  toggleTemplateActive,
  deleteTemplate,
  setPage,
  setLimit,
} from '@/store/templatesSlice';
import { TemplateType } from '@/types';

const templateTypeLabels: Record<TemplateType, string> = {
  [TemplateType.STANDARD]: 'Standard',
  [TemplateType.CCT_SELECTABLE]: 'CCT Selectable',
  [TemplateType.POWER_SELECTABLE]: 'Power Selectable',
  [TemplateType.EMERGENCY]: 'Emergency',
};

const templateTypeColors: Record<TemplateType, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  [TemplateType.STANDARD]: 'default',
  [TemplateType.CCT_SELECTABLE]: 'info',
  [TemplateType.POWER_SELECTABLE]: 'primary',
  [TemplateType.EMERGENCY]: 'error',
};

export default function TemplatesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { templates, total, page, limit, isLoading } = useSelector(
    (state: RootState) => state.templates
  );

  const [typeFilter, setTypeFilter] = useState<TemplateType | ''>('');
  const [activeFilter, setActiveFilter] = useState<string>('');

  useEffect(() => {
    loadTemplates();
  }, [page, limit, typeFilter, activeFilter]);

  const loadTemplates = () => {
    const filters: any = { page, limit };
    if (typeFilter) filters.type = typeFilter;
    if (activeFilter) filters.isActive = activeFilter === 'true';
    dispatch(fetchTemplates(filters));
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    dispatch(setPage(newPage + 1));
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setLimit(parseInt(event.target.value, 10)));
    dispatch(setPage(1));
  };

  const handleToggleActive = async (id: string) => {
    await dispatch(toggleTemplateActive(id));
    loadTemplates();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      await dispatch(deleteTemplate(id));
      loadTemplates();
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Label Templates
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/templates/create')}
        >
          Create Template
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select
              label="Type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TemplateType | '')}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value={TemplateType.STANDARD}>Standard</MenuItem>
              <MenuItem value={TemplateType.CCT_SELECTABLE}>CCT Selectable</MenuItem>
              <MenuItem value={TemplateType.POWER_SELECTABLE}>Power Selectable</MenuItem>
              <MenuItem value={TemplateType.EMERGENCY}>Emergency</MenuItem>
            </TextField>
            <TextField
              select
              label="Status"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </TextField>
            <Box sx={{ flexGrow: 1 }} />
            <Tooltip title="Refresh">
              <IconButton onClick={loadTemplates}>
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
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Dimensions</TableCell>
                <TableCell>Elements</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
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
              ) : templates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No templates found
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((template) => (
                  <TableRow key={template.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {template.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={templateTypeLabels[template.type]}
                        color={templateTypeColors[template.type]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {template.templateData.width} × {template.templateData.height}mm
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {template.templateData.elements.length} element{template.templateData.elements.length !== 1 ? 's' : ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={template.isActive ? 'Active' : 'Inactive'}
                        color={template.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(template.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View">
                        <IconButton size="small" disabled>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" disabled>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={template.isActive ? 'Deactivate' : 'Activate'}>
                        <IconButton
                          size="small"
                          color={template.isActive ? 'success' : 'default'}
                          onClick={() => handleToggleActive(template.id)}
                        >
                          {template.isActive ? <ActiveIcon /> : <InactiveIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(template.id)}
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
    </Box>
  );
}
