
import type { PetSpecies, VaccineProtocolInfo, VaccineBoosterFrequencySelected, VaccineCategory, AntipulgasProductType, MedicalDocumentType } from "@/types";

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
  RN: ["Natal", "Macaíba", "Extremoz", "Mossoró", ],
  // Add more as needed
};

export const petSpeciesList: PetSpecies[] = ["Cão", "Gato", "Coelho", "Porco/Mini-porco", "Hamster", "Porquinhos-da-índia", "Furão", "Rato/camundongo", "Chinchila", "Lagarto", "Iguana", "Tartaruga", "Cagado", "Papagaio", "Calopsita", "Periquito", "Canário", "Coruja"];
// Excluido para separar iguana de lagarto : export const petSpeciesList: PetSpecies[] = ["Cão", "Gato", "Coelho", "Porco/Mini-porco", "Hamster", "Porquinhos-da-índia", "Furão", "Rato/camundongo", "Chinchila", "Lagarto/Iguana", "Tartaruga", "Cagado", "Papagaio", "Calopsita", "Periquito", "Canário", "Coruja"];

// Helper function to sort breeds, keeping SRD and Outra at the end
const sortBreeds = (breeds: string[]): string[] => {
  return breeds.sort((a, b) => {
    const isASpecial = a === "SRD (Sem Raça Definida)" || a === "Outra";
    const isBSpecial = b === "SRD (Sem Raça Definida)" || b === "Outra";

    if (isASpecial && !isBSpecial) return 1;
    if (!isASpecial && isBSpecial) return -1;
    if (isASpecial && isBSpecial) {
      if (a === "SRD (Sem Raça Definida)" && b === "Outra") return -1;
      if (a === "Outra" && b === "SRD (Sem Raça Definida)") return 1;
    }
    return a.localeCompare(b);
  });
};

// Helper function to sort colors, keeping Outra at the end
const sortColors = (colors: string[]): string[] => {
  return colors.sort((a, b) => {
    if (a === "Outra") return 1;
    if (b === "Outra") return -1;
    return a.localeCompare(b);
  });
};

export const dogBreeds = sortBreeds([
  "Airedale Terrier", "American Pit Bull Terrier", "American Staffordshire Terrier", "Australian Cattle Dog",
  "Australian Kelpie", "Australian Shepherd", "Basenji", "Basset Artesiano Normando", "Basset Azul da Gasconha",
  "Basset Fulvo da Bretanha", "Basset Hound", "Beagle", "Bearded Collie", "Bedlington Terrier", "Biewer Terrier",
  "Bolonhês", "Border Collie", "Border Terrier", "Boston Terrier", "Bouvier des Flandres", "Boxer", "Bull Terrier",
  "Buldogue Americano", "Buldogue Campeiro", "Buldogue Francês", "Bullmastiff", "Cavalier King Charles Spaniel",
  "Cão da Groenlândia", "Cão da Serra de Aires", "Cão de Água Português", "Cão de Crista Chinês",
  "Cão de Montanha dos Pirenéus", "Cão do Canaã", "Cão Lobo Tchecoslovaco", "Chihuahua", "Chow Chow",
  "Cirneco do Etna", "Collie Pelo Curto", "Collie Pelo Longo", "Coton de Tuléar", "Dálmata", "Doberman",
  "Dogo Argentino", "Dogue Alemão", "Elkhound Norueguês Cinza", "Fila Brasileiro", "Fox Terrier", "Galgo Espanhol",
  "Galgo Italiano", "Golden Retriever", "Griffon de Bruxelas", "Hokkaido", "Husky Siberiano", "Jack Russell Terrier",
  "King Charles Spaniel", "Komondor", "Kromfohrländer", "Kuvasz", "Labrador Retriever", "Lhasa Apso",
  "Malamute do Alaska", "Maltês", "Mastiff Inglês", "Mudi", "Old English Sheepdog", "Ovelheiro Gaúcho", "Papillon",
  "Pastor Alemão", "Pastor Americano Miniatura", "Pastor Belga", "Pastor Branco Suíço", "Pastor da Mantiqueira",
  "Pastor de Shetland", "Pequeno Cão Leão", "Pequinês", "Pinscher Miniatura", "Podengo Andaluz", "Poodle",
  "Presa Canário", "Pug", "Rafeiro do Alentejo", "Rottweiler", "São Bernardo", "Schnauzer", "Schnauzer Gigante",
  "Schnauzer Miniatura", "Shar Pei", "Smoushond Holandês", "Terra Nova", "Terrier Preto da Rússia", "Tosa",
  "Volpino Italiano", "Welsh Springer Spaniel", "Whippet", "Wolfhound Irlandês", "Xoloitzcuintle", "Yakutian Laika",
  "Yorkshire Terrier", "SRD (Sem Raça Definida)", "Outra"
]);

