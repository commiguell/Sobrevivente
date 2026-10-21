export type CategoryId =
  | 'todas'
  | 'agua'
  | 'fogo'
  | 'abrigo'
  | 'alimentacao'
  | 'primeiros-socorros'
  | 'orientacao'
  | 'nos-e-cordas'
  | 'preparacao-urbana';

export interface CategoryItem {
  id: CategoryId;
  label: string;
  count: number;
  description: string;
}

export interface ManualItem {
  id: string;
  title: string;
  subtitle: string;
  category: CategoryId;
  categoryLabel: string;
  level: 'Iniciante' | 'Intermédio' | 'Avançado';
  readTime: string;
  author: string;
  illustration:
    | 'water-filter'
    | 'friction-fire'
    | 'lean-to-shelter'
    | 'foraging-acorn'
    | 'first-aid-resin'
    | 'night-navigation'
    | 'knots-tarp'
    | 'urban-blackout';
  summary: string;
  materials: string[];
  steps: { title: string; detail: string }[];
  fieldNote: string;
}

export interface TechniqueCardData {
  id: string;
  name: string;
  scientificOrTechSubtitle: string;
  categoryLabel: string;
  rating: string;
  reviewsCount: number;
  lightCondition: string;
  description: string;
  illustration: 'water-filter' | 'friction-fire' | 'lean-to-shelter';
  attributes: {
    dificuldade: { label: string; sub: string };
    material: { label: string; sub: string };
    tempo: { label: string; sub: string };
    risco: { label: string; sub: string };
  };
  stepsPreview: string[];
}

export interface FeedComment {
  id: string;
  author: string;
  role: string;
  text: string;
  timeAgo: string;
}

export interface FeedPost {
  id: string;
  author: string;
  handle: string;
  region: string;
  timeAgo: string;
  categoryLabel: string;
  title: string;
  content: string;
  illustration: 'post-estrela' | 'post-geres';
  likes: number;
  likedByMe: boolean;
  savedByMe: boolean;
  coordinates: string;
  authorBadges?: string[];
  comments: FeedComment[];
}

export interface BadgeItem {
  id: string;
  title: string;
  category: 'Técnica' | 'Trilho & Terreno' | 'Prontidão & Comunidade';
  description: string;
  requirementText: string;
  xp: number;
  rarity: 'Iniciado' | 'Veterano' | 'Mestre de Campo';
  iconKey: 'knots' | 'explorer100' | 'water' | 'fire' | 'shelter' | 'kit72' | 'botany' | 'polar';
  unlocked: boolean;
  progressCurrent: number;
  progressTarget: number;
  unit: string;
}

export interface RegionalGroup {
  id: string;
  name: string;
  biome: string;
  members: number;
  nextMeetup: string;
  coordinator: string;
  joined: boolean;
}

export interface ForumQuestion {
  id: string;
  author: string;
  region: string;
  categoryLabel: string;
  question: string;
  instructorAnswer: string;
  instructorName: string;
  votes: number;
  voted: boolean;
}

export interface FieldEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  instructor: string;
  level: 'Iniciante' | 'Intermédio' | 'Avançado';
  spotsLeft: number;
  totalSpots: number;
  enrolled: boolean;
}

export interface KitChecklistItem {
  id: string;
  category: 'Água & Nutrição' | 'Abrigo & Calor' | 'Saúde & Primeiros Socorros' | 'Luz, Fogo & Ferramentas' | 'Comunicação & Documentos';
  label: string;
  spec: string;
  weightGrams: number;
  essential: boolean;
  checked: boolean;
}

export const CATEGORIES: CategoryItem[] = [
  { id: 'todas', label: 'Todos os Manuais', count: 148, description: 'Acervo completo revisto por instrutores de campo' },
  { id: 'agua', label: 'Água', count: 24, description: 'Captação, filtração bio-areia, fervura e destilação solar' },
  { id: 'fogo', label: 'Fogo', count: 19, description: 'Fricção, pederneira, iscas naturais e gestão ética de brasa' },
  { id: 'abrigo', label: 'Abrigo', count: 22, description: 'Toldos, isolamento térmico de solo e estruturas naturais' },
  { id: 'alimentacao', label: 'Alimentação', count: 18, description: 'Recoleção botânica segura, conservação e cozinha de campanha' },
  { id: 'primeiros-socorros', label: 'Primeiros Socorros', count: 21, description: 'Trauma em zonas remotas, hipotermia e antissépticos naturais' },
  { id: 'orientacao', label: 'Orientação', count: 16, description: 'Cartografia militar, azimutes, navegação astronómica e natural' },
  { id: 'nos-e-cordas', label: 'Nós e Cordas', count: 15, description: 'Ancoragens seguras, tensionamento de toldos e cordoaria vegetal' },
  { id: 'preparacao-urbana', label: 'Preparação Urbana', count: 13, description: 'Autonomia energética de 72h, comunicações rádio e reservas domésticas' },
];

