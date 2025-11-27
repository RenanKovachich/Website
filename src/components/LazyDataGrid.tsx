import React, { memo } from 'react';
import { DataGrid, DataGridProps } from '@mui/x-data-grid';

const LazyDataGrid = memo<DataGridProps>((props) => {
  return (
    <DataGrid
      {...props}
      // Otimizações de performance
      disableRowSelectionOnClick
      disableColumnMenu
      disableColumnFilter
      disableColumnSelector
      disableDensitySelector
      hideFooterSelectedRowCount
      rowHeight={52}
      // Virtualização otimizada
      rowBufferPx={5}
      columnBufferPx={2}
      // Cache das linhas
      getRowId={(row) => row.id}
    />
  );
});

LazyDataGrid.displayName = 'LazyDataGrid';

export default LazyDataGrid;