export const catBreeds = sortBreeds([
  "Abissínio", "American Shorthair", "Angorá", "Ashera", "Bengal", "Bobtail Japonês", "Bombay", "British Shorthair",
  "Burmês", "Chartreux", "Cornish Rex", "Devon Rex", "Egyptian Mau", "Exótico", "Himalaio", "Maine Coon", "Manx",
  "Norueguês da Floresta", "Ocicat", "Oriental", "Persa", "Ragdoll", "Russian Blue", "Sagrado da Birmânia",
  "Savannah", "Scottish Fold", "Selkirk Rex", "Siamês", "Siberiano", "Singapura", "Somali", "Sphynx", "Toyger",
  "Turkish Van", "SRD (Sem Raça Definida)", "Outra"
]);

export const hamsterBreeds = sortBreeds(["Sírio", "Anão Russo", "Chinês", "Roborovski", "SRD (Sem Raça Definida)", "Outra"]);
export const guineaPigBreeds = sortBreeds(["Inglês", "Americano", "Abissínio", "Peruano", "Texel", "Sheltie", "Coroado", "Skinny (sem pelos)", "SRD (Sem Raça Definida)", "Outra"]); // Inclui Porco/Mini-porco
export const ratMouseBreeds = sortBreeds(["Fancy", "Dumbo", "Rex", "Nude", "SRD (Sem Raça Definida)", "Outra"]);
export const chinchillaBreeds = sortBreeds(["Padrão (Standard Gray)", "Branco", "Preto Velvet", "Beige", "Safira", "Mosaic", "SRD (Sem Raça Definida)", "Outra"]);
export const rabbitBreeds = sortBreeds(["Angorá", "Lionhead", "Rex", "Mini Rex", "Netherland Dwarf", "Califórnia", "Fuzzy Lop", "Mini Lop", "Flemish Giant", "SRD (Sem Raça Definida)", "Outra"]);
export const lizardBreeds = sortBreeds(["Leopardo", "Teiú", "Gecko Tokay", "Skink-de-língua-azul", "Dragão Barbudo", "SRD (Sem Raça Definida)", "Outra"]);
export const iguanaBreeds = sortBreeds(["Verde (Iguana iguana)", "Azul", "Vermelha", "SRD (Sem Raça Definida)", "Outra"]);
export const turtleBreeds = sortBreeds(["Tigre-d'água (Trachemys scripta elegans)", "Tartaruga-de-ouvido-amarelo", "Tartaruga-da-Amazônia", "Jabuti-piranga", "Jabuti-tinga", "SRD (Sem Raça Definida)", "Outra"]); // Inclui Cagado
export const parakeetBreeds = sortBreeds(["Periquito-australiano (Budgie)", "Periquito Inglês", "Periquito Arlequim", "Lutino", "Albino", "Azul Cobalto", "SRD (Sem Raça Definida)", "Outra"]);
export const cockatielBreeds = sortBreeds(["Calopsita Cinza (Selvagem)", "Lutino", "Albino", "Pérola", "Canela", "Arlequim", "SRD (Sem Raça Definida)", "Outra"]);
export const parrotBreeds = sortBreeds(["Papagaio-verdadeiro (Amazona aestiva)", "Papagaio-do-congo (Cinza-africano)", "Arara-azul", "Maracanã", "Eclectus", "Papagaio-do-sol", "SRD (Sem Raça Definida)", "Outra"]);
export const canaryBreeds = sortBreeds(["Belga (do Reino)", "Gloster", "Roller", "Norwich", "Vermelho", "Arlequim", "SRD (Sem Raça Definida)", "Outra"]);
export const owlBreeds = sortBreeds(["Coruja-das-torres (Tyto alba)", "Coruja-buraqueira", "Coruja-do-mato", "Mocho-diabo", "Corujão-orelhudo", "SRD (Sem Raça Definida)", "Outra"]);

