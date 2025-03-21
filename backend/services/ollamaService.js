const axios = require('axios');
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

// Configuration de l'URL d'Ollama (modifiable via variable d'environnement)
const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-coder';

/**
 * Service pour l'intégration avec Ollama (DeepSeek)
 */
class OllamaService {
    /**
     * Génère un prompt pour analyser un sujet d'examen
     * @param {string} examContent - Contenu du sujet d'examen
     * @returns {string} - Prompt formaté
     */
    static generateExamAnalysisPrompt(examContent) {
        return `
Tu es un assistant spécialisé dans l'analyse de sujets d'examen. 
Voici un sujet d'examen:

${examContent}

Analyse ce sujet et génère:
1. Une liste des concepts clés abordés
2. Un corrigé type détaillé avec les réponses attendues
3. Une grille de notation sur 20 points indiquant la pondération de chaque partie
4. Des critères d'évaluation précis pour chaque question

Format de réponse (JSON):
{
  "concepts_cles": ["concept1", "concept2", ...],
  "corrige_type": {
    "question1": "réponse détaillée...",
    ...
  },
  "grille_notation": {
    "question1": nombre_points,
    ...
  },
  "criteres_evaluation": {
    "question1": ["critère1", "critère2", ...],
    ...
  }
}
`;
    }

    /**
     * Génère un prompt pour comparer une copie d'étudiant avec le corrigé type
     * @param {string} studentSubmission - Contenu de la copie de l'étudiant
     * @param {object} referenceCorrection - Corrigé type généré précédemment
     * @returns {string} - Prompt formaté
     */
    static generateComparisonPrompt(studentSubmission, referenceCorrection) {
        return `
Tu es un assistant spécialisé dans l'évaluation de copies d'examen.
Voici la copie d'un étudiant:

${studentSubmission}

Voici le corrigé type avec la grille de notation et les critères d'évaluation:
${JSON.stringify(referenceCorrection, null, 2)}

Évalue cette copie en:
1. Comparant les réponses de l'étudiant avec le corrigé type
2. Attribuant des points selon la grille de notation
3. Justifiant chaque note attribuée selon les critères d'évaluation
4. Calculant la note finale sur 20

Format de réponse (JSON):
{
  "evaluation_detaillee": {
    "question1": {
      "points_obtenus": nombre_points,
      "points_max": nombre_points_max,
      "justification": "explication...",
      "commentaire": "feedback pour l'étudiant..."
    },
    ...
  },
  "note_finale": nombre_sur_20,
  "commentaire_general": "commentaire global sur la copie...",
  "points_forts": ["point fort 1", ...],
  "axes_amelioration": ["axe 1", ...]
}
`;
    }

    /**
     * Extrait le texte d'un fichier PDF
     * @param {string} filePath - Chemin vers le fichier PDF
     * @returns {Promise<string>} - Texte extrait du PDF
     */
    static async extractTextFromPDF(filePath) {
        try {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            return data.text;
        } catch (error) {
            console.error('Erreur lors de l\'extraction du texte du PDF:', error);
            throw new Error('Impossible d\'extraire le texte du PDF');
        }
    }

    /**
     * Effectue une requête à l'API Ollama
     * @param {string} prompt - Le prompt à envoyer au modèle
     * @param {string} model - Le modèle à utiliser (default: deepseek-coder)
     * @returns {Promise<string>} - La réponse du modèle
     */
    static async query(prompt, model = DEEPSEEK_MODEL) {
        try {
            const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
                model,
                prompt,
                stream: false,
                options: {
                    temperature: 0.1, // Réponses plus déterministes
                    top_p: 0.9,
                    max_tokens: 4000
                }
            });

            return response.data.response;
        } catch (error) {
            console.error('Erreur lors de la requête à Ollama:', error);
            throw new Error('Impossible de communiquer avec le modèle Ollama');
        }
    }


    /**
     * Analyse un sujet d'examen et génère un corrigé type
     * @param {string} filePath - Chemin vers le fichier du sujet d'examen
     * @returns {Promise<object>} - Corrigé type généré
     */
    static async analyzeExam(filePath) {
        try {
            // Extraire le texte du PDF si c'est un PDF
            let examContent;
            if (path.extname(filePath).toLowerCase() === '.pdf') {
                examContent = await this.extractTextFromPDF(filePath);
            } else {
                // Sinon, lire le fichier comme un texte
                examContent = fs.readFileSync(filePath, 'utf8');
            }

            // Générer le prompt pour l'analyse du sujet
            const prompt = this.generateExamAnalysisPrompt(examContent);

            // Interroger Ollama pour obtenir l'analyse
            const rawResponse = await this.query(prompt);

            // Extraire le JSON de la réponse
            const jsonMatch = rawResponse.match(/```json\n([\s\S]*?)\n```/) ||
                rawResponse.match(/\{[\s\S]*\}/);

            if (!jsonMatch) {
                throw new Error('Impossible d\'extraire le JSON de la réponse du modèle');
            }

            // Nettoyer et parser le JSON
            const jsonStr = jsonMatch[1] || jsonMatch[0];
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error('Erreur lors de l\'analyse du sujet d\'examen:', error);
            throw new Error('Échec de l\'analyse du sujet d\'examen');
        }
    }

    /**
     * Compare une copie d'étudiant avec le corrigé type
     * @param {string} submissionFilePath - Chemin vers le fichier de soumission
     * @param {object} referenceCorrection - Le corrigé type généré précédemment
     * @returns {Promise<object>} - Évaluation détaillée de la copie
     */
    static async evaluateSubmission(submissionFilePath, referenceCorrection) {
        try {
            // Extraire le texte de la soumission
            let submissionContent;
            if (path.extname(submissionFilePath).toLowerCase() === '.pdf') {
                submissionContent = await this.extractTextFromPDF(submissionFilePath);
            } else {
                submissionContent = fs.readFileSync(submissionFilePath, 'utf8');
            }

            // Générer le prompt pour la comparaison
            const prompt = this.generateComparisonPrompt(submissionContent, referenceCorrection);

            // Interroger Ollama pour obtenir l'évaluation
            const rawResponse = await this.query(prompt);

            // Extraire le JSON de la réponse
            const jsonMatch = rawResponse.match(/```json\n([\s\S]*?)\n```/) ||
                rawResponse.match(/\{[\s\S]*\}/);

            if (!jsonMatch) {
                throw new Error('Impossible d\'extraire le JSON de la réponse du modèle');
            }

            // Nettoyer et parser le JSON
            const jsonStr = jsonMatch[1] || jsonMatch[0];
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error('Erreur lors de l\'évaluation de la copie:', error);
            throw new Error('Échec de l\'évaluation de la copie');
        }
    }
}

module.exports = OllamaService;