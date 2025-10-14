import { Box, Container, Typography, Paper, Grid } from '@mui/material';

export const DashboardPage = () => {
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Welcome Card */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Welcome to Label Creation Tool
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              This is the Label Creation Tool dashboard. Use the navigation menu to create labels, manage products, and configure templates.
            </Typography>
          </Paper>
        </Grid>

        {/* Statistics Cards - Note: Live metrics will be added in future release */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" color="text.secondary">
              Total Products
            </Typography>
            <Typography variant="h3">-</Typography>
            <Typography variant="caption" color="text.secondary">
              Metrics coming soon
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" color="text.secondary">
              Active Labels
            </Typography>
            <Typography variant="h3">-</Typography>
            <Typography variant="caption" color="text.secondary">
              Metrics coming soon
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" color="text.secondary">
              Pending Approvals
            </Typography>
            <Typography variant="h3">-</Typography>
            <Typography variant="caption" color="text.secondary">
              Metrics coming soon
            </Typography>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                • Create new product
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Generate label
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Import from CSV
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • View pending approvals
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};