export const FEATURED_MANUALS: ManualItem[] = [
  {
    id: 'filtro-bio-areia',
    title: 'Purificação por Tripé Bio-Areia e Carvão Ativo',
    subtitle: 'Sistema multicamada de filtração mecânica e adsorção química em terreno florestal',
    category: 'agua',
    categoryLabel: 'Água',
    level: 'Iniciante',
    readTime: '9 min leitura',
    author: 'Eng.º Duarte Vasconcelos · Hidrologia Florestal',
    illustration: 'water-filter',
    summary:
      'Construa um filtro gravitacional de quatro estágios capaz de remover turbidez, sedimentos em suspensão e compostos orgânicos voláteis antes da fervura de segurança.',
    materials: [
      '3 varas verdes de salgueiro ou aveleira (1,4 m cada) para o tripé',
      'Recipiente cilíndrico ou casca de bétula/cortiça limpa',
      'Carvão vegetal de madeira dura (azinho ou carvalho) triturado',
      'Areia fina de sílica lavada e seixos rolados de ribeira',
      'Musgo esfagno fresco ou tecido de algodão denso na base',
    ],
    steps: [
      {
        title: '01. Camada de Retenção e Tecido Base',
        detail: 'Posicione o tecido de algodão ou musgo esfagno na saída inferior para impedir a fuga dos grãos finos de carvão.',
      },
      {
        title: '02. Leito de Carvão Ativo (5–7 cm)',
        detail: 'Triture carvão de brasa totalmente arrefecida de madeira não resinosa até obter grânulos de 1 a 3 mm, compactando suavemente.',
      },
      {
        title: '03. Barreira de Areia Fina e Cascalho Superior',
        detail: 'Adicione 6 cm de areia fina seguidos de 5 cm de seixos limpos no topo para reter detritos maiores sem colmatar o filtro.',
      },
      {
        title: '04. Fervura de Esterilização (Regra de Ouro)',
        detail: 'Após filtrar até obter água cristalina, mantenha fervura rolante durante pelo menos 3 minutos para inativar patógenos virais e bacterianos.',
      },
    ],
    fieldNote:
      'Nunca utilize carvão de pinheiro ou eucalipto no filtro: as resinas e óleos essenciais alteram a potabilidade da água.',
  },
  {
    id: 'arco-de-pua',
    title: 'Ignição por Fricção: Arco de Pua em Clima Húmido',
    subtitle: 'Seleção botânica de madeiras portuguesas, geometria do entalhe em V e transferência para ninho de isca',
    category: 'fogo',
    categoryLabel: 'Fogo',
    level: 'Avançado',
    readTime: '14 min leitura',
    author: 'Mestre Gonçalo Alvim · Instrutor de Bushcraft',
    illustration: 'friction-fire',
    summary:
      'Domine a biomecânica e a termodinâmica da ignição primitiva utilizando hera, salgueiro ou figueira-brava mesmo após dias de nevoeiro atlântico.',
    materials: [
      'Tábua-base e fuso da mesma densidade (Salgueiro, Choupo ou Hera seca)',
      'Arco curvo rígido com 65 cm e cordim paracord 550 ou couro cru',
      'Apoio de mão superior em madeira dura ou pedra com cavidade lubrificada com folhas verdes',
      'Ninho de isca: barba-de-velho (Usnea), casca interna de choupo e estopa de cardo',
    ],
    steps: [
      {
        title: '01. Calibração do Fuso e Cavidade Inicial',
        detail: 'Esculpa o fuso com 2 cm de diâmetro: ponta superior afiada (menor atrito na mão) e ponta inferior arredondada (maior fricção na tábua).',
      },
      {
        title: '02. Corte do Entalhe em V (35° a 40°)',
        detail: 'Abra um entalhe que chegue quase ao centro da depressão queimada, criando o depósito exato onde o pó negro incandescente se irá acumular.',
      },
      {
        title: '03. Cadência Respiratória e Pressão Progressiva',
        detail: 'Inicie com passadas longas e paralelas ao solo para aquecer o conjunto; aumente a pressão vertical apenas quando o fumo se tornar denso e amarelado.',
      },
      {
        title: '04. Consolidação e Oxigenação da Brasa',
        detail: 'Aguarde 20 segundos para a brasa coalescer antes de a transferir com cuidado para o centro do ninho de fibras secas.',
      },
    ],
    fieldNote:
      'Respeite rigorosamente o Índice de Perigo de Incêndio Rural (IPMA/ICNF). Em época crítica, treine apenas a criação da brasa sobre tabuleiro metálico com água ao lado.',
  },
  {
    id: 'abrigo-termico-leanto',
    title: 'Abrigo Lean-To com Cama Isolante e Refletor de Calor',
    subtitle: 'Arquitetura natural contra perda térmica por condução no solo e convecção noturna',
    category: 'abrigo',
    categoryLabel: 'Abrigo',
    level: 'Intermédio',
    readTime: '11 min leitura',
    author: 'Sofia Bettencourt · Guia de Montanha',
    illustration: 'lean-to-shelter',
    summary:
      '80% da perda corporal de calor durante uma pernoita ocorre por contacto direto com o solo frio. Aprenda a dimensionar a cama de folhagem e a parede refletora.',
    materials: [
      'Trave mestra resistente (2,5 m) apoiada entre duas árvores ou tripés',
      '14 a 18 caibros secundários inclinados a 45° contra o vento dominante',
      'Folhagem densa, fetos secos e caruma para impermeabilização (30 cm comprimidos)',
      '4 troncos verdes ou pedras lamelares para o muro refletor frontal',
    ],
    steps: [
      {
        title: '01. Leitura Topográfica e Direção do Vento',
        detail: 'Evite fundos de vale húmidos (poços de ar frio) e verifique sempre a ausência de ramos secos suspensos ("widowmakers") antes de fixar a trave.',
      },
      {
        title: '02. Colchão de Isolamento Térmico (Regra do Palmo)',
        detail: 'Construa uma grade de ramos elásticos preenchida com caruma e folhas secas até que, ao deitar-se, fiquem pelo menos 15 cm de ar isolante abaixo da anca.',
      },
      {
        title: '03. Cobertura Imbricada de Baixo para Cima',
        detail: 'Disponha camadas de fetos ou ramos à semelhança de telhas, começando junto ao solo e subindo até à cumeeira para escoar a chuva.',
      },
    ],
    fieldNote:
      'Ao desmontar o acampamento, restitua a folhagem e os ramos caídos ao solo florestal seguindo os princípios Leave No Trace.',
  },
  {
    id: 'lixiviacao-bolota',
    title: 'Processamento de Bolota e Flora Silvestre Comestível',
    subtitle: 'Identificação botânica segura no montado ibérico e extração de taninos por lixiviação',
    category: 'alimentacao',
    categoryLabel: 'Alimentação',
    level: 'Iniciante',
    readTime: '10 min leitura',
    author: 'Dra. Inês Corte-Real · Etnobotânica',
    illustration: 'foraging-acorn',
    summary:
      'A bolota de azinheira (Quercus rotundifolia) foi a base energética das populações ibéricas durante milénios. Aprenda a transformá-la em farinha nutritiva.',
    materials: [
      'Bolotas sãs de azinheira ou sobreiro (sem perfurações de gorgulho)',
      'Pedra chata limpa ou almofariz de madeira para descasque e moagem',
      'Pano de linho ou algodão cru e água corrente limpa',
    ],
    steps: [
      {
        title: '01. Seleção Flutuante e Descasque',
        detail: 'Mergulhe as bolotas em água: descarte todas as que flutuarem. Retire a casca externa e a película acastanhada rica em taninos amargos.',
      },
      {
        title: '02. Lixiviação a Frio em Água Corrente',
        detail: 'Esmague o miolo em farinha grossa, envolva no pano e deixe imerso num ribeiro limpo durante 12h (ou troque a água 5 vezes) até desaparecer o travo adstringente.',
      },
    ],
    fieldNote:
      'Nunca consuma qualquer planta ou cogumelo silvestre sem 100% de certeza taxonómica. As bolotas de azinheira são consideravelmente mais doces que as de carvalho-alvarinho.',
  },
  {
    id: 'resina-pinheiro-socorros',
    title: 'Bálsamo Cicatrizante de Resina de Pinheiro e Higiene de Campo',
    subtitle: 'Protocolo de desinfeção de feridas superficiais, imobilização improvisada e controlo térmico',
    category: 'primeiros-socorros',
    categoryLabel: 'Primeiros Socorros',
    level: 'Intermédio',
    readTime: '8 min leitura',
    author: 'Dr. Tiago Mendonça · Medicina de Expedição',
    illustration: 'first-aid-resin',
    summary:
      'Como combinar protocolos médicos modernos de socorrismo em áreas remotas (Wilderness First Aid) com recursos botânicos bacteriostáticos da floresta portuguesa.',
    materials: [
      'Soro fisiológico ou água fervida arrefecida para irrigação sob pressão',
      'Resina cristalizada de Pinus pinaster (Pinheiro-bravo) e azeite/cera de abelha',
      'Compressas esterilizadas e lenço triangular de algodão',
    ],
    steps: [
      {
        title: '01. Irrigação Mecânica Abundante',
        detail: 'O passo mais determinante para prevenir infeção em campo é lavar a ferida com jato de água potável/fervida morna para remover terra e detritos.',
      },
      {
        title: '02. Fusão Suave da Resina Protetora',
        detail: 'Aqueça resina de pinheiro em banho-maria com uma colher de azeite para criar uma película selante antimicrobiana para fissuras cutâneas e bolhas.',
      },
    ],
    fieldNote:
      'O bálsamo de resina destina-se apenas a pequenas escoriações superficiais; feridas profundas ou mordeduras exigem evacuação e avaliação médica.',
  },
  {
    id: 'navegacao-noturna-azimute',
    title: 'Navegação Astronómica e Triangulação sem GPS',
    subtitle: 'Determinação do Norte verdadeiro pela Estrela Polar, Cruzeiro de Pedras e leitura de curvas de nível',
    category: 'orientacao',
    categoryLabel: 'Orientação',
    level: 'Intermédio',
    readTime: '13 min leitura',
    author: 'Cap. (Res.) Henrique Paiva · Cartografia',
    illustration: 'night-navigation',
    summary:
      'Quando os dispositivos eletrónicos falham por frio extremo ou bateria esgotada, a leitura combinada do relevo e do céu noturno garante o regresso seguro.',
    materials: [
      'Bússola de limbo rotativo com espelho ou régua clinómetro',
      'Carta Militar de Portugal 1:25.000 da região',
      'Lanterna frontal com filtro vermelho (preservação da visão escotópica)',
    ],
    steps: [
      {
        title: '01. Alinhamento Merak–Dubhe na Ursa Maior',
        detail: 'Localize as duas estrelas frontais da "caça" da Ursa Maior e prolongue 5 vezes a distância entre elas em linha reta até encontrar a Estrela Polar (Norte geográfico).',
      },
      {
        title: '02. Técnica de "Handrails" e "Attack Points"',
        detail: 'Em vez de caminhar às cegas em linha reta na floresta fechada, siga linhas naturais (cumeadas, ribeiros, muros) até um ponto de referência inconfundível.',
      },
    ],
    fieldNote:
      'Em Portugal Continental, a declinação magnética atual é muito reduzida (~1,5° W), mas deve ser sempre considerada em travessias de longa distância.',
  },
  {
    id: 'nos-essenciais-campo',
    title: 'Os 5 Nós de Sobrevivência para Montagem Rápida de Abrigo',
    subtitle: 'Lais de Guia, Nó de Fiel, Prusik de Tensão, Direito e Volta do Salteador sob chuva e frio',
    category: 'nos-e-cordas',
    categoryLabel: 'Nós e Cordas',
    level: 'Iniciante',
    readTime: '7 min leitura',
    author: 'Rui Sequeira · Instrutor de Cordas e Resgate',
    illustration: 'knots-tarp',
    summary:
      'Um bom nó de bushcraft deve aguentar tensão sob vento forte e, acima de tudo, desatar-se facilmente com as mãos frias sem precisar de cortar o cordim.',
    materials: [
      '10 metros de Paracord 550 Tipo III (alma de 7 fios internos)',
      '2 secções de 1,2 m de cordim de 3 mm para nós autoblocantes Prusik',
    ],
    steps: [
      {
        title: '01. Ancoragem Fixa com Lais de Guia ou Nó Siberiano',
        detail: 'Use o nó Siberiano (Evenk hitch) na primeira árvore: pode ser feito mesmo com luvas e liberta-se puxando uma única ponta.',
      },
      {
        title: '02. Linha de Cumeeira com Trucker’s Hitch + Prusik',
        detail: 'Crie vantagem mecânica de 3:1 na outra extremidade para esticar a linha mestra como uma corda de viola e deslize dois anéis Prusik para prender o toldo.',
      },
    ],
    fieldNote:
      'Pratique os 5 nós de olhos fechados em casa antes de sair para o terreno: à noite e sob chuva, a memória muscular substitui a visão.',
  },
  {
    id: 'autonomia-urbana-72h',
    title: 'Protocolo de Resiliência Doméstica: Apagão e Falha de Rede',
    subtitle: 'Gestão de água, comunicações PMR446, iluminação segura e reserva calórica sem refrigeração',
    category: 'preparacao-urbana',
    categoryLabel: 'Preparação Urbana',
    level: 'Iniciante',
    readTime: '11 min leitura',
    author: 'Marta Lourenço · Proteção Civil & Resiliência',
    illustration: 'urban-blackout',
    summary:
      'A preparação serena em apartamento ou moradia garante que a sua família mantém conforto, informação fidedigna e segurança durante as primeiras 72 horas de qualquer crise.',
    materials: [
      'Reserva rotativa de 9 Litros de água por pessoa (3L/dia × 3 dias)',
      'Rádio AM/FM/SW a dínamo/solar e par de rádios PMR446',
      'Fogareiro portátil a gás com ventilação segura e extintor ABC',
    ],
    steps: [
      {
        title: '01. Ponto de Encontro Familiar e Canal de Rádio',
        detail: 'Defina dois pontos de encontro físicos (um no bairro e outro fora do concelho) e combine o canal/subtom PMR446 (ex.: Canal 7, Subtom 14) em caso de queda da rede móvel.',
      },
      {
        title: '02. Despensa Viva (FIFO — First In, First Out)',
        detail: 'Armazene apenas alimentos que a família já consome habitualmente (conservas de peixe português, leguminosas, frutos secos, azeite e aveia), rodando os prazos.',
      },
    ],
    fieldNote:
      'Nunca utilize fogareiros a carvão ou geradores a combustão dentro de espaços fechados ou varandas envidraçadas devido ao risco letal de monóxido de carbono.',
  },
];

