
import type { PetSpecies, VaccineProtocolInfo, VaccineBoosterFrequencySelected, VaccineCategory } from "@/types";

export const ufsBrasil = [
  { sigla: "AC", nome: "Acre" },
  { sigla: "AL", nome: "Alagoas" },
  { sigla: "AP", nome: "Amapá" },
  { sigla: "AM", nome: "Amazonas" },
  { sigla: "BA", nome: "Bahia" },
  { sigla: "CE", nome: "Ceará" },
  { sigla: "DF", nome: "Distrito Federal" },
  { sigla: "ES", nome: "Espírito Santo" },
  { sigla: "GO", nome: "Goiás" },
  { sigla: "MA", nome: "Maranhão" },
  { sigla: "MT", nome: "Mato Grosso" },
  { sigla: "MS", nome: "Mato Grosso do Sul" },
  { sigla: "MG", nome: "Minas Gerais" },
  { sigla: "PA", nome: "Pará" },
  { sigla: "PB", nome: "Paraíba" },
  { sigla: "PR", nome: "Paraná" },
  { sigla: "PE", nome: "Pernambuco" },
  { sigla: "PI", nome: "Piauí" },
  { sigla: "RJ", nome: "Rio de Janeiro" },
  { sigla: "RN", nome: "Rio Grande do Norte" },
  { sigla: "RS", nome: "Rio Grande do Sul" },
  { sigla: "RO", nome: "Rondônia" },
  { sigla: "RR", nome: "Roraima" },
  { sigla: "SC", nome: "Santa Catarina" },
  { sigla: "SP", nome: "São Paulo" },
  { sigla: "SE", nome: "Sergipe" },
  { sigla: "TO", nome: "Tocantins" }
];

// Sample cities, in a real app this would be more comprehensive or from an API
export const cidadesPorUF: Record<string, string[]> = {
  SP: ["São Paulo", "Campinas", "Guarulhos", "Santos", "Sorocaba"],
  RJ: ["Rio de Janeiro", "Niterói", "Duque de Caxias", "Nova Iguaçu"],
  MG: ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora"],
  BA: ["Salvador", "Feira de Santana", "Vitória da Conquista"],
  // Add more as needed
};

export const petSpeciesList: PetSpecies[] = ["Cão", "Gato"];

export const dogBreeds = [
  "Airedale Terrier",
  "American Pit Bull Terrier",
  "American Staffordshire Terrier",
  "Australian Cattle Dog",
  "Australian Kelpie",
  "Australian Shepherd",
  "Basenji",
  "Basset Artesiano Normando",
  "Basset Azul da Gasconha",
  "Basset Fulvo da Bretanha",
  "Basset Hound",
  "Beagle",
  "Bearded Collie",
  "Bedlington Terrier",
  "Biewer Terrier",
  "Bolonhês",
  "Border Collie",
  "Border Terrier",
  "Boston Terrier",
  "Bouvier des Flandres",
  "Boxer",
  "Bull Terrier",
  "Buldogue Americano",
  "Buldogue Campeiro",
  "Buldogue Francês",
  "Bullmastiff",
  "Cavalier King Charles Spaniel",
  "Cão da Groenlândia",
  "Cão da Serra de Aires",
  "Cão de Água Português",
  "Cão de Crista Chinês",
  "Cão de Montanha dos Pirenéus",
  "Cão do Canaã",
  "Cão Lobo Tchecoslovaco",
  "Chihuahua",
  "Chow Chow",
  "Cirneco do Etna",
  "Collie Pelo Curto",
  "Collie Pelo Longo",
  "Coton de Tuléar",
  "Dálmata",
  "Doberman",
  "Dogo Argentino",
  "Dogue Alemão",
  "Elkhound Norueguês Cinza",
  "Fila Brasileiro",
  "Fox Terrier",
  "Galgo Espanhol",
  "Galgo Italiano",
  "Golden Retriever",
  "Griffon de Bruxelas",
  "Hokkaido",
  "Husky Siberiano",
  "Jack Russell Terrier",
  "King Charles Spaniel",
  "Komondor",
  "Kromfohrländer",
  "Kuvasz",
  "Labrador Retriever",
  "Lhasa Apso",
  "Malamute do Alaska",
  "Maltês",
  "Mastiff Inglês",
  "Mudi",
  "Old English Sheepdog",
  "Ovelheiro Gaúcho",
  "Papillon",
  "Pastor Alemão",
  "Pastor Americano Miniatura",
  "Pastor Belga",
  "Pastor Branco Suíço",
  "Pastor da Mantiqueira",
  "Pastor de Shetland",
  "Pequeno Cão Leão",
  "Pequinês",
  "Pinscher Miniatura",
  "Podengo Andaluz",
  "Poodle",
  "Presa Canário",
  "Pug",
  "Rafeiro do Alentejo",
  "Rottweiler",
  "São Bernardo",
  "Schnauzer",
  "Schnauzer Gigante",
  "Schnauzer Miniatura",
  "Shar Pei",
  "Smoushond Holandês",
  "SRD (Sem Raça Definida)",
  "Terra Nova",
  "Terrier Preto da Rússia",
  "Tosa",
  "Volpino Italiano",
  "Welsh Springer Spaniel",
  "Whippet",
  "Wolfhound Irlandês",
  "Xoloitzcuintle",
  "Yakutian Laika",
  "Yorkshire Terrier",
  "Outra"
].sort((a, b) => {
  if (a === "SRD (Sem Raça Definida)") return 1;
  if (b === "SRD (Sem Raça Definida)") return -1;
  if (a === "Outra") return 1;
  if (b === "Outra") return -1;
  return a.localeCompare(b);
});

