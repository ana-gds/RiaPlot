import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../components/ui/BackButton.jsx";
import { ChevronDownIcon, WarningIcon } from "../components/ui/Icons.jsx";

const SUPPORT_EMAIL = "suporte@riaplot.pt";
const APP_VERSION = "1.0";

const FAQS = [
  {
    q: "Como planeio uma rota no mapa?",
    a: "Na página Mapa, toca em “Planear Rota” e escolhe uma das rotas. Depois usa “Simular” para veres o nível de água ao longo do percurso, ajustado ao calado da tua embarcação e à maré.",
  },
  {
    q: "O que significa a barra de dificuldade?",
    a: "Resume a exigência da rota — de Fácil a Muito difícil — com base no calado máximo recomendado e nas condições de maré. Quantos mais segmentos preenchidos, mais exigente é a rota.",
  },
  {
    q: "Como sei se passo com o meu barco?",
    a: "Na página de detalhe da rota comparamos o calado do barco que tens registado com o calado máximo da rota e a maré atual da barra de Aveiro, e mostramos uma indicação de navegabilidade. Regista o teu barco em Definições do barco.",
  },
  {
    q: "Como guardo uma rota?",
    a: "Toca no ícone de marcador na rota, seja na lista ou na página de detalhe. As rotas guardadas aparecem no separador “Rotas” do teu perfil, onde podes pesquisar e ordenar por nome, dificuldade ou distância.",
  },
  {
    q: "Como partilho uma aventura?",
    a: "Na página Social, toca no botão “+” para criares uma publicação com fotos, localização e, se quiseres, o traçado GPX do percurso.",
  },
  {
    q: "Como torno a minha conta privada?",
    a: "Em Definições › Privacidade, ativa “Conta privada”. A partir daí, novos seguidores precisam da tua aprovação e só eles veem as tuas publicações. Aí também podes esconder a localização, as listas de seguidores e sair da pesquisa.",
  },
  {
    q: "Como bloqueio ou denuncio alguém?",
    a: "No perfil dessa pessoa, usa os botões no canto superior direito. Quem bloqueias deixa de ver o teu perfil e de interagir contigo, e deixam de se seguir mutuamente.",
  },
  {
    q: "Como elimino a minha conta?",
    a: "Em Definições da conta, no fundo da página, toca em “Eliminar conta”. A ação é permanente e remove todos os teus dados (publicações, embarcações, comentários e notificações).",
  },
];

const GLOSSARY = [
  ["Calado", "Profundidade a que o casco se afunda na água. Determina a água mínima necessária para navegar sem encalhar."],
  ["Maré (PM / BM)", "Variação periódica do nível do mar. PM = preia-mar (nível máximo); BM = baixa-mar (nível mínimo)."],
  ["Barra", "Zona de entrada e saída entre o mar e a ria. Costuma ser pouco profunda e sujeita a correntes."],
  ["Cais", "Estrutura de atracação onde se amarra a embarcação — é o ponto de partida e de chegada das rotas."],
  ["Boia / Baliza", "Marcas de navegação que delimitam o canal (bombordo a vermelho, estibordo a verde)."],
  ["Barlavento / Sotavento", "Barlavento é o lado de onde sopra o vento; sotavento é o lado abrigado."],
];

