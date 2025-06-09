
// Tipos de Responsabilidade do Usuário
export type UserResponsibility = "Tutor(a)" | "Cuidador(a)" | "Veterinário(a)";

// Gênero do Pet
export type PetGender = "Macho" | "Fêmea" | "Não especificado";

// Espécie do Pet
export type PetSpecies = "Cão" | "Gato" | "Coelho" | "Porco/Mini-porco" | "Hamster" | "Porquinhos-da-índia" | "Furão" | "Rato/camundongo" | "Chinchila" | "Lagarto/Iguana" | "Tartaruga" | "Cagado" | "Papagaio" | "Calopsita" | "Periquito" | "Canário" | "Coruja";

// Porte do Pet
export type PetSize = "Pequeno" | "Médio" | "Grande" | "Gigante";

// Tipo de Aquisição do Pet
export type PetAcquisitionType =
  | "Adoção/feira: Aquisição em estabelecimento reconhecido nesta finalidade"
  | "Adoção/ONG: Aquisição em estabelecimento reconhecido nesta finalidade"
  | "Adoção/Particular: Aquisição via pessoa de contato"
  | "Adoção/varejo: Aquisição em estabelecimento reconhecido nesta finalidade"
  | "Compra: Aquisição em estabelecimento registrado e emissor de nota fiscal"
  | "Resgatado em Via pública"
  | "Outros";

// Finalidade do Pet
export type PetPurpose =
  | "Companhia"
  | "Comércio"
  | "Guia"
  | "Lazer"
  | "Segurança"
  | "Terapia"
  | "Outros";

// Status do Compartilhamento
export type ShareStatus = "pending" | "accepted";

// Usuário Autenticado
export interface AuthUser {
  cpf: string; // ID primário
  nome: string;
  email: string; // editável
  tipoResponsabilidade?: UserResponsibility[];
  uf?: string;
  cidade?: string;
  endereco?: string;
  cep?: string;
  telefone?: string;
  acceptedTerms: boolean;
  temporaryPassword?: string;
}

// Compartilhamento do Pet com profissionais (diferente de co-tutor)
export interface PetShare {
  userId: string; // CPF do cuidador/vet
  userEmail: string; // Email do profissional para contato/notificação
  status: ShareStatus;
}

// Status do Pet
export type PetStatusValue = "ativo" | "falecido" | "doado" | "perdido" | "outro";
export interface PetStatus {
  value: PetStatusValue;
  date?: string;
  notes?: string;
}

// Pet
export interface Pet {
  id: string;
  ownerId: string; // CPF do tutor principal
  secondaryTutorCpf?: string; // CPF do segundo tutor (co-tutor)
  // secondaryTutorName não é armazenado no objeto Pet
  // secondaryTutorEmail não é armazenado no objeto Pet
  sharedWith?: PetShare[]; // Para compartilhamento com veterinários/cuidadores

  nome: string;
  especie: PetSpecies;
  raca: string;
  fotoUrl?: string;
  tipoPelagem: string;
  corPelagem: string;
  sinaisObservacoes?: string;

  dataNascimento?: string;
  idade?: number;
  naturalidadeCidade?: string;
  naturalidadeUF?: string;

  hasSimPatinhas?: "Sim" | "Não";
  simPatinhasId?: string;
  simPatinhasEmissionDate?: string;
  simPatinhasEmissionCity?: string;
  simPatinhasEmissionUF?: string;

  peso?: number;
  porte?: PetSize;
  sexo: PetGender;
  tipoAquisicao?: PetAcquisitionType;
  castrado: "Sim" | "Não";
  finalidade?: PetPurpose;

  historicoMedico?: string;
  possuiPedigree: "Sim" | "Não";
  pedigreeArquivoNome?: string;

  possuiDeficiencia: boolean;
  detalhesDeficiencia?: string;

  possuiMicrochip: "Sim" | "Não";
  microchipId?: string;

  status: PetStatus;
}

// Log de Sintomas
export interface SymptomLog {
  id: string;
  petId: string;
  date: string;
  symptomsDescription: string;
  followUpResponses?: Array<{ symptom: string; response: "Sim" | "Não" | "Não tenho certeza"; }>;
  aiDiagnosis?: string;
  aiHomeTreatments?: string;
  aiImmediateActions?: string;
  aiDisclaimer?: string;
  aiNeedsMoreInfo?: boolean;
  aiSuggestedFollowUp?: string[];
  vetDiagnosis?: string;
  vetDiagnosisDate?: string;
}

