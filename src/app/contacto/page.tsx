import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contacto — SendHope Venezuela",
  description: "Contáctanos para coordinar donaciones físicas en Barquisimeto o resolver dudas. Iniciativa sin fines de lucro.",
};

export default function ContactoPage() {
  return (
    <>
      <Header />
      <main className="bg-cream min-h-screen py-16 px-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-10">
          {/* Header */}
          <div className="text-center">
            <span className="font-mono text-xs text-gold font-bold tracking-[0.2em] uppercase">
              Contacto y Coordinación
            </span>
            <h1 className="font-sans font-800 text-[#0A1628] text-3xl md:text-5xl mt-2 mb-4 tracking-tight">
              Ponte en contacto
            </h1>
            <p className="font-sans text-sm md:text-base text-muted max-w-xl mx-auto leading-relaxed">
              ¿Tienes dudas, deseas colaborar o quieres coordinar la entrega de donaciones físicas en Barquisimeto? Escríbenos directamente.
            </p>
          </div>

          {/* Tarjeta Informativa de la Labor */}
          <div className="bg-white border border-[#003082]/10 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col gap-4">
            <h2 className="font-sans font-bold text-lg text-navy flex items-center gap-2">
              <span>🎗</span> Nuestra labor humanitaria
            </h2>
            <p className="font-sans text-sm text-[#0A1628] leading-relaxed">
              <strong>SendHope Venezuela</strong> es una organización independiente y **sin fines lucrativos** nacida en respuesta a la tragedia del terremoto del 24 de julio. Adquirimos insumos en Barquisimeto y Caracas y los distribuimos directamente en centros de acopio oficiales y refugios para damnificados en **Caracas, La Guaira y Barquisimeto**.
            </p>
            <div className="w-full h-px bg-[#003082]/5 my-2" />
            <p className="font-sans text-xs text-muted leading-relaxed">
              Garantizamos transparencia total: cada dólar o bolívar donado se destina a compras directas de alimentos, medicinas y agua, las cuales se publican con factura digitalizada y foto de entrega en nuestro Muro de Transparencia.
            </p>
          </div>

          {/* Opciones de contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Correo */}
            <div className="bg-white border border-[#003082]/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4">
              <div>
                <span className="text-2xl">✉</span>
                <h3 className="font-sans font-bold text-base text-[#0A1628] mt-2 mb-1">Correo Electrónico</h3>
                <p className="font-sans text-xs text-muted leading-relaxed">
                  Para propuestas institucionales, soporte, dudas sobre transferencias o reportes administrativos.
                </p>
              </div>
              <a
                href="mailto:sendhopevenezuela@gmail.com"
                className="block font-mono font-bold text-sm text-navy hover:text-navy-mid break-all"
              >
                sendhopevenezuela@gmail.com
              </a>
            </div>

            {/* Donaciones Físicas */}
            <div className="bg-white border border-[#003082]/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4">
              <div>
                <span className="text-2xl">📦</span>
                <h3 className="font-sans font-bold text-base text-[#0A1628] mt-2 mb-1">Donaciones Físicas</h3>
                <p className="font-sans text-xs text-muted leading-relaxed">
                  Puedes coordinar la entrega de ropa, cobijas, agua o alimentos directamente en Barquisimeto vía WhatsApp:
                </p>
              </div>
              <div className="flex flex-col gap-2 font-mono text-sm text-navy">
                <a
                  href="https://wa.me/584129292701"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-navy-mid flex items-center gap-1.5"
                >
                  💬 0412-9292701
                </a>
                <a
                  href="https://wa.me/584121519715"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-navy-mid flex items-center gap-1.5"
                >
                  💬 0412-1519715
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
