import { useState, useEffect } from "react";
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridFilterModel,
  GridSortModel,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Stack,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { motion } from "framer-motion";

// Interface pour les articles
interface Article {
  id: number;
  authors: string;
  doi?: string;
  title?: string;
  keywords: string[];
  models: string[];
  techniques: string[];
  results: string[];
  notes?: string;
}

// Props pour le composant
interface ArticleDataGridProps {
  onRowSelect: (article: Article) => void;
}

// Composant pour afficher les listes (keywords, models, etc.)
const ArrayDisplay = ({ values }: { values: string[] }) => (
  <Stack
    direction="row"
    spacing={0.5}
    flexWrap="wrap"
    useFlexGap
    sx={{
      py: 0.5,
      width: "100%",
    }}
  >
    {values.slice(0, 3).map((value, index) => (
      <Chip
        key={index}
        label={value}
        size="small"
        variant="outlined"
        sx={{
          margin: "2px",
          maxWidth: "100%",
          overflow: "hidden",
        }}
      />
    ))}
    {values.length > 3 && (
      <Tooltip title={values.slice(3).join(", ")}>
        <Chip
          label={`+${values.length - 3}`}
          size="small"
          color="primary"
          sx={{ margin: "2px" }}
        />
      </Tooltip>
    )}
  </Stack>
);

const ArticleDataGrid = ({ onRowSelect }: ArticleDataGridProps) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: "id",
      sort: "asc",
    },
  ]);

  // Récupérer les données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/data");
        const data = await response.json();
        setArticles(data.articles);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Définition des colonnes
  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 70,
      flex: 0.5,
      minWidth: 50,
    },
    {
      field: "authors",
      headerName: "Auteurs",
      width: 200,
      flex: 1,
      minWidth: 150,
    },
    {
      field: "title",
      headerName: "Titre",
      width: 300,
      flex: 2,
      minWidth: 200,
      renderCell: (
        params: GridRenderCellParams<Article, string | undefined>
      ) => (
        <Tooltip title={params.value || ""}>
          <Typography variant="body2" noWrap>
            {params.value}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: "doi",
      headerName: "DOI",
      width: 150,
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<Article, string | undefined>) =>
        params.value ? (
          <a
            href={`https://doi.org/${params.value}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {params.value}
          </a>
        ) : (
          <span>-</span>
        ),
    },
    {
      field: "keywords",
      headerName: "Mots-clés",
      width: 200,
      flex: 1.5,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <ArrayDisplay values={params.value || []} />
      ),
    },
    {
      field: "models",
      headerName: "Modèles",
      width: 200,
      flex: 1.5,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <ArrayDisplay values={params.value || []} />
      ),
    },
    {
      field: "techniques",
      headerName: "Techniques",
      width: 200,
      flex: 1.5,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <ArrayDisplay values={params.value || []} />
      ),
    },
  ];

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        height: "calc(100vh - 144px)",
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          flexGrow: 1,
          width: "100%",
          overflow: "hidden",
          borderRadius: 2,
          "& .MuiDataGrid-cell:focus": {
            outline: "none",
          },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <DataGrid
          rows={articles}
          columns={columns}
          density="compact"
          filterModel={filterModel}
          onFilterModelChange={setFilterModel}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          pagination
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          getRowHeight={() => "auto"}
          getEstimatedRowHeight={() => 80}
          disableRowSelectionOnClick
          columnVisibilityModel={{}}
          sx={{
            "& .MuiDataGrid-cell:hover": {
              color: "primary.main",
            },
            "& .MuiDataGrid-main": {
              width: "100%",
            },
            "& .MuiDataGrid-virtualScroller": {
              width: "100% !important",
            },
            "& .MuiDataGrid-footerContainer": {
              width: "100%",
            },
            "& .MuiDataGrid-columnHeaders": {
              width: "100% !important",
            },
            "& .MuiDataGrid-cell": {
              py: 1.5, // Augmenter le padding vertical
              display: "flex",
              alignItems: "flex-start", // Aligner au début pour mieux gérer le contenu multiligne
              whiteSpace: "normal", // Permettre le retour à la ligne
              lineHeight: 1.5,
            },
            "& .MuiDataGrid-row": {
              minHeight: "60px !important", // Hauteur minimale des lignes
              alignItems: "stretch", // Pour que toutes les cellules s'étirent
            },
            "& .MuiDataGrid-cellContent": {
              whiteSpace: "normal", // Permettre le retour à la ligne du contenu
              lineHeight: 1.5,
            },
            borderRadius: 2,
            flex: 1,
            boxSizing: "border-box",
            width: "100%",
          }}
          onRowClick={(params) => onRowSelect(params.row as Article)}
        />
      </Paper>
    </motion.div>
  );
};

export default ArticleDataGrid;