export const catBreeds = [
  "Abissínio",
  "American Shorthair",
  "Angorá",
  "Ashera",
  "Bengal",
  "Bobtail Japonês",
  "Bombay",
  "British Shorthair",
  "Burmês",
  "Chartreux",
  "Cornish Rex",
  "Devon Rex",
  "Egyptian Mau",
  "Exótico",
  "Himalaio",
  "Maine Coon",
  "Manx",
  "Norueguês da Floresta",
  "Ocicat",
  "Oriental",
  "Persa",
  "Ragdoll",
  "Russian Blue",
  "Sagrado da Birmânia",
  "Savannah",
  "Scottish Fold",
  "Selkirk Rex",
  "Siamês",
  "Siberiano",
  "Singapura",
  "Somali",
  "Sphynx",
  "SRD (Sem Raça Definida)",
  "Toyger",
  "Turkish Van",
  "Outra"
].sort((a, b) => {
  if (a === "SRD (Sem Raça Definida)") return 1;
  if (b === "SRD (Sem Raça Definida)") return -1;
  if (a === "Outra") return 1;
  if (b === "Outra") return -1;
  return a.localeCompare(b);
});

export const furTypesBySpecies: Record<PetSpecies, string[]> = {
  Cão: ["Curta", "Média", "Longa", "Dupla Camada", "Encaracolada", "Lisa", "Dura/Áspera", "Sem Pelo", "Outra"],
  Gato: ["Curta", "Média", "Longa", "Sem Pelo", "Outra"],
};

export const furColorsBySpecies: Record<PetSpecies, string[]> = {
  Cão: [
    "Abricot", "Areia", "Azul", "Bege", "Bicolor", "Branco", "Caramelo", "Cinza", "Cutia",
    "Fulvo", "Malhado", "Marrom", "Merle", "Preto", "Tigrado", "Tricolor", "Vermelho", "Zibelina", "Outra"
  ].sort((a,b) => {
    if (a === "Outra") return 1;
    if (b === "Outra") return -1;
    return a.localeCompare(b);
  }),
  Gato: [
    "Âmbar", "Azul", "Bege", "Branco", "Canela", "Caramelo", "Chocolate", "Cinza", "Creme",
    "Dourado", "Lilás", "Prateado", "Preto", "Vermelho", "Zibelina", "Outra"
  ].sort((a,b) => {
    if (a === "Outra") return 1;
    if (b === "Outra") return -1;
    return a.localeCompare(b);
  }),
};

export const petSizesList: string[] = ["Pequeno", "Médio", "Grande", "Gigante"];
export const petGendersList: string[] = ["Macho", "Fêmea", "Não especificado"];
export const yesNoOptions: ("Sim" | "Não")[] = ["Sim", "Não"];

export const acquisitionTypes: string[] = [
  "Adoção/feira: Aquisição em estabelecimento reconhecido nesta finalidade",
  "Adoção/ONG: Aquisição em estabelecimento reconhecido nesta finalidade",
  "Adoção/Particular: Aquisição via pessoa de contato",
  "Adoção/varejo: Aquisição em estabelecimento reconhecido nesta finalidade",
  "Compra: Aquisição em estabelecimento registrado e emissor de nota fiscal",
  "Resgatado em Via pública",
  "Outros"
];

