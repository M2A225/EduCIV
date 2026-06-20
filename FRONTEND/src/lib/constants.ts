export const NIVEAUX_PAR_DEFAUT: Record<string, string[]> = {
  PRIMAIRE: ['CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2'],
  SECONDAIRE: ['6e', '5e', '4e', '3e', '2nde', '1ere', 'Tle'],
  LYCEE_TECHNIQUE: ['2nde', '1ere', 'Tle'],
  LYCEE_PROFESSIONNEL: ['2nde', '1ere', 'Tle'],
  GROUPE_SCOLAIRE: ['CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e', '2nde', '1ere', 'Tle'],
};

export const FILIERES_PAR_TYPE: Record<string, { label: string; filieres: string[] }> = {
  PRIMAIRE: { label: 'Primaire', filieres: [] },
  SECONDAIRE: { label: 'Secondaire (Collège + Lycée général)', filieres: ['A1', 'A2', 'C', 'D'] },
  LYCEE_TECHNIQUE: { label: 'Lycée Technique', filieres: ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'STIDD', 'STEG', 'T1', 'T2', 'G1', 'G2', 'G3'] },
  LYCEE_PROFESSIONNEL: { label: 'Lycée Professionnel', filieres: ['Comptabilité', 'Hôtellerie', 'BTP', 'Mécanique', 'Électricité', 'Électronique', 'Agro', 'Élevage', 'Agroalimentaire', 'Froid', 'Énergies Renouvelables', 'Mode', 'Coiffure', 'Esthétique', 'SanitaireSocial', 'TransportLogistique', 'Graphisme'] },
  GROUPE_SCOLAIRE: { label: 'Groupe scolaire', filieres: ['A1', 'A2', 'C', 'D', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'STIDD', 'STEG', 'T1', 'T2', 'G1', 'G2', 'G3', 'Comptabilité', 'Hôtellerie', 'BTP', 'Mécanique', 'Électricité', 'Électronique', 'Agro', 'Élevage', 'Agroalimentaire', 'Froid', 'Énergies Renouvelables', 'Mode', 'Coiffure', 'Esthétique', 'SanitaireSocial', 'TransportLogistique', 'Graphisme'] },
};

/* --- PRIMAIRE --- */
export interface PrimarySubject {
  name: string;
  max_score: number;
}

export const MATIERES_PRIMAIRE: Record<string, PrimarySubject[]> = {
  'CP1-CP2': [
    { name: 'Dictée', max_score: 10 },
    { name: 'Mathématiques', max_score: 10 },
    { name: 'Expression Écrite', max_score: 10 },
    { name: 'Dessin', max_score: 10 },
    { name: 'EDHC', max_score: 10 },
    { name: 'Écriture', max_score: 10 },
    { name: 'Poésie et Chant', max_score: 10 },
    { name: 'Lecture', max_score: 10 },
  ],
  'CE1-CE2': [
    { name: 'Exploitation de Texte', max_score: 30 },
    { name: 'Éveil au Milieu', max_score: 30 },
    { name: 'Dictée', max_score: 10 },
    { name: 'Mathématiques', max_score: 30 },
  ],
  'CM1-CM2': [
    { name: 'Exploitation de Texte', max_score: 50 },
    { name: 'Éveil au Milieu', max_score: 50 },
    { name: 'Dictée', max_score: 20 },
    { name: 'Mathématiques', max_score: 50 },
  ],
};

export const OPTIONNELLES_PRIMAIRE = ['Anglais', 'Informatique'];

export const TOTAL_PRIMAIRE: Record<string, number> = {
  'CP1-CP2': 80,
  'CE1-CE2': 100,
  'CM1-CM2': 170,
};

/* --- SECONDAIRE 6e-3e --- */
export interface SecondaireSubject {
  name: string;
  coefficient: number;
}

export const MATIERES_SECONDAIRE_6E_3E: SecondaireSubject[] = [
  { name: 'Français', coefficient: 3 },
  { name: 'Mathématiques', coefficient: 3 },
  { name: 'Anglais', coefficient: 2 },
  { name: 'Allemand LV2', coefficient: 1 },
  { name: 'Espagnol LV2', coefficient: 1 },
  { name: 'Histoire-Géographie', coefficient: 2 },
  { name: 'Physique-Chimie', coefficient: 2 },
  { name: 'SVT', coefficient: 2 },
  { name: 'EDHC', coefficient: 1 },
  { name: 'EPS', coefficient: 1 },
  { name: 'Art Plastique', coefficient: 1 },
  { name: 'Musique', coefficient: 1 },
];

/* --- LYCÉE 2nde-Tle --- */
export const MATIERES_LYCEE: string[] = [
  'Français',
  'Mathématiques',
  'Anglais',
  'Allemand LV2',
  'Espagnol LV2',
  'Histoire-Géographie',
  'Physique-Chimie',
  'SVT',
  'EPS',
  'Art Plastique',
  'Musique',
  'Philosophie',
];

/* --- MATIERES_PAR_DEFAUT (ancien format pour import rapide) --- */
export const MATIERES_PAR_DEFAUT: Record<string, string[]> = {
  PRIMAIRE: [],
  SECONDAIRE: MATIERES_SECONDAIRE_6E_3E.map(m => m.name),
  LYCEE_TECHNIQUE: [...MATIERES_LYCEE, 'Dessin Technique', 'Informatique'],
  LYCEE_PROFESSIONNEL: [...MATIERES_LYCEE, 'Gestion', 'Comptabilité', 'Informatique'],
  GROUPE_SCOLAIRE: [
    ...MATIERES_PRIMAIRE['CP1-CP2'].map(m => m.name),
    ...MATIERES_PRIMAIRE['CE1-CE2'].map(m => m.name),
    ...MATIERES_PRIMAIRE['CM1-CM2'].map(m => m.name),
    ...MATIERES_SECONDAIRE_6E_3E.map(m => m.name),
    'Philosophie',
  ],
};

export const PERIODES_PAR_TYPE: Record<string, { name: string; type: string }[]> = {
  PRIMAIRE_CP1_CM1: [
    { name: 'Composition 1', type: 'COMPOSITION_1' },
    { name: 'Composition 2', type: 'COMPOSITION_2' },
    { name: 'Composition 3', type: 'COMPOSITION_3' },
    { name: 'Composition de Passage', type: 'PASSAGE' },
  ],
  PRIMAIRE_CM2: [
    { name: 'Composition 1', type: 'COMPOSITION_1' },
    { name: 'Composition 2', type: 'COMPOSITION_2' },
    { name: 'Examen Blanc', type: 'EXAMEN_BLANC' },
  ],
  SECONDAIRE: [
    { name: 'Trimestre 1', type: 'TRIMESTRE_1' },
    { name: 'Trimestre 2', type: 'TRIMESTRE_2' },
    { name: 'Trimestre 3', type: 'TRIMESTRE_3' },
  ],
  LYCEE: [
    { name: 'Semestre 1', type: 'SEMESTRE_1' },
    { name: 'Semestre 2', type: 'SEMESTRE_2' },
  ],
};

export const SCHOOL_TYPE_LABELS: Record<string, string> = {
  PRIMAIRE: 'Primaire',
  SECONDAIRE: 'Secondaire (Collège + Lycée général)',
  LYCEE_TECHNIQUE: 'Lycée Technique',
  LYCEE_PROFESSIONNEL: 'Lycée Professionnel',
  GROUPE_SCOLAIRE: 'Groupe scolaire',
};
