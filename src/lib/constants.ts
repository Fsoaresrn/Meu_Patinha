
import type { PetSpecies, VaccineProtocolInfo } from "@/types";

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
  // Cães
  { id: "v8-v10", name: "V8/V10 (Polivalente Canina)", species: ["Cão"], description: "Protege contra cinomose, parvovirose, hepatite infecciosa, adenovirose, coronavirose, parainfluenza e leptospirose.", recommendedDoses: ["1ª dose (6-8 semanas)", "2ª dose (10-12 semanas)", "3ª dose (14-16 semanas)"], boosterInfo: "Reforço anual." },
  { id: "antirrabica-cao", name: "Antirrábica (Cães)", species: ["Cão"], description: "Protege contra a raiva.", recommendedDoses: ["Dose única (a partir de 12 semanas)"], boosterInfo: "Reforço anual." },
  { id: "gripe-canina", name: "Gripe Canina (Tosse dos Canis)", species: ["Cão"], description: "Protege contra Bordetella bronchiseptica e/ou Parainfluenza.", recommendedDoses: ["Pode variar: 1 ou 2 doses iniciais"], boosterInfo: "Reforço anual, especialmente para cães com alto contato." },
  { id: "giardia-cao", name: "Giárdia (Cães)", species: ["Cão"], description: "Protege contra a giardíase.", recommendedDoses: ["2 doses iniciais com intervalo de 2-4 semanas"], boosterInfo: "Reforço anual, dependendo do risco." },
  { id: "leishmaniose", name: "Leishmaniose", species: ["Cão"], description: "Protege contra a leishmaniose visceral canina.", recommendedDoses: ["3 doses iniciais com intervalo de 21 dias"], boosterInfo: "Reforço anual. Teste sorológico prévio é necessário." },
  // Gatos
  { id: "v3-v4-v5", name: "V3/V4/V5 (Polivalente Felina)", species: ["Gato"], description: "V3: Panleucopenia, Calicivirose, Rinotraqueíte. V4 adiciona Clamidiose. V5 adiciona Leucemia Felina (FeLV).", recommendedDoses: ["1ª dose (6-8 semanas)", "2ª dose (10-12 semanas)", "3ª dose (14-16 semanas, para V5/FeLV pode ser diferente)"], boosterInfo: "Reforço anual. Teste para FeLV/FIV recomendado antes da vacina de FeLV." },
  { id: "antirrabica-gato", name: "Antirrábica (Gatos)", species: ["Gato"], description: "Protege contra a raiva.", recommendedDoses: ["Dose única (a partir de 12 semanas)"], boosterInfo: "Reforço anual." },
  { id: "felv", name: "FeLV (Leucemia Felina)", species: ["Gato"], description: "Protege contra o vírus da leucemia felina. Apenas para gatos FeLV negativos.", recommendedDoses: ["2 doses iniciais (a partir de 8 semanas) com intervalo de 3-4 semanas"], boosterInfo: "Reforço anual para gatos em risco." },
];

export const activityTypes: string[] = ["Passeio", "Alimentação", "Brincadeira", "Viagem", "Hospedagem", "Visita ao Veterinário", "Outro"];
export const hygieneTypes: string[] = ["Banho", "Tosa", "Escovação de Dentes", "Corte de Unhas", "Limpeza de Orelhas", "Outro"];

export const petIdGenerator = (): string => {
  const year = new Date().getFullYear();
  // Generates an 11-character random alphanumeric string
  const randomPart = Math.random().toString(36).substring(2, 13).toUpperCase();
  return `${year}-${randomPart}`;
};

