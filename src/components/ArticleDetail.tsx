import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  IconButton,
  Button,
  Divider,
  Link,
  CardActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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

// Props pour le composant de détail
interface ArticleDetailProps {
  article: Article;
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
  onBack: () => void;
}

const ArticleDetail = ({
  article,
  onEdit,
  onDelete,
  onBack,
}: ArticleDetailProps) => {
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Composant pour afficher une liste de valeurs
  const ListSection = ({
    title,
    items,
  }: {
    title: string;
    items: string[];
  }) => (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="subtitle1"
        color="primary"
        fontWeight="bold"
        gutterBottom
      >
        {title}
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {items.map((item, index) => (
          <Chip
            key={index}
            label={item}
            size="small"
            variant="outlined"
            color="primary"
            sx={{ m: "2px" }}
          />
        ))}
      </Stack>
    </Box>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <Card
        elevation={3}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          position: "relative",
          maxWidth: "100%",
          width: "100%",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardContent sx={{ pb: 1, flexGrow: 1, overflowY: "auto" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
            }}
          >
            <IconButton
              color="primary"
              sx={{ mr: 1 }}
              onClick={onBack}
              size="small"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography
              variant="h5"
              component="h2"
              fontWeight="bold"
              sx={{
                flexGrow: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              Article #{article.id}
            </Typography>
          </Box>

          {article.title && (
            <Typography
              variant="h6"
              color="text.primary"
              gutterBottom
              sx={{ mb: 2 }}
            >
              {article.title}
            </Typography>
          )}

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" color="primary" fontWeight="bold">
              Auteurs
            </Typography>
            <Typography variant="body1">{article.authors}</Typography>
          </Box>

          {article.doi && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" color="primary" fontWeight="bold">
                DOI
              </Typography>
              <Link
                href={`https://doi.org/${article.doi}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {article.doi}
              </Link>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <ListSection title="Mots-clés" items={article.keywords} />
          <ListSection title="Modèles" items={article.models} />
          <ListSection title="Techniques" items={article.techniques} />

          <Box sx={{ mb: 2 }}>
            <Typography
              variant="subtitle1"
              color="primary"
              fontWeight="bold"
              gutterBottom
            >
              Résultats
            </Typography>
            <ul style={{ paddingLeft: "20px", margin: "8px 0" }}>
              {article.results.map((result, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Typography variant="body2">{result}</Typography>
                </motion.li>
              ))}
            </ul>
          </Box>

          {article.notes && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle1"
                color="primary"
                fontWeight="bold"
                gutterBottom
              >
                Notes
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: "pre-wrap",
                  px: 1.5,
                  py: 1,
                  backgroundColor: "grey.50",
                  borderRadius: 1,
                }}
              >
                {article.notes}
              </Typography>
            </Box>
          )}
        </CardContent>

        <CardActions
          sx={{ display: "flex", justifyContent: "flex-end", px: 2, py: 1.5 }}
        >
          {deleteConfirm ? (
            <>
              <Typography variant="body2" color="error" sx={{ mr: 2 }}>
                Confirmer la suppression ?
              </Typography>
              <Button
                size="small"
                color="inherit"
                onClick={() => setDeleteConfirm(false)}
              >
                Annuler
              </Button>
              <Button
                size="small"
                color="error"
                variant="contained"
                onClick={() => {
                  onDelete(article);
                  setDeleteConfirm(false);
                }}
              >
                Supprimer
              </Button>
            </>
          ) : (
            <>
              <IconButton
                color="primary"
                onClick={() => onEdit(article)}
                size="small"
              >
                <EditIcon />
              </IconButton>
              <IconButton
                color="error"
                onClick={() => setDeleteConfirm(true)}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </>
          )}
        </CardActions>
      </Card>
    </motion.div>
  );
};

export default ArticleDetail;