export const TECHNIQUE_CARDS: TechniqueCardData[] = [
  {
    id: 'tech-water',
    name: 'Filtro Bio-Areia em Tripé',
    scientificOrTechSubtitle: 'Filtração Gravitacional Multicamada · Potabilização de Campo',
    categoryLabel: 'Água & Hidrologia',
    rating: '4.9',
    reviewsCount: 184,
    lightCondition: 'Qualquer Clima',
    description:
      'Sistema natural de clarificação e adsorção química utilizando seixos de ribeira, areia fina de sílica, carvão vegetal de madeira dura e musgo esfagno.',
    illustration: 'water-filter',
    attributes: {
      dificuldade: { label: 'Iniciante', sub: 'Baixa complexidade' },
      material: { label: 'Natural', sub: 'Areia, carvão, tripé' },
      tempo: { label: '25 min', sub: 'Montagem + ciclo' },
      risco: { label: 'Controlado', sub: 'Requer fervura final' },
    },
    stepsPreview: [
      'Construir tripé estável com 3 varas de salgueiro ou aveleira amarradas em nó de tripé.',
      'Dispor de baixo para cima: pano/musgo, carvão triturado (6 cm), areia fina (6 cm) e seixos (5 cm).',
      'Passar a água duas vezes pelo filtro e ferver durante 3 minutos antes do consumo.',
    ],
  },
  {
    id: 'tech-fire',
    name: 'Ignição por Arco de Pua',
    scientificOrTechSubtitle: 'Pirogénese por Fricção Mecânica · 420 °C Ponto de Ignição',
    categoryLabel: 'Fogo Primitivo',
    rating: '4.8',
    reviewsCount: 142,
    lightCondition: 'Madeira Seca',
    description:
      'A técnica mais fiável de fogo por fricção em florestas temperadas. Converte movimento linear do arco em rotação de alta pressão para gerar uma brasa autossustentada.',
    illustration: 'friction-fire',
    attributes: {
      dificuldade: { label: 'Avançado', sub: 'Coordenação e postura' },
      material: { label: 'Salgueiro / Hera', sub: '+ Cordim Paracord' },
      tempo: { label: '15–30 min', sub: 'Escultura + ignição' },
      risco: { label: 'Moderado', sub: 'Atenção a faúlhas' },
    },
    stepsPreview: [
      'Selecionar fuso e tábua-base secos (teste da unha: deve marcar ligeiramente a fibra).',
      'Aquecer progressivamente até formar pó negro fumegante no entalhe em V de 40°.',
      'Transferir a brasa consolidada para o ninho de fibras secas e soprar suavemente de cima para baixo.',
    ],
  },
  {
    id: 'tech-shelter',
    name: 'Abrigo Lean-To Térmico',
    scientificOrTechSubtitle: 'Microclima Passivo por Reflexão de Infravermelhos',
    categoryLabel: 'Abrigo & Termorregulação',
    rating: '4.9',
    reviewsCount: 219,
    lightCondition: 'Floresta Densa',
    description:
      'Estrutura clássica de pernoita com cobertura inclinada a 45°, colchão isolante de caruma de 20 cm e muro refletor que devolve o calor às costas do abrigo.',
    illustration: 'lean-to-shelter',
    attributes: {
      dificuldade: { label: 'Intermédio', sub: 'Esforço físico moderado' },
      material: { label: 'Madeira Caída', sub: 'Folhagem e caruma' },
      tempo: { label: '60–90 min', sub: 'Antes do pôr do sol' },
      risco: { label: 'Baixo', sub: 'Verificar ramos secos' },
    },
    stepsPreview: [
      'Posicionar a abertura de costas para o vento dominante e fora de linhas de água.',
      'Construir primeiro a cama isolante de solo (pelo menos 15 cm comprimidos).',
      'Erguer a parede refletora de 4 troncos verdes a 1,8 m da frente do abrigo.',
    ],
  },
];