// Mapeamento de Espécie para Lista de Raças
export const breedsBySpecies: Record<PetSpecies, string[]> = {
  "Cão": dogBreeds,
  "Gato": catBreeds,
  "Coelho": rabbitBreeds,
  "Porco/Mini-porco": guineaPigBreeds, // Usando a mesma lista de porquinho-da-índia
  "Hamster": hamsterBreeds,
  "Porquinhos-da-índia": guineaPigBreeds,
  "Furão": sortBreeds(["SRD (Sem Raça Definida)", "Outra"]), // Adicionando default para Furão
  "Rato/camundongo": ratMouseBreeds,
  "Chinchila": chinchillaBreeds,
  "Lagarto": lizardBreeds,
  "Iguana": iguanaBreeds,
  "Tartaruga": turtleBreeds,
  "Cagado": turtleBreeds, // Usando a mesma lista de tartaruga
  "Papagaio": parrotBreeds,
  "Calopsita": cockatielBreeds,
  "Periquito": parakeetBreeds,
  "Canário": canaryBreeds,
  "Coruja": owlBreeds,
};

// Tipos de Pelagem por Espécie (Apenas para espécies que possuem pelagem relevante)
export const furTypesBySpecies: Partial<Record<PetSpecies, string[]>> = {
  "Cão": ["Curta", "Média", "Longa", "Dupla Camada", "Encaracolada", "Lisa", "Dura/Áspera", "Sem Pelo", "Outra"],
  "Gato": ["Curta", "Média", "Longa", "Sem Pelo", "Outra"],
  "Hamster": ["Curta", "Macia", "Lisa", "Longa", "Outra"],
  "Porco/Mini-porco": ["Lisa", "Áspera", "Longa", "Crespa", "Rosetada", "Sem Pelo", "Outra"], // Adicionado "Sem Pelo" para Skinny
  "Porquinhos-da-índia": ["Lisa", "Áspera", "Longa", "Crespa", "Rosetada", "Sem Pelo", "Outra"], // Adicionado "Sem Pelo" para Skinny
  "Rato/camundongo": ["Curta", "Fina", "Encaracolada", "Sem Pelo", "Outra"], // Adicionado "Sem Pelo" para Nude
  "Chinchila": ["Extremamente densa", "Macia", "Outra"],
  "Coelho": ["Curta", "Longa", "Sedosa", "Encaracolada", "Felpuda", "Outra"],
  // Espécies como Furão, Lagarto, Iguana, Tartaruga, Cagado, Papagaio, Calopsita, Periquito, Canário, Coruja não terão este campo habilitado.
};

// Cores por Espécie
export const furColorsBySpecies: Partial<Record<PetSpecies, string[]>> = {
  "Cão": sortColors([
    "Abricot", "Areia", "Azul", "Bege", "Bicolor", "Branco", "Caramelo", "Cinza", "Cutia",
    "Fulvo", "Malhado", "Marrom", "Merle", "Preto", "Tigrado", "Tricolor", "Vermelho", "Zibelina", "Outra"
  ]),
  "Gato": sortColors([
    "Âmbar", "Azul", "Bege", "Branco", "Canela", "Caramelo", "Chocolate", "Cinza", "Creme",
    "Dourado", "Lilás", "Prateado", "Preto", "Vermelho", "Zibelina", "Outra"
  ]),
  "Hamster": sortColors(["Marrom", "Dourado", "Branco", "Cinza", "Preto", "Manchado", "Outra"]),
  "Porco/Mini-porco": sortColors(["Branco", "Preto", "Dourado", "Tricolor", "Rajado", "Outra"]),
  "Porquinhos-da-índia": sortColors(["Branco", "Preto", "Dourado", "Tricolor", "Rajado", "Outra"]),
  "Rato/camundongo": sortColors(["Branco", "Cinza", "Preto", "Bege", "Manchado", "Outra"]),
  "Chinchila": sortColors(["Cinza (padrão)", "Branco", "Bege", "Preto", "Safira", "Outra"]),
  "Coelho": sortColors(["Branco", "Cinza", "Preto", "Marrom", "Bege", "Manchado", "Tricolor", "Laranja", "Outra"]),
  "Periquito": sortColors(["Verde", "Azul", "Amarelo", "Branco", "Violeta", "Cinza", "Combinações", "Outra"]),
  "Calopsita": sortColors(["Cinza", "Amarelo", "Branco", "Lutino (amarelo claro)", "Cara-Laranja", "Outra"]),
  "Papagaio": sortColors(["Verde dominante", "Verde com vermelho", "Azul e amarelo", "Colorido", "Outra"]),
  "Canário": sortColors(["Amarelo (clássico)", "Laranja", "Branco", "Marfim", "Vermelho", "Variegado", "Outra"]),
  "Coruja": sortColors(["Marrom", "Branco", "Cinza", "Rajada", "Outra"]),
  // Espécies como Furão, Lagarto, Iguana, Tartaruga, Cagado podem não ter cores de pelagem aplicáveis ou variam muito.
};