export const petPurposes: string[] = [
  "Companhia",
  "Comércio",
  "Guia",
  "Lazer",
  "Segurança",
  "Terapia",
  "Outros"
];

export const vaccineProtocols: VaccineProtocolInfo[] = [
  // Vacinas para Cães
  {
    id: "v8_v10_canina",
    name: "V8 / V10 (Polivalente Canina)",
    species: ["Cão"],
    preventsDiseases: ["Cinomose", "Parvovirose", "Coronavirose", "Hepatite Infecciosa Canina", "Adenovirose tipo II", "Parainfluenza", "Leptospirose (diversos sorovares dependendo da vacina V8 ou V10)"],
    importance: "Essencial",
    recommendedDoses: ["1ª dose (6-8 semanas)", "2ª dose (9-11 semanas)", "3ª dose (12-14 semanas)", "4ª dose (Opcional, 16-18 semanas)", "Reforço Anual"],
    primarySeriesIntervalDays: 21, // Entre 21 e 28 dias
    boosterFrequencySuggestion: "Anual",
    notes: "O número de doses na primovacinação pode variar (3 a 4). A 4ª dose é frequentemente recomendada para raças de alto risco ou em áreas de alta prevalência de parvovirose. O veterinário definirá o melhor esquema.",
    administrationNotes: "Via subcutânea."
  },
  {
    id: "antirrabica_canina",
    name: "Antirrábica (Cães)",
    species: ["Cão"],
    preventsDiseases: ["Raiva"],
    importance: "Essencial",
    recommendedDoses: ["Dose única (a partir de 12 semanas ou conforme legislação local)", "Reforço Anual"],
    isSingleDosePrimary: true,
    boosterFrequencySuggestion: "Anual",
    notes: "Obrigatória por lei em muitas regiões. Fundamental para a saúde pública.",
    administrationNotes: "Via subcutânea ou intramuscular."
  },
  {
    id: "gripe_canina",
    name: "Gripe Canina (Tosse dos Canis)",
    species: ["Cão"],
    preventsDiseases: ["Traqueobronquite Infecciosa Canina (causada por Bordetella bronchiseptica e/ou vírus da Parainfluenza Canina)"],
    importance: "Complementar", // Ou Essencial dependendo do estilo de vida
    recommendedDoses: ["1ª dose (a partir de 8 semanas)", "2ª dose (após 2-4 semanas, para algumas vacinas)", "Reforço Anual"], // Vacinas intranasais podem ser dose única.
    primarySeriesIntervalDays: 21,
    boosterFrequencySuggestion: "Anual",
    notes: "Recomendada para cães que frequentam creches, hotéis, parques ou têm contato com outros cães. Versões injetável e intranasal disponíveis.",
    administrationNotes: "Intranasal ou subcutânea, dependendo do produto."
  },
  {
    id: "giardia_canina",
    name: "Giárdia (Cães)",
    species: ["Cão"],
    preventsDiseases: ["Giardíase"],
    importance: "Opcional",
    recommendedDoses: ["1ª dose (a partir de 8 semanas)", "2ª dose (após 2-4 semanas)", "Reforço Anual"],
    primarySeriesIntervalDays: 21,
    boosterFrequencySuggestion: "Anual",
    notes: "Recomendada para cães com maior risco de exposição. A eficácia pode variar.",
    administrationNotes: "Via subcutânea."
  },
  {
    id: "leishmaniose_canina",
    name: "Leishmaniose Visceral Canina",
    species: ["Cão"],
    preventsDiseases: ["Leishmaniose Visceral"],
    importance: "Complementar", // Essencial em áreas endêmicas
    recommendedDoses: ["1ª dose (a partir de 4 meses, após teste sorológico negativo)", "2ª dose (21 dias após a 1ª)", "3ª dose (21 dias após a 2ª)", "Reforço Anual"],
    primarySeriesIntervalDays: 21,
    boosterFrequencySuggestion: "Anual",
    notes: "Fundamental em áreas endêmicas. Teste sorológico negativo é pré-requisito. Não impede a infecção, mas reduz o risco de desenvolvimento da doença e a transmissibilidade.",
    administrationNotes: "Via subcutânea."
  },
  // Vacinas para Gatos
  {
    id: "v3_v4_v5_felina",
    name: "V3 / V4 / V5 (Polivalente Felina)",
    species: ["Gato"],
    preventsDiseases: [
      "Panleucopenia Felina", "Calicivirose Felina", "Rinotraqueíte Felina",
      "Clamidiose (na V4 e V5)", "Leucemia Felina - FeLV (na V5)"
    ],
    importance: "Essencial",
    recommendedDoses: ["1ª dose (6-8 semanas)", "2ª dose (9-11 semanas)", "3ª dose (12-14 semanas)", "Reforço Anual"],
    primarySeriesIntervalDays: 21, // Entre 21 e 28 dias
    boosterFrequencySuggestion: "Anual",
    notes: "V3 é o core. V4 adiciona proteção contra Clamidiose. V5 adiciona proteção contra FeLV (requer teste prévio negativo para FeLV). O veterinário indicará a melhor opção.",
    administrationNotes: "Via subcutânea. Para FeLV, seguir recomendações de local de aplicação (ex: membro pélvico esquerdo)."
  },
  {
    id: "antirrabica_felina",
    name: "Antirrábica (Gatos)",
    species: ["Gato"],
    preventsDiseases: ["Raiva"],
    importance: "Essencial",
    recommendedDoses: ["Dose única (a partir de 12 semanas ou conforme legislação local)", "Reforço Anual"],
    isSingleDosePrimary: true,
    boosterFrequencySuggestion: "Anual",
    notes: "Obrigatória por lei em muitas regiões. Fundamental para a saúde pública.",
    administrationNotes: "Via subcutânea, preferencialmente no membro pélvico direito."
  },
  {
    id: "felv_pura",
    name: "FeLV (Leucemia Felina) - Isolada",
    species: ["Gato"],
    preventsDiseases: ["Leucemia Felina (FeLV)"],
    importance: "Essencial", // Para gatos negativos com risco de exposição
    recommendedDoses: ["1ª dose (a partir de 8 semanas, após teste FeLV/FIV negativo)", "2ª dose (3-4 semanas após a 1ª)", "Reforço Anual"],
    primarySeriesIntervalDays: 21, // Entre 21 e 28 dias
    boosterFrequencySuggestion: "Anual",
    notes: "Apenas para gatos FeLV negativos. Gatos positivos não se beneficiam e não devem ser vacinados para FeLV. Testar antes de vacinar.",
    administrationNotes: "Via subcutânea, seguir recomendações de local de aplicação (ex: membro pélvico esquerdo)."
  },
  // Vacina "Outra" genérica
  {
    id: "outra",
    name: "Outra (Especificar)",
    species: ["Cão", "Gato"],
    preventsDiseases: [],
    importance: "Opcional",
    recommendedDoses: [], // Será populado com genericVaccineDosesConstants se "Outra" for selecionada
    boosterFrequencySuggestion: "Não se aplica",
    notes: "Use esta opção para vacinas não listadas ou específicas."
  }
];