function SectionTitle({ children }) {
  return (
    <h2 className="flex items-center gap-2 text-base font-bold text-dark mb-3">
      <span className="w-1 h-4 rounded-full bg-primary" />
      {children}
    </h2>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rounded-2xl border transition-colors ${
        open ? "border-primary/40 bg-cream/60" : "border-divider bg-white"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-3 w-full px-4 py-3.5 text-left"
      >
        <span className="flex-1 text-sm font-semibold text-dark">{q}</span>
        <span
          className={`flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full transition-all ${
            open ? "bg-primary text-white rotate-180" : "bg-secondary/10 text-secondary"
          }`}
        >
          <ChevronDownIcon size={15} />
        </span>
      </button>
      {open && (
        <p className="px-4 pb-4 text-[13px] leading-relaxed text-dark/70">{a}</p>
      )}
    </div>
  );
}

// Cores alternadas para os emblemas do glossário — dão vida sem destoar.
const GLOSSARY_ACCENTS = [
  "from-primary to-warning-soft",
  "from-secondary to-[#126587]",
];

function GlossaryItem({ term, def, index }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-divider bg-white p-3.5">
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br ${
          GLOSSARY_ACCENTS[index % GLOSSARY_ACCENTS.length]
        } flex items-center justify-center text-white text-sm font-bold`}
      >
        {term.charAt(0)}
      </div>
      <div className="min-w-0">
        <dt className="text-sm font-semibold text-dark">{term}</dt>
        <dd className="text-[13px] leading-relaxed text-dark/70 mt-0.5">{def}</dd>
      </div>
    </div>
  );
}

export default function Help() {
  const navigate = useNavigate();

  return (
    <>
      <div className="px-4 pt-2 pb-3">
        <BackButton />
      </div>

      <div className="px-4 pt-2">
        <h1 className="text-xl font-bold text-dark">Ajuda</h1>
        <p className="text-xs text-dark/60 mt-1">Tudo o que precisas para tirares partido do RiaPlot.</p>
      </div>

      <div className="flex flex-col gap-7 px-4 mt-6 flex-1">
        {/* FAQ */}
        <section>
          <SectionTitle>Perguntas frequentes</SectionTitle>
          <div className="flex flex-col gap-2.5">
            {FAQS.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </section>

        {/* Glossário náutico */}
        <section>
          <SectionTitle>Glossário náutico</SectionTitle>
          <dl className="flex flex-col gap-2.5">
            {GLOSSARY.map(([term, def], i) => (
              <GlossaryItem key={term} term={term} def={def} index={i} />
            ))}
          </dl>
        </section>

        {/* Segurança no mar */}
        <section>
          <SectionTitle>Segurança no mar</SectionTitle>
          <div className="rounded-xl p-3.5 flex gap-3 bg-warning-bg border border-warning-soft">
            <WarningIcon size={18} />
            <p className="text-[13px] leading-relaxed text-dark/80">
              As marés, dificuldades e simulações do RiaPlot são <strong>estimativas</strong> com
              base na previsão da barra de Aveiro (FCUL/IH) e <strong>não substituem</strong> a
              leitura local das condições, a carta náutica oficial nem o teu bom senso. Verifica
              sempre a meteorologia e navega com segurança.
            </p>
          </div>
        </section>

        {/* Contacto */}
        <section>
          <SectionTitle>Contacto e suporte</SectionTitle>
          <p className="text-[13px] leading-relaxed text-dark/70 mb-3">
            Tens uma dúvida que não está aqui ou encontraste um problema? Fala connosco.
          </p>
          <div className="flex flex-col gap-2.5">
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-primary text-white text-sm font-semibold shadow-primary-button active:scale-[0.98] transition-transform"
            >
              Contactar o suporte
            </a>
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Reportar um problema — RiaPlot")}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-divider text-dark text-sm font-semibold active:scale-[0.98] transition-transform"
            >
              Reportar um problema
            </a>
          </div>
        </section>

        {/* Sobre */}
        <section>
          <SectionTitle>Sobre o RiaPlot</SectionTitle>
          <p className="text-[13px] leading-relaxed text-dark/70">
            O RiaPlot ajuda-te a planear e partilhar percursos de barco na Ria de Aveiro, com
            informação de marés e dificuldade adaptada à tua embarcação.
          </p>
          <p className="text-[13px] leading-relaxed text-dark/55 mt-3">
            Previsão de marés: FCUL / Instituto Hidrográfico. Cartografia: OpenStreetMap.
          </p>
          <button
            type="button"
            onClick={() => navigate("/profile/privacy")}
            className="text-[13px] font-semibold text-primary mt-3 active:scale-95"
          >
            Definições de privacidade
          </button>
          <p className="text-[11px] text-muted-soft mt-4">RIAPLOT v{APP_VERSION}</p>
        </section>
      </div>

      <div className="h-8" />
    </>
  );
}