// *** ADICIONANDO FUNÇÕES AUXILIARES EXPORTADAS ***

// Helper function to get breeds for a given species
export const getBreedsForSpecies = (species: PetSpecies | undefined): string[] => {
  if (!species || !breedsBySpecies[species]) {
    return []; // Return empty array if species is undefined or not found
  }
  return breedsBySpecies[species];
};

// Helper function to get fur types for a given species
export const getFurTypesForSpecies = (species: PetSpecies | undefined): string[] => {
  if (!species || !furTypesBySpecies[species]) {
    return []; // Return empty array if species is undefined or has no fur types defined
  }
  return furTypesBySpecies[species] || []; // Ensure array even if entry exists but is undefined
};

// Helper function to get fur colors for a given species
export const getFurColorsForSpecies = (species: PetSpecies | undefined): string[] => {
  if (!species || !furColorsBySpecies[species]) {
    return []; // Return empty array if species is undefined or has no colors defined
  }
  return furColorsBySpecies[species] || []; // Ensure array
};

// *** FIM DAS FUNÇÕES AUXILIARES ***

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
  // --- Vacinas Caninas ---
  {
    id: "v8_canina",
    name: "V8 (Múltipla Canina)",
    species: ["Cão"],
    preventsDiseases: ["Cinomose", "Parvovirose", "Coronavirose", "Hepatite Infecciosa Canina", "Adenovirose Canina Tipo 2", "Parainfluenza Canina", "Leptospirose (sorovares Canicola e Icterohaemorrhagiae)"] as string[],
    importance: "Essencial",
    recommendedDoses: ["1ª dose (6-8 semanas)", "2ª dose (9-11 semanas)", "3ª dose (12-14 semanas)", "Reforço Anual"],
    primarySeriesIntervalDays: 21,
    boosterFrequencySuggestion: "Anual",
    notes: "Esquema de 3 doses na primovacinação (6-14 semanas). Reforço anual. Seguir orientação veterinária.",
    administrationNotes: "Via subcutânea."
  },
  {
    id: "v10_canina",
    name: "V10 (Polivalente Canina)",
    species: ["Cão"],
    preventsDiseases: ["Cinomose", "Parvovirose", "Coronavirose", "Hepatite Infecciosa Canina", "Adenovirose Canina Tipo 2", "Parainfluenza Canina", "Leptospirose (sorovares Canicola, Icterohaemorrhagiae, Grippotyphosa e Pomona)"] as string[],
    importance: "Essencial",
    recommendedDoses: ["1ª dose (6-8 semanas)", "2ª dose (9-11 semanas)", "3ª dose (12-14 semanas)", "4ª dose (Opcional, 16-18 semanas)", "Reforço Anual"],
    primarySeriesIntervalDays: 21,
    boosterFrequencySuggestion: "Anual",
    notes: "Esquema de 3 a 4 doses na primovacinação (6-18 semanas). Reforço anual. Seguir orientação veterinária.",
    administrationNotes: "Via subcutânea."
  },
  {
    id: "giardia_canina",
    name: "Giárdia (Canina)",
    species: ["Cão"],
    preventsDiseases: ["Giardíase"] as string[],
    importance: "Complementar",
    recommendedDoses: ["1ª dose (a partir de 8 semanas)", "2ª dose (após 2-4 semanas)", "Reforço Anual"],
    primarySeriesIntervalDays: 21, // Entre 21 e 28 dias
    boosterFrequencySuggestion: "Anual",
    notes: "Recomendada para cães com maior risco de exposição. A eficácia pode variar.",
    administrationNotes: "Via subcutânea."
  },
  {
    id: "leishmaniose_canina",
    name: "Leishmaniose (Canina)",
    species: ["Cão"],
    preventsDiseases: ["Leishmaniose Visceral Canina"] as string[],
    importance: "Complementar",
    recommendedDoses: ["1ª dose (a partir de 4 meses, após teste sorológico negativo)", "2ª dose (21 dias após a 1ª)", "3ª dose (21 dias após a 2ª)", "Reforço Anual"],
    primarySeriesIntervalDays: 21,
    boosterFrequencySuggestion: "Anual",
    notes: "Fundamental em áreas endêmicas. Teste sorológico negativo é pré-requisito. Não impede a infecção, mas reduz o risco de desenvolvimento da doença e a transmissibilidade.",
    administrationNotes: "Via subcutânea."
  },
  {
    id: "gripe_canina",
    name: "Gripe Canina (Tosse dos Canis)",
    species: ["Cão"],
    preventsDiseases: ["Traqueobronquite Infecciosa Canina (Bordetella bronchiseptica e/ou Parainfluenza)"] as string[],
    importance: "Complementar",
    recommendedDoses: ["1ª dose (a partir de 8 semanas)", "2ª dose (após 2-4 semanas, para algumas vacinas injetáveis)", "Reforço Anual"],
    primarySeriesIntervalDays: 21,
    boosterFrequencySuggestion: "Anual",
    notes: "Recomendada para cães que frequentam creches, hotéis, etc. Versões injetável e intranasal (pode ser dose única) disponíveis.",
    administrationNotes: "Intranasal ou subcutânea, dependendo do produto."
  },
  // --- Vacinas Felinas ---
  {
    id: "v3_felina",
    name: "V3 (Tríplice Felina)",
    species: ["Gato"] as PetSpecies[],
    preventsDiseases: ["Rinotraqueíte Viral Felina", "Calicivirose Felina", "Panleucopenia Felina"],
    importance: "Essencial",
    recommendedDoses: ["1ª dose (6-8 semanas)", "2ª dose (9-11 semanas)", "3ª dose (12-14 semanas)", "Reforço Anual"],
    primarySeriesIntervalDays: 21,
    boosterFrequencySuggestion: "Anual",
    notes: "Base da proteção felina. Seguir orientação veterinária para número de doses e intervalo.",
    administrationNotes: "Via subcutânea."
  },
  {
    id: "v4_felina",
    name: "V4 (Quádrupla Felina)",
    species: ["Gato"] as PetSpecies[],
    preventsDiseases: ["Rinotraqueíte Viral Felina", "Calicivirose Felina", "Panleucopenia Felina", "Clamidiose Felina"],
    importance: "Essencial",
    recommendedDoses: ["1ª dose (6-8 semanas)", "2ª dose (9-11 semanas)", "3ª dose (12-14 semanas)", "Reforço Anual"],
    primarySeriesIntervalDays: 21,
    boosterFrequencySuggestion: "Anual",
    notes: "Inclui proteção contra Clamidiose. Seguir orientação veterinária.",
    administrationNotes: "Via subcutânea."
  },
  {
    id: "v5_felina",
    name: "V5 (Quíntupla Felina)",
    species: ["Gato"] as PetSpecies[],
    preventsDiseases: ["Rinotraqueíte Viral Felina", "Calicivirose Felina", "Panleucopenia Felina", "Clamidiose Felina", "Leucemia Viral Felina (FeLV)"],
    importance: "Essencial (para gatos com risco de FeLV)",
    recommendedDoses: ["1ª dose (a partir de 8 semanas, após teste negativo para FeLV)", "2ª dose (3-4 semanas após a 1ª)", "Reforço Anual"],
    primarySeriesIntervalDays: 21, // Entre 21 e 28 dias
    boosterFrequencySuggestion: "Anual",
    notes: "Recomendada para gatos com acesso à rua ou contato com outros gatos. Teste prévio para FeLV é essencial.",
    administrationNotes: "Via subcutânea."
  },
  {
    id: "felv_felina",
    name: "FeLV (Leucemia Felina)",
    species: ["Gato"] as PetSpecies[],
    preventsDiseases: ["Leucemia Viral Felina (FeLV)"],
    importance: "Essencial (para gatos com risco)",
    recommendedDoses: ["1ª dose (a partir de 8 semanas, após teste negativo)", "2ª dose (3-4 semanas após a 1ª)", "Reforço Anual"],
    primarySeriesIntervalDays: 21,
    boosterFrequencySuggestion: "Anual",
    notes: "Pode ser administrada separadamente ou como parte da V5. Teste prévio negativo é crucial.",
    administrationNotes: "Via subcutânea."
  },
  // --- Vacina Comum (Cães e Gatos) ---
  {
    id: "antirrabica",
    name: "Antirrábica",
    species: ["Cão", "Gato", "Furão"] as PetSpecies[], // Incluindo Furão
    preventsDiseases: ["Raiva"],
    importance: "Essencial (Obrigatória por Lei)",
    recommendedDoses: ["Dose única (a partir de 12 semanas)", "Reforço Anual"],
    primarySeriesIntervalDays: 0, // Dose única na primovacinação
    boosterFrequencySuggestion: "Anual",
    notes: "Obrigatória por lei na maioria dos locais. Fundamental para saúde pública.",
    administrationNotes: "Via subcutânea ou intramuscular, dependendo do produto e espécie."
  },
  // --- Vacinas para Outras Espécies (Exemplos) ---
  {
    id: "mixomatose_coelho",
    name: "Mixomatose (Coelho)",
    species: ["Coelho"] as PetSpecies[],
    preventsDiseases: ["Mixomatose"],
    importance: "Essencial",
    recommendedDoses: ["1ª dose (a partir de 5 semanas)", "Reforço Anual ou Semestral (dependendo da região e risco)"],
    primarySeriesIntervalDays: 0,
    boosterFrequencySuggestion: "Anual/Semestral",
    notes: "Doença viral grave em coelhos. Verificar disponibilidade e recomendação local.",
    administrationNotes: "Via subcutânea."
  },
  {
    id: "dhv_coelho",
    name: "Doença Hemorrágica Viral (Coelho)",
    species: ["Coelho"] as PetSpecies[],
    preventsDiseases: ["Doença Hemorrágica Viral (DHV/RHD)"],
    importance: "Essencial",
    recommendedDoses: ["1ª dose (a partir de 10 semanas)", "Reforço Anual"],
    primarySeriesIntervalDays: 0,
    boosterFrequencySuggestion: "Anual",
    notes: "Doença altamente contagiosa e fatal. Verificar variantes (RHDV1, RHDV2) e vacina adequada.",
    administrationNotes: "Via subcutânea."
  },
  {
    id: "pasteurelose_coelho",
    name: "Pasteurelose (Coelho)",
    species: ["Coelho"] as PetSpecies[],
    preventsDiseases: ["Pasteurelose (associada a Pasteurella multocida)"],
    importance: "Complementar",
    recommendedDoses: ["Consultar veterinário"],
    primarySeriesIntervalDays: null,
    boosterFrequencySuggestion: "Consultar veterinário",
    notes: "Vacina menos comum, usada em situações específicas ou criações. Consultar veterinário especializado.",
    administrationNotes: "Via subcutânea."
  },
  {
    id: "cinomose_furao",
    name: "Cinomose (Furão)",
    species: ["Furão"] as PetSpecies[],
    preventsDiseases: ["Cinomose"],
    importance: "Essencial",
    recommendedDoses: ["1ª dose (6-8 semanas)", "2ª dose (9-11 semanas)", "3ª dose (12-14 semanas)", "Reforço Anual"],
    primarySeriesIntervalDays: 21,
    boosterFrequencySuggestion: "Anual",
    notes: "Furões são altamente suscetíveis à cinomose. Usar vacina específica para furões ou de vírus vivo modificado de origem canina (com cautela e recomendação veterinária).",
    administrationNotes: "Via subcutânea."
  },
  // Adicionar outras vacinas conforme necessário
];