export const INITIAL_FEED_POSTS: FeedPost[] = [
  {
    id: 'post-1',
    author: 'Matilde Figueiredo',
    handle: '@matilde.trilhos',
    region: 'Serra da Estrela · Vale do Rossim',
    timeAgo: 'Há 3 horas',
    categoryLabel: 'Abrigo & Frio',
    title: 'Teste de isolamento de solo a 1.450m de altitude sem tenda',
    content:
      'Pernoita tranquila com mínima de 2 °C junto ao Vale do Rossim. Construímos uma cama elevada com ramos caídos de vidoeiro e 25 cm de fetos secos sob o toldo configurado em A-Frame fechado. Zero condensação e conforto térmico impecável até ao amanhecer.',
    illustration: 'post-estrela',
    likes: 84,
    likedByMe: false,
    savedByMe: true,
    coordinates: '40.4021° N, 7.5892° W',
    authorBadges: ['Explorador de 100km', 'Especialista em Nós'],
    comments: [
      {
        id: 'c-101',
        author: 'Gonçalo Alvim',
        role: 'Instrutor de Campo',
        text: 'Excelente escolha de local fora da linha de geada do fundo do vale, Matilde! Que nó usaste na linha de cumeeira?',
        timeAgo: 'Há 2 horas',
      },
      {
        id: 'c-102',
        author: 'Matilde Figueiredo',
        role: 'Membro Sénior',
        text: 'Nó Siberiano na ancoragem e dois Prusiks com cavilhas de urze para esticar o toldo. Desmontou-se em 40 segundos!',
        timeAgo: 'Há 1 hora',
      },
    ],
  },
  {
    id: 'post-2',
    author: 'Tomás Corte-Real',
    handle: '@tomas.botanica',
    region: 'Parque Nacional Peneda-Gerês · Mata de Albergaria',
    timeAgo: 'Há 7 horas',
    categoryLabel: 'Água & Botânica',
    title: 'Identificação de Esfagno (Sphagnum) e filtração em linha de água granítica',
    content:
      'Registo da saída de estudo de ontem no Gerês. Analisámos a capacidade de retenção hídrica e o pH levemente ácido do musgo esfagno nas zonas húmidas de altitude, bem como os cuidados ecológicos para nunca colher em turfeiras sensíveis.',
    illustration: 'post-geres',
    likes: 62,
    likedByMe: true,
    savedByMe: false,
    coordinates: '41.7944° N, 8.1368° W',
    authorBadges: ['Guardião da Água', 'Botânico do Montado'],
    comments: [
      {
        id: 'c-201',
        author: 'Dra. Inês Corte-Real',
        role: 'Etnobotânica',
        text: 'Nota fundamental sobre conservação das turfeiras! Em treino prático usamos sempre fibra de algodão cru para poupar o musgo autóctone.',
        timeAgo: 'Há 5 horas',
      },
    ],
  },
];

