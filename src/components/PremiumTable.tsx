import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Stack,
  Chip,
} from '@mui/material';
import { getStatusColor, getStatusBackgroundColor } from '../utils/formatters';

interface PremiumTableColumn {
  label: string;
  key: string;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
  type?: 'status' | 'currency' | 'date' | 'text' | 'number';
}

interface PremiumTableProps {
  columns: PremiumTableColumn[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  dense?: boolean;
}

const PremiumTable: React.FC<PremiumTableProps> = ({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
  dense = false,
}) => {
  const renderCell = (column: PremiumTableColumn, row: any): React.ReactNode => {
    const value = row[column.key];

    if (column.render) {
      return column.render(value, row);
    }

    if (column.type === 'status') {
      return (
        <Chip
          label={value}
          size="small"
          color={getStatusColor(value)}
          variant="filled"
          sx={{
            backgroundColor: getStatusBackgroundColor(value),
            fontWeight: 600,
          }}
        />
      );
    }

    if (column.type === 'currency') {
      return `$${parseFloat(value || 0).toFixed(2)}`;
    }

    if (column.type === 'date') {
      return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }

    return value;
  };

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid rgba(17, 24, 39, 0.08)',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Table size={dense ? 'small' : 'medium'}>
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: 'rgba(17, 24, 39, 0.02)',
              borderBottom: '2px solid rgba(17, 24, 39, 0.1)',
              '& th': {
                fontWeight: 700,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: 'text.secondary',
              },
            }}
          >
            {columns.map((column) => (
              <TableCell key={column.key} width={column.width} align="left">
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                <Stack alignItems="center" spacing={1.5}>
                  <CircularProgress size={32} />
                  <Typography variant="body2" color="text.secondary">
                    Loading data...
                  </Typography>
                </Stack>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                <Stack alignItems="center" spacing={1}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {emptyMessage}
                  </Typography>
                </Stack>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, idx) => (
              <TableRow
                key={idx}
                sx={{
                  '&:nth-of-type(odd)': {
                    backgroundColor: 'rgba(17, 24, 39, 0.01)',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(17, 24, 39, 0.03)',
                  },
                  borderBottom: '1px solid rgba(17, 24, 39, 0.06)',
                  '&:last-child': {
                    borderBottom: 'none',
                  },
                }}
              >
                {columns.map((column) => (
                  <TableCell
                    key={`${idx}-${column.key}`}
                    sx={{
                      py: dense ? 1 : 1.5,
                      color: 'text.primary',
                      fontWeight: 500,
                    }}
                  >
                    {renderCell(column, row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PremiumTable;