export const vaccineBoosterFrequencies: VaccineBoosterFrequencySelected[] = ["Anual", "Semestral", "Trimestral", "Mensal", "A cada 2 anos", "A cada 3 anos", "Não se aplica", "Outra"];

export const vaccineCategories: VaccineCategory[] = ["Essencial", "Complementar", "Não essencial", "Obrigatória por Lei"];

export const antipulgasProductTypes: AntipulgasProductType[] = ["Pipeta (Spot-on)", "Comprimido Oral", "Coleira", "Spray", "Shampoo", "Talco", "Injetável", "Outro"];

export const medicalDocumentTypes: MedicalDocumentType[] = ["Exame de Sangue", "Exame de Urina", "Exame de Fezes", "Raio-X", "Ultrassom", "Ecocardiograma", "Eletrocardiograma (ECG)", "Endoscopia", "Colonoscopia", "Ressonância Magnética (RM)", "Tomografia Computadorizada (TC)", "Biópsia", "Citologia", "Cultura e Antibiograma", "Teste Sorológico (Leishmaniose, FIV/FeLV, etc.)", "Receita Médica", "Atestado Veterinário", "Laudo de Exame", "Outro"];

export const petIdGenerator = (): string => {
  const timestamp = Date.now().toString(36); // Base 36 for shorter string
  const randomPart = Math.random().toString(36).substring(2, 8); // 6 random chars
  return `pet_${timestamp}_${randomPart}`;
};
