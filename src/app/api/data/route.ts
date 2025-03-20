import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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

interface DataFile {
  articles: Article[];
}

const DATA_FILE_PATH = path.join(process.cwd(), "public", "data.json");

// Fonction utilitaire pour lire le fichier data.json
function readDataFile(): DataFile {
  try {
    const fileContent = fs.readFileSync(DATA_FILE_PATH, "utf8");
    return JSON.parse(fileContent) as DataFile;
  } catch (error) {
    console.error("Erreur lors de la lecture du fichier data.json:", error);
    return { articles: [] };
  }
}

// Fonction utilitaire pour écrire dans le fichier data.json
function writeDataFile(data: DataFile): boolean {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error(
      "Erreur lors de l'écriture dans le fichier data.json:",
      error
    );
    return false;
  }
}

// GET - Récupérer tous les articles
export async function GET() {
  const data = readDataFile();
  return NextResponse.json(data);
}

// POST - Créer un nouvel article
export async function POST(request: Request) {
  try {
    const data = readDataFile();
    const newArticle = (await request.json()) as Partial<Article>;

    // Générer un nouvel ID (utiliser le plus grand ID existant + 1)
    const maxId = data.articles.reduce(
      (max: number, article: Article) => (article.id > max ? article.id : max),
      0
    );
    newArticle.id = maxId + 1;

    // Ajouter le nouvel article
    data.articles.push(newArticle as Article);

    // Enregistrer les modifications
    const success = writeDataFile(data);

    if (success) {
      return NextResponse.json({ success: true, article: newArticle });
    } else {
      return NextResponse.json(
        { success: false, message: "Échec de l'écriture du fichier" },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("Erreur lors de la création d'un article:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un article existant
export async function PUT(request: Request) {
  try {
    const data = readDataFile();
    const updatedArticle = (await request.json()) as Article;

    // Trouver l'index de l'article à mettre à jour
    const index = data.articles.findIndex(
      (article: Article) => article.id === updatedArticle.id
    );

    if (index === -1) {
      return NextResponse.json(
        { success: false, message: "Article non trouvé" },
        { status: 404 }
      );
    }

    // Mettre à jour l'article
    data.articles[index] = updatedArticle;

    // Enregistrer les modifications
    const success = writeDataFile(data);

    if (success) {
      return NextResponse.json({ success: true, article: updatedArticle });
    } else {
      return NextResponse.json(
        { success: false, message: "Échec de l'écriture du fichier" },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("Erreur lors de la mise à jour d'un article:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un article
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get("id") || "0");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID manquant" },
        { status: 400 }
      );
    }

    const data = readDataFile();

    // Filtrer les articles pour supprimer celui qui correspond à l'ID
    const filteredArticles = data.articles.filter(
      (article: Article) => article.id !== id
    );

    if (filteredArticles.length === data.articles.length) {
      return NextResponse.json(
        { success: false, message: "Article non trouvé" },
        { status: 404 }
      );
    }

    data.articles = filteredArticles;

    // Enregistrer les modifications
    const success = writeDataFile(data);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, message: "Échec de l'écriture du fichier" },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("Erreur lors de la suppression d'un article:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
