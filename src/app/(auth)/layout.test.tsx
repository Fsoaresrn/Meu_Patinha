import { render, screen } from '@testing-library/react';
import AuthLayout from './layout'; // Adjust path as necessary
import '@testing-library/jest-dom';

// Mock next/image if direct props aren't accessible or it causes issues
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { priority, ...rest } = props;
    const newProps: any = { ...rest };
    if (priority) {
      newProps['data-priority'] = 'true';
    }
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...newProps} />;
  },
}));

// Mock Logo component
jest.mock('@/components/shared/logo', () => ({
  __esModule: true,
  Logo: () => <div data-testid="logo-mock">Logo</div>,
}));

describe('AuthLayout', () => {
  it('renders the Image component with correct props and parent style', () => {
    render(<AuthLayout><div>Children</div></AuthLayout>);

    const image = screen.getByAltText('Imagem com diversos pets amigáveis');

    // Assertions for the Image component
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/petz.jpeg'); // src is processed by the mock
    expect(image).toHaveAttribute('width', '1536');
    expect(image).toHaveAttribute('height', '1024');
    expect(image).not.toHaveAttribute('layout');
    expect(image).toHaveAttribute('data-priority', 'true'); // Check for data-priority

    // Assertion for the parent div's style
    // The parent div is identified by className in the component,
    // but it's easier to grab it via the image and then .parentElement
    const parentDiv = image.parentElement;
    expect(parentDiv).toHaveStyle('display: inline-block');
    expect(parentDiv).toHaveStyle('max-width: 100%');
    // Check for existing classes as well to ensure we got the right parent
    expect(parentDiv).toHaveClass('hidden md:flex md:w-1/2 lg:w-3/5');
  });
});
