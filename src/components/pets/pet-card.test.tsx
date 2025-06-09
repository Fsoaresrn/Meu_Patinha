import { render, screen } from '@testing-library/react';
import { PetCard } from './pet-card'; // Adjust path as necessary
import type { Pet } from '@/types';
import '@testing-library/jest-dom';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { fill, ...rest } = props;
    const newProps: any = { ...rest };
    if (fill) {
      newProps['data-fill'] = 'true';
    }
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...newProps} />;
  },
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

// Mock hooks used by PetCard
jest.mock('@/hooks/use-local-storage', () => ({
  useLocalStorage: jest.fn(() => [[], jest.fn()]), // Mock return value for [allPets, setAllPets]
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(() => ({ toast: jest.fn() })), // Mock return value for { toast }
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  PawPrint: () => <div data-testid="pawprint-icon" />,
  Edit3: () => <div data-testid="edit3-icon" />,
  Trash2: () => <div data-testid="trash2-icon" />,
  AlertTriangle: () => <div data-testid="alerttriangle-icon" />,
}));


const mockPet: Pet = {
  id: '1',
  nome: 'Buddy',
  especie: 'Cachorro',
  raca: 'Golden Retriever',
  sexo: 'Macho',
  dataNascimento: '2020-01-15',
  fotoUrl: 'http://example.com/buddy.jpg',
  status: { value: 'ativo', label: 'Ativo' },
  porte: 'Grande',
  peso: 30,
  castrado: true,
  microchip: '123456789',
  adicional: {
    vacinas: [],
    doencas: [],
    medicamentos: [],
    observacoes: 'Amigável e brincalhão',
  },
  tutorId: 'user123',
  registradoEm: '2021-01-01T10:00:00Z',
};

describe('PetCard', () => {
  it('renders the Image component with correct props and parent style', () => {
    render(<PetCard pet={mockPet} />);

    const image = screen.getByAltText(`Foto de ${mockPet.nome}`);

    // Assertions for the Image component
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockPet.fotoUrl);

    // For Next.js 13+ `fill` prop, it might not directly translate to a 'fill' attribute on a simple img mock.
    // Instead, it controls how the image is styled. The mock passes all props through.
    // So, we check if the `fill` prop was passed to our mock.
    // If Next.js internally translates `fill` to specific styles or other data attributes,
    // those would be harder to check with this simple mock.
    // However, the prompt asks to "Assert that it has the fill attribute".
    // We are now checking for data-fill="true" due to the updated mock.
    expect(image).toHaveAttribute('data-fill', 'true');
    expect(image).not.toHaveAttribute('layout');

    // Assertion for the parent Link component's class
    // The parent of the Image is the Link component
    const parentLink = image.parentElement;
    expect(parentLink).toBeInTheDocument();
    expect(parentLink).toHaveClass('relative');
    // Also check it's an anchor tag due to our Link mock
    expect(parentLink?.tagName).toBe('A');
    expect(parentLink).toHaveAttribute('href', `/pets/${mockPet.id}`);
  });

  it('renders placeholder image if fotoUrl is not provided', () => {
    const petWithoutPhoto = { ...mockPet, fotoUrl: undefined };
    render(<PetCard pet={petWithoutPhoto} />);

    const image = screen.getByAltText(`Foto de ${petWithoutPhoto.nome}`);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', `https://placehold.co/400x300.png?text=${encodeURIComponent(petWithoutPhoto.nome.charAt(0))}`);
  });
});
