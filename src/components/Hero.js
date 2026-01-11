export default function Hero() {
  return (
    <section className="flex flex-col items-center py-20 px-5 text-center">
      <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white">
        Computador lento? Com vírus? <br />
        <span className="text-blue-600">Nós resolvemos</span>
      </h1>
      
      <div className="mt-6">
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          Soluções completas em tecnologia para deixar o seu equipamento como novo.
        </p>
        <p className="text-gray-400">
          Atendimento rápido e de confiança.
        </p>
      </div>

      <a 
        href="https://wa.me/5512996065673?text=Olá! Vi o seu site e gostaria de falar com um técnico."
        target="_blank"
        className="no-underline mt-12 bg-blue-500 hover:scale-105 transition-all duration-300 text-white px-8 py-4 rounded-full font-bold text-xl shadow-[0_0_20px_rgba(14,179,255,0.4)]"
      >
        FALAR COM TÉCNICO
      </a>
    </section>
  );
}