export const vaccineBoosterFrequenciesConstants: VaccineBoosterFrequencySelected[] = [
  "Dose Única",
  "Reforço Semanal",
  "Reforço Mensal",
  "Reforço Anual",
  "Reforço a cada 3 anos",
  "Definir Próxima Data Manualmente",
  "Não Aplicar Reforço",
];

export const vaccineCategoriesConstants: VaccineCategory[] = ["Essencial", "Complementar", "Opcional"];

export const genericVaccineDosesConstants: string[] = [
  "Dose Única",
  "1ª Dose",
  "2ª Dose",
  "3ª Dose",
  "4ª Dose",
  "Reforço",
  "Reforço Anual",
  "Outra (Especificar no campo Dose)",
];


export const activityTypes: string[] = ["Passeio", "Alimentação", "Brincadeira", "Viagem", "Hospedagem", "Visita ao Veterinário", "Outro"];
export const hygieneTypes: string[] = ["Banho", "Tosa", "Escovação de Dentes", "Corte de Unhas", "Limpeza de Orelhas", "Outro"];

export const petIdGenerator = (): string => {
  const year = new Date().getFullYear();
  // Generates an 11-character random alphanumeric string
  const randomPart = Math.random().toString(36).substring(2, 13).toUpperCase();
  return `${year}-${randomPart}`;
};