export const INITIAL_GROUPS: RegionalGroup[] = [
  {
    id: 'grp-norte',
    name: 'Norte Atlântico & Gerês',
    biome: 'Floresta Temperada Húmida & Granito',
    members: 1420,
    nextMeetup: '14 Nov · Oficina de Orientação em Nevoeiro (Soajo)',
    coordinator: 'Gonçalo Alvim',
    joined: true,
  },
  {
    id: 'grp-beiras',
    name: 'Serra da Estrela & Beiras',
    biome: 'Alta Montanha, Pinhal & Turfeiras',
    members: 985,
    nextMeetup: '21 Nov · Termorregulação e Bivouac Invernal (Manteigas)',
    coordinator: 'Sofia Bettencourt',
    joined: false,
  },
  {
    id: 'grp-alentejo',
    name: 'Montado Alentejano & Guadiana',
    biome: 'Bosque Mediterrânico Seco & Captação Hídrica',
    members: 760,
    nextMeetup: '28 Nov · Etnobotânica da Bolota e Orientação Astronómica (Mértola)',
    coordinator: 'Dra. Inês Corte-Real',
    joined: false,
  },
  {
    id: 'grp-litoral',
    name: 'Estremadura, Sintra & Costa Vicentina',
    biome: 'Microclima Costeiro & Resiliência Urbana/Periurbana',
    members: 1890,
    nextMeetup: '05 Dez · Comunicações de Emergência e Kit 72h (Sintra)',
    coordinator: 'Marta Lourenço',
    joined: false,
  },
];

