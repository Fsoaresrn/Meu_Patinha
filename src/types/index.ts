
// Tipos de Responsabilidade do Usuário
export type UserResponsibility = "Tutor(a)" | "Cuidador(a)" | "Veterinário(a)";

// Gênero do Pet
export type PetGender = "Macho" | "Fêmea" | "Não especificado";

// Espécie do Pet
export type PetSpecies = "Cão" | "Gato";

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
  // Senha não é armazenada aqui após autenticação
  tipoResponsabilidade?: UserResponsibility[]; 
  uf?: string; // Estado (Unidade Federativa)
  cidade?: string;
  endereco?: string; // Rua, Número, Complemento, Bairro
  cep?: string;
  telefone?: string; // DDD e Número
  acceptedTerms: boolean;
  temporaryPassword?: string; // Para recuperação, armazenado temporariamente
}

// Compartilhamento do Pet
export interface PetShare {
  userId: string; // CPF do cuidador/vet
  userEmail: string;
  status: ShareStatus;
}

// Status do Pet
export type PetStatusValue = "ativo" | "falecido" | "doado" | "perdido" | "outro";
export interface PetStatus {
  value: PetStatusValue;
  date?: string; // Data do evento (e.g., data do falecimento)
  notes?: string; // Notas adicionais (e.g., motivo "outro")
}

// Pet
export interface Pet {
  id: string; // Formato ANO-XXXXXXXXXXX
  ownerId: string; // CPF do tutor principal
  secondaryTutorId?: string; // CPF do 2º tutor (opcional)
  secondaryTutorName?: string; // Nome do 2º tutor (opcional)
  secondaryTutorEmail?: string; // E-mail do 2º tutor (opcional)
  sharedWith?: PetShare[]; // Array para cuidadores/veterinários
  
  nome: string;
  especie: PetSpecies;
  raca: string; // Pode ser "Outra"
  fotoUrl?: string; // URL da imagem ou data URI
  tipoPelagem: string; // Específico por espécie, pode ser "Outra"
  corPelagem: string; // Específico por espécie, pode ser "Outra"
  sinaisObservacoes?: string; // Sinais característicos/Observações
  
  dataNascimento?: string; // "dd/MM/yyyy"
  idade?: number; // Calculada ou manual se dataNascimento for desconhecida
  naturalidadeCidade?: string;
  naturalidadeUF?: string;
  
  hasSimPatinhas?: "Sim" | "Não"; // Novo campo
  simPatinhasId?: string; 
  simPatinhasEmissionDate?: string; // "dd/MM/yyyy" - Anteriormente simPatinhasDataEmissao
  simPatinhasEmissionCity?: string; // Anteriormente simPatinhasCidadeEmissao
  simPatinhasEmissionUF?: string; // Anteriormente simPatinhasUFEmissao
  
  peso?: number; // Em kg
  porte?: PetSize;
  sexo: PetGender;
  tipoAquisicao?: PetAcquisitionType;
  castrado: "Sim" | "Não";
  finalidade?: PetPurpose;
  
  historicoMedico?: string; // Textarea
  possuiPedigree: "Sim" | "Não";
  pedigreeArquivoNome?: string; // Nome do arquivo do pedigree
  
  possuiDeficiencia: boolean;
  detalhesDeficiencia?: string; // Textarea se possuiDeficiencia for true
  
  possuiMicrochip: "Sim" | "Não";
  microchipId?: string; // Se possuiMicrochip for "Sim"

  status: PetStatus; // Status do pet (ativo, falecido, etc.)
}

// Log de Sintomas
export interface SymptomLog {
  id: string;
  petId: string;
  date: string; // Data do registro "dd/MM/aaaa HH:mm"
  symptomsDescription: string;
  additionalSymptomsSelected?: string[]; // Sintomas de acompanhamento
  aiDiagnosis?: string;
  aiHomeTreatments?: string;
  aiImmediateActions?: string;
  aiDisclaimer?: string;
  aiNeedsMoreInfo?: boolean;
  aiSuggestedFollowUp?: string[];
  vetDiagnosis?: string; // Diagnóstico veterinário
  vetDiagnosisDate?: string; // Data do diagnóstico veterinário
}

