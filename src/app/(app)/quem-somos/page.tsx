import React from 'react';

const QuemSomosPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Quem Somos</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Nossa Equipe</h2>
        <p className="text-gray-700">
          Somos um grupo apaixonado por pets e tecnologia, dedicados a criar soluções que facilitem a vida de tutores e seus companheiros peludos. Nossa equipe é formada por desenvolvedores, designers, veterinários e entusiastas de animais, todos unidos pelo objetivo de promover o bem-estar animal e fortalecer o vínculo entre pets e seus humanos.
        </p>
        {/* You can add more details about team members or roles here */}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Nossos Valores</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>Amor e Respeito pelos Animais: O bem-estar dos pets é nossa prioridade.</li>
          <li>Inovação Contínua: Buscamos sempre as melhores soluções tecnológicas para atender às necessidades dos tutores.</li>
          <li>Transparência e Confiança: Construímos uma relação de confiança com nossos usuários através da comunicação clara e honesta.</li>
          <li>Comunidade: Fomentamos um espaço de apoio e troca de experiências entre petlovers.</li>
          <li>Responsabilidade Social: Contribuímos para causas relacionadas à proteção animal.</li>
        </ul>
      </section>
    </div>
  );
};

export default QuemSomosPage;