export const INITIAL_FORUM_QUESTIONS: ForumQuestion[] = [
  {
    id: 'fq-1',
    author: 'Pedro Vasques',
    region: 'Coimbra',
    categoryLabel: 'Água',
    question: 'Qual a diferença real entre pastilhas de dióxido de cloro e hipoclorito de sódio para águas turvas de serra?',
    instructorAnswer:
      'O dióxido de cloro (ClO₂) é significativamente mais eficaz contra quistos de Cryptosporidium e Giardia (comuns em serras com pastoreio de gado) e deixa muito menos sabor residual que o hipoclorito. Ainda assim, pré-filtre sempre os sedimentos com um pano ou filtro bio-areia antes da dosagem.',
    instructorName: 'Eng.º Duarte Vasconcelos',
    votes: 47,
    voted: false,
  },
  {
    id: 'fq-2',
    author: 'Beatriz Sampaio',
    region: 'Braga',
    categoryLabel: 'Fogo',
    question: 'Que madeiras autóctones portuguesas funcionam melhor para tábua e fuso de arco de pua no inverno húmido?',
    instructorAnswer:
      'A Hera seca (Hedera helix) que cresce em muros ou troncos mortos e o Salgueiro (Salix atrocinerea) são imbatíveis em Portugal. Procure ramos mortos ainda presos no ar (nunca apanhados diretamente do chão encharcado) e retire a casca externa.',
    instructorName: 'Mestre Gonçalo Alvim',
    votes: 39,
    voted: true,
  },
  {
    id: 'fq-3',
    author: 'Miguel Andrade',
    region: 'Lisboa',
    categoryLabel: 'Preparação Urbana',
    question: 'Como armazenar água potável em apartamento pequeno sem risco de degradação do plástico ao longo de 6 meses?',
    instructorAnswer:
      'Opte por jerricãs de polietileno de alta densidade alimentar (HDPE n.º 2) opacos, guardados num armário interior escuro e fresco (longe de produtos de limpeza ou solventes). Renove a água a cada 6 meses aproveitando a antiga para rega doméstica.',
    instructorName: 'Marta Lourenço',
    votes: 53,
    voted: false,
  },
];

