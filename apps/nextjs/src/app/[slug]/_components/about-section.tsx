export function AboutSection() {
  return (
    <div id="sobre" className="rounded-lg border p-6 shadow">
      <h3 className="mb-4 text-xl font-bold">SOBRE NÓS</h3>
      <div className="h-full space-y-4">
        <p>
          A BarbershopAlex nasceu da paixão por transformar a experiência
          masculina de cuidados pessoais. Fundada em 2018, nossa barbearia
          combina técnicas tradicionais com tendências modernas, oferecendo um
          ambiente acolhedor onde nossos clientes podem relaxar enquanto recebem
          um serviço de alta qualidade.
        </p>
        <div className="mt-auto flex gap-4 pt-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">5+</div>
            <div className="text-sm">Anos de experiência</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">4</div>
            <div className="text-sm">Barbeiros profissionais</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">1000+</div>
            <div className="text-sm">Clientes satisfeitos</div>
          </div>
        </div>
      </div>
    </div>
  );
}
