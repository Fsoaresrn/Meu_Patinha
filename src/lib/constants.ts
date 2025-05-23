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

export const petSpeciesList: PetSpecies[] = ["Cachorro", "Gato"];

export const dogBreeds = [
  "Labrador Retriever", "Golden Retriever", "Poodle", "Bulldog Francês", "Pastor Alemão", 
  "Beagle", "Yorkshire Terrier", "Shih Tzu", "Boxer", "Dachshund (Salsicha)", 
  "SRD (Sem Raça Definida)", "Outra"
];
export const catBreeds = [
  "Siamês", "Persa", "Maine Coon", "Bengal", "Ragdoll", 
  "Sphynx", "British Shorthair", "SRD (Sem Raça Definida)", "Outra"
];

export const furTypesBySpecies: Record<PetSpecies, string[]> = {
  Cachorro: ["Curta", "Média", "Longa", "Dupla Camada", "Encaracolada", "Lisa", "Dura/Áspera", "Sem Pelo", "Outra"],
  Gato: ["Curta", "Média", "Longa", "Sem Pelo", "Outra"],
};

export const furColorsBySpecies: Record<PetSpecies, string[]> = {
  Cachorro: ["Preto", "Branco", "Marrom (Chocolate, Fígado)", "Dourado", "Amarelo", "Creme", "Cinza (Azul)", "Vermelho", "Tricolor", "Bicolor", "Merle", "Tigrado", "Outra"],
  Gato: ["Preto", "Branco", "Cinza (Azul)", "Laranja (Vermelho)", "Creme", "Marrom (Chocolate)", "Lilás", "Tricolor (Cálico)", "Bicolor", "Escama (Tortoiseshell)", "Siamês (Pointed)", "Tigrado (Tabby)", "Outra"],
};

export const petSizesList: string[] = ["Pequeno", "Médio", "Grande", "Gigante"];
export const petGendersList: string[] = ["Macho", "Fêmea", "Não especificado"];
export const yesNoOptions: ("Sim" | "Não")[] = ["Sim", "Não"];

export const acquisitionTypes: string[] = [
  "Comprado", "Adotado (Abrigo/ONG)", "Adotado (Particular)",
  "Resgatado", "Presente", "Nasceu em casa", "Outro"
];

export const petPurposes: string[] = [
  "Companhia", "Guarda", "Trabalho (e.g., cão-guia, pastoreio)",
  "Esporte/Competição", "Reprodução", "Outro"
];

export const vaccineProtocols: VaccineProtocolInfo[] = [
  // Cães
  { id: "v8-v10", name: "V8/V10 (Polivalente Canina)", species: ["Cachorro"], description: "Protege contra cinomose, parvovirose, hepatite infecciosa, adenovirose, coronavirose, parainfluenza e leptospirose.", recommendedDoses: ["1ª dose (6-8 semanas)", "2ª dose (10-12 semanas)", "3ª dose (14-16 semanas)"], boosterInfo: "Reforço anual." },
  { id: "antirrabica-cao", name: "Antirrábica (Cães)", species: ["Cachorro"], description: "Protege contra a raiva.", recommendedDoses: ["Dose única (a partir de 12 semanas)"], boosterInfo: "Reforço anual." },
  { id: "gripe-canina", name: "Gripe Canina (Tosse dos Canis)", species: ["Cachorro"], description: "Protege contra Bordetella bronchiseptica e/ou Parainfluenza.", recommendedDoses: ["Pode variar: 1 ou 2 doses iniciais"], boosterInfo: "Reforço anual, especialmente para cães com alto contato." },
  { id: "giardia-cao", name: "Giárdia (Cães)", species: ["Cachorro"], description: "Protege contra a giardíase.", recommendedDoses: ["2 doses iniciais com intervalo de 2-4 semanas"], boosterInfo: "Reforço anual, dependendo do risco." },
  { id: "leishmaniose", name: "Leishmaniose", species: ["Cachorro"], description: "Protege contra a leishmaniose visceral canina.", recommendedDoses: ["3 doses iniciais com intervalo de 21 dias"], boosterInfo: "Reforço anual. Teste sorológico prévio é necessário." },
  // Gatos
  { id: "v3-v4-v5", name: "V3/V4/V5 (Polivalente Felina)", species: ["Gato"], description: "V3: Panleucopenia, Calicivirose, Rinotraqueíte. V4 adiciona Clamidiose. V5 adiciona Leucemia Felina (FeLV).", recommendedDoses: ["1ª dose (6-8 semanas)", "2ª dose (10-12 semanas)", "3ª dose (14-16 semanas, para V5/FeLV pode ser diferente)"], boosterInfo: "Reforço anual. Teste para FeLV/FIV recomendado antes da vacina de FeLV." },
  { id: "antirrabica-gato", name: "Antirrábica (Gatos)", species: ["Gato"], description: "Protege contra a raiva.", recommendedDoses: ["Dose única (a partir de 12 semanas)"], boosterInfo: "Reforço anual." },
  { id: "felv", name: "FeLV (Leucemia Felina)", species: ["Gato"], description: "Protege contra o vírus da leucemia felina. Apenas para gatos FeLV negativos.", recommendedDoses: ["2 doses iniciais (a partir de 8 semanas) com intervalo de 3-4 semanas"], boosterInfo: "Reforço anual para gatos em risco." },
];

export const activityTypes: string[] = ["Passeio", "Alimentação", "Brincadeira", "Viagem", "Hospedagem", "Visita ao Veterinário", "Outro"];
export const hygieneTypes: string[] = ["Banho", "Tosa", "Escovação de Dentes", "Corte de Unhas", "Limpeza de Orelhas", "Outro"];

export const petIdGenerator = (): string => {
  const year = new Date().getFullYear();
  // Generates a 9-character random string
  const randomPart = Math.random().toString(36).substring(2, 11).toUpperCase();
  return `${year}-${randomPart}`;
};