export const INITIAL_EVENTS: FieldEvent[] = [
  {
    id: 'ev-1',
    title: 'Imersão 48h: Autonomia Florestal e Ética Leave No Trace',
    date: '14–15 Novembro 2026',
    location: 'Serra da Lousã · Aldeias do Xisto',
    instructor: 'Gonçalo Alvim & Sofia Bettencourt',
    level: 'Iniciante',
    spotsLeft: 4,
    totalSpots: 15,
    enrolled: false,
  },
  {
    id: 'ev-2',
    title: 'Oficina de Cartografia 1:25.000 e Navegação Noturna',
    date: '28 Novembro 2026',
    location: 'Parque Natural de Sintra-Cascais',
    instructor: 'Cap. Henrique Paiva',
    level: 'Intermédio',
    spotsLeft: 6,
    totalSpots: 12,
    enrolled: true,
  },
  {
    id: 'ev-3',
    title: 'Primeiros Socorros em Zonas Remotas (Wilderness First Aid)',
    date: '12 Dezembro 2026',
    location: 'Arouca · Serra da Freita',
    instructor: 'Dr. Tiago Mendonça',
    level: 'Intermédio',
    spotsLeft: 3,
    totalSpots: 16,
    enrolled: false,
  },
];

export const INITIAL_KIT_72H: KitChecklistItem[] = [
  {
    id: 'k-1',
    category: 'Água & Nutrição',
    label: 'Cantil em aço inox de parede simples (1L) + copo de encaixe',
    spec: 'Permite ferver água diretamente sobre brasa',
    weightGrams: 380,
    essential: true,
    checked: true,
  },
  {
    id: 'k-2',
    category: 'Água & Nutrição',
    label: 'Filtro portátil de membrana (0,1 mícron) + 20 pastilhas ClO₂',
    spec: 'Redundância dupla de purificação hídrica',
    weightGrams: 110,
    essential: true,
    checked: true,
  },
  {
    id: 'k-3',
    category: 'Água & Nutrição',
    label: 'Ração calórica compacta para 72h (6.600 kcal) + eletrólitos',
    spec: 'Frutos secos, aveia, mel, conservas e sais de reidratação',
    weightGrams: 1450,
    essential: true,
    checked: true,
  },
  {
    id: 'k-4',
    category: 'Abrigo & Calor',
    label: 'Toldo (Tarp) impermeável 3×3m com pontos de ancoragem reforçados',
    spec: 'Poliéster ripstop 3000mm em tom verde-oliva/terra',
    weightGrams: 680,
    essential: true,
    checked: true,
  },
  {
    id: 'k-5',
    category: 'Abrigo & Calor',
    label: 'Manta térmica aluminizada reutilizável (Bivy Bag de emergência)',
    spec: 'Retém até 90% da radiação térmica corporal',
    weightGrams: 185,
    essential: true,
    checked: false,
  },
  {
    id: 'k-6',
    category: 'Abrigo & Calor',
    label: 'Muda térmica de lã merino (camada base + meias secas em saco estanque)',
    spec: 'Isola mesmo quando húmida',
    weightGrams: 420,
    essential: true,
    checked: false,
  },
  {
    id: 'k-7',
    category: 'Luz, Fogo & Ferramentas',
    label: 'Faca de lâmina fixa Full-Tang (aço carbono/inox 10 cm) + bainha',
    spec: 'Espessura 3,2 mm para entalhes e processamento fino',
    weightGrams: 210,
    essential: true,
    checked: true,
  },
  {
    id: 'k-8',
    category: 'Luz, Fogo & Ferramentas',
    label: 'Pederneira de ferro-cério + isquero BIC + algodão vaselinado',
    spec: 'Tríade de fogo em caixa estanque',
    weightGrams: 95,
    essential: true,
    checked: true,
  },
  {
    id: 'k-9',
    category: 'Luz, Fogo & Ferramentas',
    label: 'Lanterna frontal LED recarregável (com modo luz vermelha) + cabo',
    spec: 'Autonomia mínima de 35h em modo económico',
    weightGrams: 90,
    essential: true,
    checked: false,
  },
  {
    id: 'k-10',
    category: 'Luz, Fogo & Ferramentas',
    label: '15 metros de Paracord 550 + 5 metros de cordim de 3 mm',
    spec: 'Montagem rápida de abrigos e reparações',
    weightGrams: 160,
    essential: false,
    checked: true,
  },
  {
    id: 'k-11',
    category: 'Saúde & Primeiros Socorros',
    label: 'Estojo IFAK de campo (compressas hemostáticas, ligadura, soro, pinça)',
    spec: 'Adaptado ao perfil médico pessoal e medicação de 5 dias',
    weightGrams: 340,
    essential: true,
    checked: false,
  },
  {
    id: 'k-12',
    category: 'Comunicação & Documentos',
    label: 'Bússola de espelho + Carta Militar plastificada + Apito 120 dB',
    spec: 'Navegação e sinalização acústica sem baterias',
    weightGrams: 130,
    essential: true,
    checked: false,
  },
  {
    id: 'k-13',
    category: 'Comunicação & Documentos',
    label: 'Rádio de emergência AM/FM/PMR446 + Powerbank 10.000 mAh e documentos',
    spec: 'Bolsa hermética com cópias de identificação e dinheiro numerário',
    weightGrams: 460,
    essential: true,
    checked: false,
  },
];

