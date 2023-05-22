/* eslint-disable */
// @ts-nocheck
const GRID_DEFAULT_LOCALE_TEXT = {
    // Raíz
    noRowsLabel: 'Sin filas',
    noResultsOverlayLabel: 'No se encontraron resultados.',

    // Texto del botón de selección de densidad
    toolbarDensity: 'Densidad',
    toolbarDensityLabel: 'Densidad',
    toolbarDensityCompact: 'Compacto',
    toolbarDensityStandard: 'Estándar',
    toolbarDensityComfortable: 'Cómodo',

    // Texto del botón de selección de columnas
    toolbarColumns: 'Columnas',
    toolbarColumnsLabel: 'Seleccionar columnas',

    // Texto del botón de filtros
    toolbarFilters: 'Filtros',
    toolbarFiltersLabel: 'Mostrar filtros',
    toolbarFiltersTooltipHide: 'Ocultar filtros',
    toolbarFiltersTooltipShow: 'Mostrar filtros',
    toolbarFiltersTooltipActive: (count) => (count !== 1 ? `${count} filtros activos` : `${count} filtro activo`),

    // Campo de filtro rápido en la barra de herramientas
    toolbarQuickFilterPlaceholder: 'Buscar...',
    toolbarQuickFilterLabel: 'Buscar',
    toolbarQuickFilterDeleteIconLabel: 'Borrar',

    // Texto del botón de exportación
    toolbarExport: 'Exportar',
    toolbarExportLabel: 'Exportar',
    toolbarExportCSV: 'Descargar como CSV',
    toolbarExportPrint: 'Imprimir',
    toolbarExportExcel: 'Descargar como Excel',

    // Texto del panel de columnas
    columnsPanelTextFieldLabel: 'Buscar columna',
    columnsPanelTextFieldPlaceholder: 'Título de la columna',
    columnsPanelDragIconLabel: 'Reordenar columna',
    columnsPanelShowAllButton: 'Mostrar todo',
    columnsPanelHideAllButton: 'Ocultar todo',

    // Texto del panel de filtros
    filterPanelAddFilter: 'Agregar filtro',
    filterPanelRemoveAll: 'Eliminar todos',
    filterPanelDeleteIconLabel: 'Eliminar',
    filterPanelLogicOperator: 'Operador lógico',
    filterPanelOperator: 'Operador',
    filterPanelOperatorAnd: 'Y',
    filterPanelOperatorOr: 'O',
    filterPanelColumns: 'Columnas',
    filterPanelInputLabel: 'Valor',
    filterPanelInputPlaceholder: 'Valor del filtro',

    // Texto de los operadores de filtro
    filterOperatorContains: 'contiene',
    filterOperatorEquals: 'es igual a',
    filterOperatorStartsWith: 'comienza con',
    filterOperatorEndsWith: 'termina con',
    filterOperatorIs: 'es',
    filterOperatorNot: 'no es',
    filterOperatorAfter: 'es posterior a',
    filterOperatorOnOrAfter: 'es en o después de',
    filterOperatorBefore: 'es anterior a',
    filterOperatorOnOrBefore: 'es en o antes de',
    filterOperatorIsEmpty: 'está vacío',
    filterOperatorIsNotEmpty: 'no está vacío',
    filterOperatorIsAnyOf: 'es cualquiera de',

    // Texto de los valores de filtro
    filterValueAny: 'cualquiera',
    filterValueTrue: 'verdadero',
    filterValueFalse: 'falso',

    // Texto del menú de columna
    columnMenuLabel: 'Menú',
    columnMenuShowColumns: 'Mostrar columnas',
    columnMenuManageColumns: 'Administrar columnas',
    columnMenuFilter: 'Filtrar',
    columnMenuHideColumn: 'Ocultar columna',
    columnMenuUnsort: 'Desordenar',
    columnMenuSortAsc: 'Ordenar ascendente',
    columnMenuSortDesc: 'Ordenar descendente',

    // Texto de la cabecera de columna
    columnHeaderFiltersTooltipActive: (count) => (count !== 1 ? `${count} filtros activos` : `${count} filtro activo`),
    columnHeaderFiltersLabel: 'Mostrar filtros',
    columnHeaderSortIconLabel: 'Ordenar',

    // Texto del pie de página de filas seleccionadas
    footerRowSelected: (count) =>
        count !== 1 ? `${count.toLocaleString()} filas seleccionadas` : `${count.toLocaleString()} fila seleccionada`,

    // Texto del total de filas en el pie de página
    footerTotalRows: 'Total de filas:',

    // Texto del total de filas visibles en el pie de página
    footerTotalVisibleRows: (visibleCount, totalCount) =>
        `${visibleCount.toLocaleString()} de ${totalCount.toLocaleString()}`,

    // Texto de selección de casilla de verificación
    checkboxSelectionHeaderName: 'Selección de casilla de verificación',
    checkboxSelectionSelectAllRows: 'Seleccionar todas las filas',
    checkboxSelectionUnselectAllRows: 'Desmarcar todas las filas',
    checkboxSelectionSelectRow: 'Seleccionar fila',
    checkboxSelectionUnselectRow: 'Desmarcar fila',

    // Texto de celda booleana
    booleanCellTrueLabel: 'sí',
    booleanCellFalseLabel: 'no',

    // Texto de acciones adicionales en la celda
    actionsCellMore: 'más',

    // Texto de anclaje de columna
    pinToLeft: 'Anclar a la izquierda',
    pinToRight: 'Anclar a la derecha',
    unpin: 'Desanclar',

    // Datos de árbol
    treeDataGroupingHeaderName: 'Agrupar',
    treeDataExpand: 'ver hijos',
    treeDataCollapse: 'ocultar hijos',

    // Columnas de agrupamiento
    groupingColumnHeaderName: 'Agrupar',
    groupColumn: (name) => `Agrupar por ${name}`,
    unGroupColumn: (name) => `Detener agrupamiento por ${name}`,

    // Maestro/detalle
    detailPanelToggle: 'Alternar panel de detalles',
    expandDetailPanel: 'Expandir',
    collapseDetailPanel: 'Colapsar',

    // Teclas de traducción de componentes principales utilizados
    MuiTablePagination: {},

    // Texto de reordenamiento de filas
    rowReorderingHeaderName: 'Reordenamiento de filas',

    // Agregación
    aggregationMenuItemHeader: 'Agregación',
    aggregationFunctionLabelSum: 'suma',
    aggregationFunctionLabelAvg: 'promedio',
    aggregationFunctionLabelMin: 'mínimo',
    aggregationFunctionLabelMax: 'máximo',
    aggregationFunctionLabelSize: 'tamaño',
}
export default GRID_DEFAULT_LOCALE_TEXT
/* eslint-enable */
