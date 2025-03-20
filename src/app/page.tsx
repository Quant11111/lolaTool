"use client";

import { useState } from "react";
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { motion, AnimatePresence } from "framer-motion";

import dynamic from "next/dynamic";

// Import dynamique des composants pour éviter les erreurs de pre-rendu côté serveur
const ArticleDataGrid = dynamic(() => import("@/components/ArticleDataGrid"), {
  ssr: false,
});
const ArticleDetail = dynamic(() => import("@/components/ArticleDetail"), {
  ssr: false,
});
const ArticleForm = dynamic(() => import("@/components/ArticleForm"), {
  ssr: false,
});

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

// Thème personnalisé
const theme = createTheme({
  palette: {
    primary: {
      main: "#2196f3",
    },
    secondary: {
      main: "#f50057",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

export default function Home() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Article | undefined>(
    undefined
  );

  // Gérer la sélection d'un article
  const handleRowSelect = (article: Article) => {
    setSelectedArticle(article);
  };

  // Gérer le retour à la liste
  const handleBackToList = () => {
    setSelectedArticle(null);
  };

  // Ouvrir le formulaire pour l'ajout
  const handleOpenAddForm = () => {
    setIsEditing(false);
    setCurrentArticle(undefined);
    setIsFormOpen(true);
  };

  // Ouvrir le formulaire pour l'édition
  const handleOpenEditForm = (article: Article) => {
    setIsEditing(true);
    setCurrentArticle(article);
    setIsFormOpen(true);
  };

  // Fermer le formulaire
  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  // Créer ou modifier un article
  const handleSaveArticle = async (
    articleData: Article | Omit<Article, "id">
  ) => {
    try {
      let response;

      if ("id" in articleData) {
        // Mise à jour d'un article existant
        response = await fetch("/api/data", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(articleData),
        });
      } else {
        // Création d'un nouvel article
        response = await fetch("/api/data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(articleData),
        });
      }

      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement de l'article");
      }

      // Forcer le rafraîchissement en retournant à la liste
      setSelectedArticle(null);

      // Fermer le formulaire
      setIsFormOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      throw error;
    }
  };

  // Supprimer un article
  const handleDeleteArticle = async (article: Article) => {
    try {
      const response = await fetch(`/api/data?id=${article.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de l'article");
      }

      // Retourner à la liste après la suppression
      setSelectedArticle(null);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <AppBar position="static" color="primary" elevation={0}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Gestion des Articles Scientifiques
            </Typography>
            <Button
              color="inherit"
              startIcon={<AddIcon />}
              onClick={handleOpenAddForm}
            >
              Nouvel Article
            </Button>
          </Toolbar>
        </AppBar>

        <Container
          maxWidth={false}
          sx={{
            mt: 2,
            mb: 2,
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 136px)", // Hauteur de l'écran moins la hauteur de l'AppBar et du footer
            px: { xs: 2, sm: 3, md: 4 }, // Padding horizontal responsive
            width: "100%",
          }}
        >
          <AnimatePresence mode="wait">
            {selectedArticle ? (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                style={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                }}
              >
                <ArticleDetail
                  article={selectedArticle}
                  onEdit={handleOpenEditForm}
                  onDelete={handleDeleteArticle}
                  onBack={handleBackToList}
                />
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                style={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                }}
              >
                <ArticleDataGrid onRowSelect={handleRowSelect} />
              </motion.div>
            )}
          </AnimatePresence>
        </Container>

        <Box
          component="footer"
          sx={{
            py: 2,
            px: 2,
            backgroundColor: theme.palette.primary.light,
            color: "white",
          }}
        >
          <Typography variant="body2" align="center">
            Interface CRUD pour Données Scientifiques
          </Typography>
        </Box>
      </Box>

      <ArticleForm
        open={isFormOpen}
        onClose={handleCloseForm}
        article={currentArticle}
        onSave={handleSaveArticle}
        isEditing={isEditing}
      />
    </ThemeProvider>
  );
}