// Protocolo de Vacina
export interface VaccineProtocolInfo {
  id: string;
  name: string;
  species: PetSpecies[];
  preventsDiseases: string[];
  importance: "Essencial" | "Complementar" | "Opcional";
  recommendedDoses: string[];
  primarySeriesIntervalDays?: number;
  boosterFrequencySuggestion?: "Anual" | "Semestral" | "A cada 3 anos" | "Não se aplica";
  isSingleDosePrimary?: boolean;
  notes?: string;
  administrationNotes?: string;
}

// Frequência de Reforço Selecionável
export type VaccineBoosterFrequencySelected =
  | "Dose Única"
  | "Reforço Semanal"
  | "Reforço Mensal"
  | "Reforço Anual"
  | "Reforço a cada 3 anos"
  | "Definir Próxima Data Manualmente"
  | "Não Aplicar Reforço";

// Vacinação (registro individual)
export interface Vaccination {
  id: string;
  petId: string;
  vaccineType: string;
  vaccineName: string;
  specifiedVaccineName?: string;
  dose: string;
  administrationDate: string;
  boosterFrequencySelected?: VaccineBoosterFrequencySelected;
  nextDueDate?: string;
  vetClinic?: string;
  vetName?: string;
  lotNumber?: string;
  notes?: string;
}

// Log de Vermífugo
export interface DewormerLog {
  id: string;
  petId: string;
  productName: string;
  administrationDate: string;
  nextDueDate?: string;
  dosage?: string;
  notes?: string;
}

// Tipo de Antipulgas
export type AntipulgasProductType = "Coleira" | "Pipeta" | "Spray" | "Comprimido" | "Outro";

// Log de Antipulgas/Carrapatos
export interface AntipulgasLog {
  id: string;
  petId: string;
  productName: string;
  applicationDate: string;
  nextDueDate?: string;
  type: AntipulgasProductType; 
  notes?: string;
}

// Tipo de Documento Médico
export type MedicalDocumentType = "Exame de Sangue" | "Raio-X" | "Ultrassom" | "Receita" | "Atestado" | "Outro";

// Documento Médico
export interface MedicalDocument {
  id:string;
  petId: string;
  documentName: string;
  documentType: MedicalDocumentType;
  issueDate: string;
  fileName?: string;
  fileDataUrl?: string;
  notes?: string;
}

// Log de Consulta Veterinária
export interface ConsultationLog {
  id: string;
  petId: string;
  consultationDate: string;
  vetClinic?: string;
  vetName?: string;
  reason: string;
  diagnosis?: string;
  treatmentPrescribed?: string;
  notes?: string;
}

// Log de Atividade de Rotina
export interface ActivityLog {
  id: string;
  petId: string;
  activityType: "Passeio" | "Alimentação" | "Brincadeira" | "Viagem" | "Hospedagem" | "Visita ao Veterinário" | "Outro";
  description?: string;
  startTime: string;
  endTime?: string;

  hospedagemLocal?: string;
  hospedagemTelefone?: string;
  hospedagemResponsavel?: string;

  visitaVetClinica?: string;
  visitaVetNome?: string;

  isRecurrent: boolean;
  recurrenceFrequency?: "Diariamente" | "Semanalmente" | "Mensalmente" | "Personalizado";
  recurrenceValue?: string;
  recurrenceEndDate?: string;

  notes?: string;
}

// Log de Higiene
export interface HygieneLog {
  id: string;
  petId: string;
  hygieneType: "Banho" | "Tosa" | "Escovação de Dentes" | "Corte de Unhas" | "Limpeza de Orelhas" | "Outro";
  date: string;
  productUsed?: string;
  notes?: string;
}

// Plano Alimentar
export interface FeedingPlan {
  petId: string;
  generatedDate: string;
  recommendedFoodTypes: string;
  dailyFoodAmount: string;
  feedingFrequency: string;
  generalAdvice: string;
  importantNotes?: string;
  disclaimer: string;
}

// Convite de Compartilhamento
export interface Invitation {
  id: string;
  petId: string;
  petName: string;
  petFotoUrl?: string;
  ownerName: string;
  ownerEmail: string;
  dateSent: string;
}

// Categoria da Vacina
export type VaccineCategory = "Essencial" | "Complementar" | "Opcional";
export const vaccineCategories: VaccineCategory[] = ["Essencial", "Complementar", "Opcional"];

// Frequência de Reforço de Vacina
export const vaccineBoosterFrequencies: VaccineBoosterFrequencySelected[] = [
  "Dose Única",
  "Reforço Semanal",
  "Reforço Mensal",
  "Reforço Anual",
  "Reforço a cada 3 anos",
  "Definir Próxima Data Manualmente",
  "Não Aplicar Reforço",
];

// Doses Genéricas
export const genericVaccineDoses: string[] = [
  "Dose Única",
  "1ª Dose",
  "2ª Dose",
  "3ª Dose",
  "4ª Dose",
  "Reforço",
  "Reforço Anual",
  "Outra",
];

    