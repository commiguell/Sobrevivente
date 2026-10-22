export type GearCategory =
  | 'todas'
  | 'agua'
  | 'fogo'
  | 'corte'
  | 'abrigo'
  | 'comunicacao'
  | 'socorrismo';

export interface GearItem {
  id: string;
  name: string;
  category: GearCategory;
  categoryLabel: string;
  fieldVerdict: 'Indispensável' | 'Recomendado' | 'Tático';
  utilityScore: number; // e.g. 9.8
  weightGrams: number;
  specs: string;
  durability: string;
  priceEstimate: string;
  portugalContext: string;
  description: string;
  keyFeatures: string[];
  fieldTestingSummary: string;
}

export const GEAR_CATEGORIES: { id: GearCategory; label: string }[] = [
  { id: 'todas', label: 'Todos os Utensílios' },
  { id: 'agua', label: 'Água & Filtragem' },
  { id: 'fogo', label: 'Fogo & Calor' },
  { id: 'corte', label: 'Lâminas & Corte' },
  { id: 'abrigo', label: 'Abrigo & Tarp' },
  { id: 'comunicacao', label: 'Rádio & Orientação' },
  { id: 'socorrismo', label: 'Socorrismo & IFAK' },
];

export const SURVIVAL_GEAR_ITEMS: GearItem[] = [
  {
    id: 'filtro-sawyer-squeeze',
    name: 'Filtro de Membrana Oca 0.1 Mícron (Tipo Sawyer)',
    category: 'agua',
    categoryLabel: 'Água & Filtragem',
    fieldVerdict: 'Indispensável',
    utilityScore: 9.9,
    weightGrams: 85,
    specs: 'Poros de 0.1 mícron · Capacidade: até 370.000 litros · Fluxo: 1.5 L/min',
    durability: 'Vida útil plurianual com retrolavagem periódica',
    priceEstimate: '42 € – 55 €',
    portugalContext: 'Essencial nos cursos de água do Gerês, Estrela e Alqueva, onde a contaminação biológica por gado bovino/caprino ou javalis é frequente.',
    description: 'Sistema de filtragem mecânica absoluta que bloqueia 99.99999% de bactérias (Salmonella, E. coli) e 99.9999% de protozoários (Giardia, Cryptosporidium). Dispensa químicos ou baterias.',
    keyFeatures: [
      'Rosca padrão compatível com garrafas PET convencionais',
      'Pesa apenas 85g e cabe no bolso da farda ou anorak',
      'Inclui seringa de retrolavagem (backwash) para desobstrução imediata no campo',
    ],
    fieldTestingSummary: 'Testado no Rio Homem (Gerês) e Rio Zêzere. Filtragem límpida sem alteração de sabor.',
  },
  {
    id: 'garrafa-inox-parede-simples',
    name: 'Cantil / Garrafa em Aço Inox 1L (Parede Simples)',
    category: 'agua',
    categoryLabel: 'Água & Filtragem',
    fieldVerdict: 'Indispensável',
    utilityScore: 9.7,
    weightGrams: 210,
    specs: 'Aço Inoxidável 304 (18/8) alimentício · Capacidade: 1000 ml · Boca Larga 53mm',
    durability: 'Indestrutível sob uso normal, resistente a impacto e brasas diretas',
    priceEstimate: '22 € – 32 €',
    portugalContext: 'Permite desinfeção térmica de emergência colocando a garrafa desprovida de tampa diretamente sobre brasas de esteva ou sobreiro.',
    description: 'Recipiente de parede simples essencial para sobrevivência: ao contrário das garrafas térmicas de parede dupla que explodem se aquecidas, esta garrafa pode ser fervida diretamente sobre o fogo.',
    keyFeatures: [
      'Parede simples: pode ferver água diretamente nas brasas para esterilização',
      'Boca larga que facilita a recolha de água de poças rasas e limpeza',
      'Tampa estanque com anel em silicone alimentar e passador para mosquetão',
    ],
    fieldTestingSummary: '30 fervuras consecutivas em fogueira de campo sem qualquer deformação estrutural.',
  },
  {
    id: 'barra-ferrocerium-xl',
    name: 'Barra de Ferrocerium XL 12.7mm com Raspador de Carbeto',
    category: 'fogo',
    categoryLabel: 'Fogo & Calor',
    fieldVerdict: 'Indispensável',
    utilityScore: 9.8,
    weightGrams: 105,
    specs: 'Diâmetro 12.7mm (1/2") · Comprimento 127mm · Temperatura faíscas: 3.000 °C',
    durability: 'Mais de 20.000 golpes de raspagem',
    priceEstimate: '18 € – 26 €',
    portugalContext: 'Funciona perfeitamente após imersão em água e com os ventos fortes característicos das serras do Marão, Estrela ou costa vicentina.',
    description: 'A mais fiável ferramenta de ignição manual. Produz um chuveiro denso de faíscas incandescentes capazes de acender mechas de algodão carbonizado, resina de pinheiro bravo ou casca de bétula seca.',
    keyFeatures: [
      'Dimensão extra-larga (12.7mm) que garante empunhadura firme com luvas de trabalho',
      'Raspador em aço carbono com aresta a 90° afiada para máxima projeção de faíscas',
      'Não congela, não vaza e não é afetado por humidade atmosférica',
    ],
    fieldTestingSummary: 'Acendimento de isca em menos de 3 tentativas sob chuva miúda e vento a 35 km/h.',
  },
  {
    id: 'fole-telescopico-inox',
    name: 'Fole de Bolso Telescópico em Aço Inox (Pocket Bellows)',
    category: 'fogo',
    categoryLabel: 'Fogo & Calor',
    fieldVerdict: 'Recomendado',
    utilityScore: 9.2,
    weightGrams: 28,
    specs: 'Extensão: 9.5 cm a 48 cm · Aço Inox 304 polido · 8 segmentos telescópicos',
    durability: 'Alta resistência a corrosão e calor pontual',
    priceEstimate: '8 € – 12 €',
    portugalContext: 'Fundamental nos invernos húmidos do Norte de Portugal, onde a lenha de carvalho e pinheiro se encontra saturada de água.',
    description: 'Tubo telescópico que permite injetar um jato focado de oxigénio na base das brasas a uma distância segura, ressuscitando fogueiras quase extintas sem inalar fumos densos.',
    keyFeatures: [
      'Concentra o fluxo de oxigénio exatamente no núcleo da brasa',
      'Mantém o rosto e os olhos a 48cm de distância das faíscas e fumos tóxicos',
      'Formato caneta ultra-compacto que desaparece em qualquer bolso',
    ],
    fieldTestingSummary: 'Permitiu inflamar lenha húmida na Serra da Lousã em metade do tempo habitual.',
  },
  {
    id: 'faca-bushcraft-scandi',
    name: 'Faca Bushcraft Full Tang em Aço Carbono 1095',
    category: 'corte',
    categoryLabel: 'Lâminas & Corte',
    fieldVerdict: 'Indispensável',
    utilityScore: 9.9,
    weightGrams: 240,
    specs: 'Comprimento lâmina: 108mm · Espessura: 4.2mm · Dureza: 58-60 HRC · Bisel Scandi',
    durability: 'Construção maciça inteiriça (full-tang) com vida útil de décadas',
    priceEstimate: '75 € – 115 €',
    portugalContext: 'Cumpre estritamente o limite legal em Portugal para transporte justificado de campo (lâmina inferior a 11cm). Excelente para rachar pinho e entalhar lenha de sobreiro seco.',
    description: 'A ferramenta rainha da sobrevivência no terreno. A construção full tang suporta batoning agressivo em nós de madeira, desbaste de estacas e preparação de aparas finas (feather sticks).',
    keyFeatures: [
      'Bisel Scandi zero a 23° fácil de afiar no campo com qualquer pedra de rio lisa',
      'Dorso a 90° vivo desenhado para riscar pederneira e raspar casca de árvore',
      'Punho em Micarta ou madeira estabilizada com fixação mecânica por pinos passantes',
    ],
    fieldTestingSummary: 'Testada em 15 horas de rachamento de lenha densa sem qualquer jogo no punho ou dentes no gume.',
  },
  {
    id: 'serrote-dobravel-japones',
    name: 'Serrote de Poda Dobrável com Dentes Temperados por Impulso (210mm)',
    category: 'corte',
    categoryLabel: 'Lâminas & Corte',
    fieldVerdict: 'Indispensável',
    utilityScore: 9.6,
    weightGrams: 220,
    specs: 'Comprimento lâmina: 210mm · Dentes: 10 TPI · Tração pull-cut (corte no puxar)',
    durability: 'Lâmina substituível em aço SK4 com têmpera localizada',
    priceEstimate: '29 € – 42 €',
    portugalContext: 'Corte silencioso e limpo de ramos caídos para abrigo na floresta sem necessidade de alertar ou perturbar a fauna circundante.',
    description: 'Mais seguro, mais eficiente e muito mais leve do que um machado pequeno. O corte no movimento de puxar permite serrar troncos até 12cm de diâmetro com mínimo dispêndio de calorias.',
    keyFeatures: [
      'Trava de segurança de dois pontos para posições de corte retilíneas e angulares',
      'Dentes com 3 ângulos de afiação temperados a laser que mantêm o corte afiado 3x mais tempo',
      'Punho ergonómico emborrachado com pega anti-derrapante para tempo chuvoso',
    ],
    fieldTestingSummary: 'Serragem de tronco de eucalipto de 10cm em apenas 38 segundos de esforço cadenciado.',
  },
  {
    id: 'tarp-ripstop-silnylon-3x3',
    name: 'Tarp Táctico 3x3m em Ripstop Silnylon 40D (Impermeável 3000mm)',
    category: 'abrigo',
    categoryLabel: 'Abrigo & Tarp',
    fieldVerdict: 'Indispensável',
    utilityScore: 9.7,
    weightGrams: 490,
    specs: 'Dimensões: 300 x 300 cm · Tecido: Nylon Ripstop 40D resinado a silicone · 19 ilhós reforçados',
    durability: 'Elevada resistência ao rasgo e raios UV',
    priceEstimate: '55 € – 75 €',
    portugalContext: 'Conformidade total com a legislação portuguesa: permite bivaque e abrigo de emergência sem montar tenda tradicional com estacas invasivas.',
    description: 'Abrigo ultra-leve e modular. Os 19 pontos de fixação perimetrais e centrais permitem montar dezenas de configurações de abrigo: Diamond fly para vento forte, Lean-to com refletor de fogo, ou A-frame fechado contra aguaceiros.',
    keyFeatures: [
      '19 laços de ancoragem com costuras em caixa reforçada para resistir a rajadas de vento',
      'Coluna de água de 3000mm que suporta tempestades outonais severas',
      'Ocupa o volume equivalente a uma garrafa de 1 litro na mochila',
    ],
    fieldTestingSummary: 'Resistiu a ventos de 50 km/h no planalto da Torre (Serra da Estrela) sem cedência de costuras.',
  },
  {
    id: 'bivy-reflexivo-respiravel',
    name: 'Saco Bivy Térmico Reflexivo & Respirável (Sol Escape)',
    category: 'abrigo',
    categoryLabel: 'Abrigo & Tarp',
    fieldVerdict: 'Recomendado',
    utilityScore: 9.4,
    weightGrams: 240,
    specs: 'Dimensões: 213 x 78 cm · Material: Polietileno fiado metalizado respirável',
    durability: 'Reutilizável, resistente a perfurações leves ao contrário de mantas de folha fina',
    priceEstimate: '48 € – 62 €',
    portugalContext: 'Crítico para evitar hipotermia em pernoitas não planeadas nas cotas elevadas da Peneda-Gerês ou Madeira.',
    description: 'Combina as propriedades reflexivas de uma manta térmica de emergência (reflete 70% do calor corporal) com uma membrana que liberta o vapor do suor, evitando a condensação interna molhada.',
    keyFeatures: [
      'Respirável: evita o efeito de estufa e humedecimento da roupa de campo',
      'Capuz ajustável com cordão para vedação hermética contra o vento frio',
      'Costuras seladas à prova de água e vento',
    ],
    fieldTestingSummary: 'Aumento de 6°C na temperatura interior registado em noite de geada na Serra do Soajo.',
  },
  {
    id: 'radio-pmr446-ip67',
    name: 'Transcetor Portátil PMR446 IP67 (Walkie-Talkie Livre de Licença)',
    category: 'comunicacao',
    categoryLabel: 'Rádio & Orientação',
    fieldVerdict: 'Indispensável',
    utilityScore: 9.6,
    weightGrams: 230,
    specs: 'Potência: 0.5W ERP (Norma UE) · 16 Canais analógicos + 16 digitais · Sub-tons CTCSS/DCS',
    durability: 'Certificação IP67 (submersível 1m durante 30 min) e carcaça em policarbonato',
    priceEstimate: '60 € – 85 €',
    portugalContext: 'Uso 100% legal sem licença em Portugal. Canal de emergência de montanha comunitário: Canal 7 / Subtom 7 (446.08125 MHz CTCSS 85.4 Hz).',
    description: 'Comunicação rádio tática entre companheiros de marcha ou núcleos territoriais. Garante contacto de voz imediato mesmo quando as torres de telecomunicações móveis colapsam por corte de energia.',
    keyFeatures: [
      'Carcaça robusta estanque a chuva, lama e poeiras de terreno árido',
      'Autonomia de 18 horas em modo de espera com bateria Li-ion recarregável por USB-C',
      'Botão de chamada de emergência com alarme sónico local e transmissão prioritária',
    ],
    fieldTestingSummary: 'Alcance comprovado de 4.8 km em linha de vista desimpedida entre dois cabeços do Alentejo.',
  },
  {
    id: 'bussola-placa-espelho',
    name: 'Bússola Cartográfica de Placa com Espelho e Clinómetro',
    category: 'comunicacao',
    categoryLabel: 'Rádio & Orientação',
    fieldVerdict: 'Indispensável',
    utilityScore: 9.8,
    weightGrams: 75,
    specs: 'Escalas: 1:25.000 e 1:50.000 · Agulha de aço sueco com amortecimento líquido · Espelho de visada',
    durability: 'Placa acrílica anti-risco com graduação inalterável',
    priceEstimate: '38 € – 55 €',
    portugalContext: 'Perfeita para uso conjunto com a Carta Militar de Portugal série M888 (1:25.000) do Instituto Geográfico do Exército.',
    description: 'Navegação de precisão que nunca fica sem bateria. O espelho de visada permite leituras de azimute simultâneas com o horizonte, e o clinómetro integrado permite estimar a inclinação de encostas e risco de deslizamento.',
    keyFeatures: [
      'Parafuso de compensação de declinação magnética permanente',
      'Marcações fotoluminescentes ativadas por lanterna para navegação noturna',
      'Espelho traseiro utilizável como heliografo de emergência para sinalização visual a aeronaves',
    ],
    fieldTestingSummary: 'Rumo de 3km em nevoeiro cerrado na Serra de Sintra concluído com desvio inferior a 15 metros.',
  },
  {
    id: 'kit-ifak-hemorragias',
    name: 'Kit Individual de Primeiros Socorros Táctico (IFAK Trauma & Hemostático)',
    category: 'socorrismo',
    categoryLabel: 'Socorrismo & IFAK',
    fieldVerdict: 'Indispensável',
    utilityScore: 10.0,
    weightGrams: 360,
    specs: 'Bolsa Rip-Away em Cordura 500D · Fecho bidirecional · Passadores MOLLE',
    durability: 'Componentes médicos estéreis com validade de 5 anos',
    priceEstimate: '65 € – 95 €',
    portugalContext: 'Fundamental em atividades com machados, facas pesadas e terrenos acidentados distantes de auxílio INEM (tempo de chegada do resgate superior a 90 minutos).',
    description: 'Kit focado no protocolo militar MARCH para controlo de hemorragias exangues catastróficas e suporte básico de vida antes da chegada de meios de socorro especializados.',
    keyFeatures: [
      'Torniquete homologado tipo C-A-T (Combat Application Tourniquet) para aplicação com uma só mão',
      'Ligadura de emergência compressiva tipo israelita de 4 polegadas com barra de pressão',
      'Gaze hemostática impregnada com caulino para empacotamento rápido de feridas profundas',
      'Tesoura de trauma tipo ponta romba que corta couro e calçado sem ferir a pele',
    ],
    fieldTestingSummary: 'Simulação de aplicação de torniquete completada em menos de 22 segundos sob baixa visibilidade.',
  },
  {
    id: 'apito-resgate-maritimo',
    name: 'Apito de Emergência Sem Esfera 120 dB (Storm / Fox40 Style)',
    category: 'socorrismo',
    categoryLabel: 'Socorrismo & IFAK',
    fieldVerdict: 'Indispensável',
    utilityScore: 9.5,
    weightGrams: 14,
    specs: 'Potência Sonora: 120 decibéis · Construção em ABS de alta visibilidade · Sem esfera interna',
    durability: 'Não encrava com areia, água salgada ou lama',
    priceEstimate: '7 € – 12 €',
    portugalContext: 'Código de apito internacional de montanha: 6 apitos por minuto, pausa de 1 minuto, repetir. Resposta dos socorristas: 3 apitos por minuto.',
    description: 'A voz humana esgota-se em 15 minutos de gritos. Este apito sem peças móveis projeta um som estridente que penetra através de ventanias, cascatas e nevoeiro com o mínimo esforço pulmonar.',
    keyFeatures: [
      '120 dB: audível a mais de 1.6 km em campo aberto',
      'Design pea-less: funciona instantaneamente após ser retirado de água ou lama sem bloquear',
      'Cor de alta visibilidade (laranja de resgate) com cordão anti-estrangulamento',
    ],
    fieldTestingSummary: 'Audível com clareza no fundo do desfiladeiro da Fraga da Pena (Serra do Açor).',
  },
];
