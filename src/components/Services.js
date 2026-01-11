export default function Services() {
  // criando a lista de dados
  const listaServicos = [
  {
    titulo: "Diágnostico Técnico",
    descricao: "Análise completa para um orçamento honesto e preciso"
  },
  {
    titulo: "Higienização Completa",
    descricao: "Removemos poeira e resíduos que causam superaquecimento."
  },
  {
    titulo: "Montagem de PCs",
    descricao: "Seja para trabalho ou jogos, montamos a máquina ideal."
  },
  {
    titulo: "Formatação e Otimização",
    descricao: "Eliminamos erros e garantimos a velocidade do sistema."
  },
  {
    titulo: "Remoção de Vírus",
    descricao: "Proteja seus dados. Removemos ameaças e blindamos o sistema."
  }
  ];

  return (
    <section id="servicos" className="py-20 bg-[#000717]">
      <div className="container mx-auto px-5 text-center">
        <h2 className="text-3xl font-bold text-white mb-10">Nossos Serviços</h2>
        
        {/* o .map percorre a lista e cria os cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {listaServicos.map((servico, index) => (
            <div 
              key={index} 
              className="bg-[#182237] p-8 rounded-lg border border-blue-900/30 hover:border-blue-500 transition-colors text-center shadow-lg"
            >
              <h4 className="text-blue-400 font-bold text-xl mb-3">{servico.titulo}</h4>
              <p className="text-gray-400">{servico.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}