export const TESTIMONIALS = [
  {
    id: 't-1',
    quote:
      'Antes do Sobrevivente.eu encontrava apenas conteúdos alarmistas ou militares. Aqui aprendi a montar o meu Kit familiar de 72 horas com serenidade e participei na primeira saída de campo na Lousã com o meu filho.',
    name: 'Catarina Vasconcelos',
    role: 'Arquiteta Paisagista',
    region: 'Coimbra · Grupo Beiras',
    outcome: 'Concluiu 14 manuais práticos e o curso de Orientação Cartográfica',
  },
  {
    id: 't-2',
    quote:
      'Durante o grande apagão e temporal no Minho no inverno passado, os protocolos de purificação de água e comunicação rádio PMR446 que estudámos no fórum mantiveram a nossa aldeia coordenada durante 36 horas.',
    name: 'João Pedro Soares',
    role: 'Engenheiro Eletrotécnico & Voluntário Florestal',
    region: 'Ponte de Lima · Grupo Norte Atlântico',
    outcome: 'Coordenador local de resiliência comunitária em 3 freguesias',
  },
  {
    id: 't-3',
    quote:
      'O rigor científico dos manuais de etnobotânica e medicina de expedição distingue esta comunidade. Não há improvisos perigosos: cada técnica tem o risco avaliado e foi testada nos nossos biomas.',
    name: 'Dr. Afonso Lameiras',
    role: 'Biólogo de Conservação',
    region: 'Évora · Grupo Montado Alentejano',
    outcome: 'Autor colaborador nos guias de flora silvestre do montado',
  },
];

export const INITIAL_BADGES: BadgeItem[] = [
  {
    id: 'badge-knots',
    title: 'Especialista em Nós',
    category: 'Técnica',
    description:
      'Domínio prático de ancoragens seguras (Lais de Guia, Nó Siberiano, Prusik e Trucker’s Hitch) sob condições de chuva ou baixa visibilidade.',
    requirementText: 'Ler ou guardar o manual dos 5 Nós de Sobrevivência e validar treino prático.',
    xp: 200,
    rarity: 'Veterano',
    iconKey: 'knots',
    unlocked: true,
    progressCurrent: 5,
    progressTarget: 5,
    unit: 'nós validados',
  },
  {
    id: 'badge-100km',
    title: 'Explorador de 100km',
    category: 'Trilho & Terreno',
    description:
      'Completou 100 quilómetros acumulados em travessias autónomas e saídas de campo registadas nos núcleos regionais.',
    requirementText: 'Registar 100 km em saídas de campo ou relatos verificados no Diário.',
    xp: 350,
    rarity: 'Mestre de Campo',
    iconKey: 'explorer100',
    unlocked: true,
    progressCurrent: 100,
    progressTarget: 100,
    unit: 'km percorridos',
  },
  {
    id: 'badge-water',
    title: 'Guardião da Água',
    category: 'Técnica',
    description:
      'Construiu e testou com sucesso um sistema de filtração bio-areia com carvão ativo seguido de protocolo de fervura.',
    requirementText: 'Estudar o guia de Purificação Bio-Areia e validar filtro em campo.',
    xp: 180,
    rarity: 'Iniciado',
    iconKey: 'water',
    unlocked: true,
    progressCurrent: 1,
    progressTarget: 1,
    unit: 'sistema testado',
  },
  {
    id: 'badge-kit72',
    title: 'Sentinela 72 Horas',
    category: 'Prontidão & Comunidade',
    description:
      'Mochila de autonomia familiar para 72 horas auditada, equilibrada em peso e com redundância de água, abrigo e comunicações.',
    requirementText: 'Atingir pelo menos 75% de conclusão na Checklist do Kit de 72 Horas.',
    xp: 250,
    rarity: 'Veterano',
    iconKey: 'kit72',
    unlocked: false,
    progressCurrent: 7,
    progressTarget: 10,
    unit: 'itens essenciais',
  },
  {
    id: 'badge-fire',
    title: 'Mestre da Pederneira & Fricção',
    category: 'Técnica',
    description:
      'Domina a ignição primitiva por arco de pua e pederneira em clima húmido cumprindo integralmente as normas de segurança ICNF.',
    requirementText: 'Completar o módulo de Ignição por Fricção e protocolo de prevenção.',
    xp: 300,
    rarity: 'Mestre de Campo',
    iconKey: 'fire',
    unlocked: false,
    progressCurrent: 2,
    progressTarget: 3,
    unit: 'ignições húmidas',
  },
  {
    id: 'badge-polar',
    title: 'Navegador Polar',
    category: 'Trilho & Terreno',
    description:
      'Orientação noturna sem GPS através de triangulação na Carta Militar 1:25.000 e alinhamento astronómico pela Estrela Polar.',
    requirementText: 'Participar numa Oficina Noturna ou concluir o manual de Navegação Astronómica.',
    xp: 280,
    rarity: 'Veterano',
    iconKey: 'polar',
    unlocked: false,
    progressCurrent: 1,
    progressTarget: 2,
    unit: 'exercícios noturnos',
  },
];

