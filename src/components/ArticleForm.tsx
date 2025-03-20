import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  OutlinedInput,
  FormHelperText,
  Alert,
  CircularProgress,
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

// Props pour le composant de formulaire
interface ArticleFormProps {
  open: boolean;
  onClose: () => void;
  article?: Article;
  onSave: (article: Article | Omit<Article, "id">) => Promise<void>;
  isEditing: boolean;
}

// Composant pour gérer les champs de type tableau
const ArrayInput = ({
  label,
  value,
  onChange,
  error,
  helperText,
}: {
  label: string;
  value: string[];
  onChange: (newValue: string[]) => void;
  error?: boolean;
  helperText?: string;
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && inputValue.trim()) {
      event.preventDefault();
      onChange([...value, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleDelete = (itemToDelete: string) => {
    onChange(value.filter((item) => item !== itemToDelete));
  };

  return (
    <FormControl fullWidth margin="normal" error={error}>
      <InputLabel>{label}</InputLabel>
      <OutlinedInput
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        label={label}
        placeholder={`Ajoutez et appuyez sur Entrée`}
        fullWidth
      />
      {value.length > 0 && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ mt: 1 }}
          flexWrap="wrap"
          useFlexGap
        >
          {value.map((item, index) => (
            <Chip
              key={index}
              label={item}
              onDelete={() => handleDelete(item)}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ margin: "2px" }}
            />
          ))}
        </Stack>
      )}
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

// Valeurs initiales pour le formulaire
const defaultArticle: Omit<Article, "id"> = {
  authors: "",
  keywords: [],
  models: [],
  techniques: [],
  results: [],
};

const ArticleForm = ({
  open,
  onClose,
  article,
  onSave,
  isEditing,
}: ArticleFormProps) => {
  const [formData, setFormData] = useState<Omit<Article, "id"> | Article>(
    article || defaultArticle
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Mettre à jour le formulaire quand l'article change
  useEffect(() => {
    if (article) {
      setFormData(article);
    } else {
      setFormData(defaultArticle);
    }
  }, [article]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Effacer l'erreur pour ce champ si elle existe
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleArrayChange = (field: keyof Article, newValue: string[]) => {
    setFormData((prev) => ({ ...prev, [field]: newValue }));

    // Effacer l'erreur pour ce champ si elle existe
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.authors) {
      newErrors.authors = "Le nom des auteurs est requis";
    }

    if (formData.keywords.length === 0) {
      newErrors.keywords = "Au moins un mot-clé est requis";
    }

    if (formData.models.length === 0) {
      newErrors.models = "Au moins un modèle est requis";
    }

    if (formData.techniques.length === 0) {
      newErrors.techniques = "Au moins une technique est requise";
    }

    if (formData.results.length === 0) {
      newErrors.results = "Au moins un résultat est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      setSubmitError(
        "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer."
      );
      console.error("Erreur lors de l'enregistrement:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        style: {
          borderRadius: "12px",
        },
        component: Box,
        sx: {
          overflow: "hidden",
        },
      }}
    >
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <DialogTitle>
          {isEditing ? "Modifier l'article" : "Ajouter un nouvel article"}
        </DialogTitle>

        <DialogContent>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            {submitError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {submitError}
              </Alert>
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              label="Auteurs"
              name="authors"
              value={formData.authors}
              onChange={handleChange}
              error={!!errors.authors}
              helperText={errors.authors}
            />

            <TextField
              margin="normal"
              fullWidth
              label="Titre"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
            />

            <TextField
              margin="normal"
              fullWidth
              label="DOI"
              name="doi"
              value={formData.doi || ""}
              onChange={handleChange}
            />

            <ArrayInput
              label="Mots-clés"
              value={formData.keywords}
              onChange={(newValue) => handleArrayChange("keywords", newValue)}
              error={!!errors.keywords}
              helperText={errors.keywords}
            />

            <ArrayInput
              label="Modèles"
              value={formData.models}
              onChange={(newValue) => handleArrayChange("models", newValue)}
              error={!!errors.models}
              helperText={errors.models}
            />

            <ArrayInput
              label="Techniques"
              value={formData.techniques}
              onChange={(newValue) => handleArrayChange("techniques", newValue)}
              error={!!errors.techniques}
              helperText={errors.techniques}
            />

            <ArrayInput
              label="Résultats"
              value={formData.results}
              onChange={(newValue) => handleArrayChange("results", newValue)}
              error={!!errors.results}
              helperText={errors.results}
            />

            <TextField
              margin="normal"
              fullWidth
              label="Notes"
              name="notes"
              value={formData.notes || ""}
              onChange={handleChange}
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default ArticleForm;
