'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function EspacoPetloversPage() {
  const [uf, setUf] = useState('');
  const [cidade, setCidade] = useState('');
  const [location, setLocation] = useState<{ uf: string; cidade: string } | null>(null);

  const handleSearch = () => {
    setLocation({ uf, cidade });
    // In a real application, you would fetch data based on UF and Cidade here
    // and potentially update the map display.
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Espaço Petlovers</h1>

      <div className="mb-6 p-4 border rounded-md">
        <h2 className="text-xl font-semibold mb-4">Buscar por Localidade</h2>
        <div className="flex space-x-4">
          <Input
            placeholder="UF"
            value={uf}
            onChange={(e) => setUf(e.target.value)}
            className="w-24"
          />
          <Input
            placeholder="Cidade"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            className="flex-grow"
          />
          <Button onClick={handleSearch}>Buscar</Button>
        </div>
      </div>

      <div className="mb-6 p-4 border rounded-md">
        <h2 className="text-xl font-semibold mb-4">Localizar no Mapa</h2>
        <p>
          Implementação do Google Maps ou outro serviço de mapas para exibir locais Pet-friendly
          próximos.
        </p>
        {/* Map integration would go here */}
        <div className="w-full h-96 bg-gray-200 flex items-center justify-center text-gray-500">
          Mapa será exibido aqui
        </div>
      </div>

      {location && (
        <div className="p-4 border rounded-md">
          <h2 className="text-xl font-semibold mb-4">Locais encontrados em {location.cidade}, {location.uf}</h2>
          {/* Display list of found pet-friendly locations here */}
          <p>Resultados da busca serão exibidos aqui.</p>
        </div>
      )}
    </div>
  );
}