// Vacinação
export interface Vaccination {
  id: string;
  petId: string;
  vaccineName: string; // Nome da vacina (pode ser o tipo selecionado)
  vaccineType: string; // Tipo de Vacina (do VaccineProtocol)
  dose: string; // e.g., "1ª Dose", "Reforço Anual"
  administrationDate: string; // "dd/MM/aaaa"
  boosterFrequency?: string; // e.g., "Anual", "A cada 3 anos", "Não se aplica"
  nextDueDate?: string; // "dd/MM/yyyy", manual ou calculada
  vetClinic?: string;
  vetName?: string;
  lotNumber?: string; 
  notes?: string;
}

// Protocolo de Vacina (para dados padronizados)
export interface VaccineProtocolInfo {
  id: string;
  name: string;
  species: PetSpecies[]; // Para quais espécies se aplica
  description: string;
  recommendedDoses: string[]; // e.g., ["1ª Dose (6-8 semanas)", "2ª Dose (10-12 semanas)"]
  boosterInfo: string; // Informações sobre reforço
}

// Log de Vermífugo
export interface DewormerLog {
  id: string;
  petId: string;
  productName: string;
  administrationDate: string; // "dd/MM/aaaa"
  nextDueDate?: string; // "dd/MM/aaaa"
  dosage?: string;
  notes?: string;
}

// Log de Antipulgas/Carrapatos
export interface AntipulgasLog {
  id: string;
  petId: string;
  productName: string;
  applicationDate: string; // "dd/MM/aaaa"
  nextDueDate?: string; // "dd/MM/aaaa"
  type: "Coleira" | "Pipeta" | "Spray" | "Comprimido" | "Outro"; // Tipo de produto
  notes?: string;
}

// Documento Médico
export interface MedicalDocument {
  id:string;
  petId: string;
  documentName: string;
  documentType: "Exame de Sangue" | "Raio-X" | "Ultrassom" | "Receita" | "Atestado" | "Outro";
  issueDate: string; // "dd/MM/aaaa"
  fileName?: string; // Nome do arquivo (simulação de upload)
  notes?: string;
}

// Log de Consulta Veterinária
export interface ConsultationLog {
  id: string;
  petId: string;
  consultationDate: string; // "dd/MM/aaaa HH:mm"
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
  startTime: string; // "dd/MM/aaaa HH:mm"
  endTime?: string; // "dd/MM/aaaa HH:mm" (opcional)
  
  // Campos específicos para Hospedagem
  hospedagemLocal?: string;
  hospedagemTelefone?: string;
  hospedagemResponsavel?: string;
  
  // Campos específicos para Visita ao Veterinário
  visitaVetClinica?: string;
  visitaVetNome?: string;
  
  isRecurrent: boolean;
  recurrenceFrequency?: "Diariamente" | "Semanalmente" | "Mensalmente" | "Personalizado";
  recurrenceValue?: string; // e.g., "Seg, Qua, Sex" ou "A cada X dias"
  recurrenceEndDate?: string; // "dd/MM/aaaa" (opcional)
  
  notes?: string;
}

// Log de Higiene
export interface HygieneLog {
  id: string;
  petId: string;
  hygieneType: "Banho" | "Tosa" | "Escovação de Dentes" | "Corte de Unhas" | "Limpeza de Orelhas" | "Outro";
  date: string; // "dd/MM/aaaa HH:mm"
  productUsed?: string;
  notes?: string;
}

// Plano Alimentar (gerado pela IA ou manual)
export interface FeedingPlan {
  petId: string;
  generatedDate: string; // "dd/MM/aaaa"
  recommendedFoodTypes: string;
  dailyFoodAmount: string;
  feedingFrequency: string;
  generalAdvice: string;
  importantNotes?: string;
  disclaimer: string;
}

// Convite de Compartilhamento (para a tela /convites)
export interface Invitation {
  id: string; // ID do convite (pode ser petId + convidadoId)
  petId: string;
  petName: string;
  petFotoUrl?: string;
  ownerName: string; // Nome do tutor que convidou
  ownerEmail: string;
  dateSent: string; // "dd/MM/aaaa"
}

