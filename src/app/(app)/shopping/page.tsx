
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function ShoppingPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto shadow-lg border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShoppingCart className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Shopping Pet</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Encontre os melhores produtos para o seu companheiro. Rações, brinquedos, acessórios e muito mais!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <Image
            src="https://placehold.co/300x200.png?text=🛍️+🦴+🧸"
            alt="Produtos para pet"
            width={300}
            height={200}
            className="mx-auto mb-6 rounded-lg shadow-md"
            data-ai-hint="pet products shopping"
          />
          <p className="text-muted-foreground text-left">
            A funcionalidade de "Shopping Pet" está em desenvolvimento. Futuramente, você poderá:
          </p>
          <ul className="list-disc list-inside text-left text-sm text-muted-foreground space-y-1 pl-4">
            <li><strong>Navegar por Categorias:</strong> Alimentos, brinquedos, higiene, farmácia, acessórios, etc.</li>
            <li><strong>Buscar Produtos:</strong> Encontre itens específicos pelo nome ou marca.</li>
            <li><strong>Ver Detalhes do Produto:</strong> Descrições, fotos, avaliações.</li>
            <li><strong>Adicionar ao Carrinho:</strong> (Funcionalidade futura) Simulação de compra.</li>
            <li><strong>Ofertas Especiais:</strong> Promoções e descontos.</li>
          </ul>
          
          <div className="mt-6">
            <Button asChild size="lg" disabled> {/* Botão desabilitado por enquanto */}
              <Link href="#"> {/* Link para futura página de busca de produtos */}
                <Search className="mr-2 h-5 w-5" />
                Explorar Produtos (Em breve)
              </Link>
            </Button>
          </div>
           <p className="text-xs text-muted-foreground mt-8">
            Em breve, uma loja completa para o seu pet, integrada ao Meu Patinha!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
