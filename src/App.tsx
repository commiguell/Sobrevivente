import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Droplets,
  Flame,
  Tent,
  Navigation,
  Radio,
  Users,
  MessageSquare,
  ShieldAlert,
  MapPin,
  ArrowRight,
  BookOpen,
  Search,
  X,
  ChevronRight,
  Download,
  Check,
  AlertTriangle,
  Menu,
  Shield,
  FileText,
  Thermometer,
  Wind,
  PhoneCall,
  UserCheck,
  Calendar,
  Layers,
  ShoppingBag,
  Wrench,
  Sparkles,
  Weight,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
} from 'lucide-react';
import {
  FEATURED_MANUALS,
  INITIAL_GROUPS,
  INITIAL_FORUM_QUESTIONS,
  ManualItem,
} from './data/raizData';
import {
  SURVIVAL_GEAR_ITEMS,
  GEAR_CATEGORIES,
  GearItem,
  GearCategory,
} from './data/gearData';
import { PortugalReliefMap, PORTUGAL_PEAKS } from './components/PortugalReliefMap';
import { BushcraftIllustration } from './components/BotanicalIllustrations';

type PillarType = 'manuais' | 'informacoes' | 'grupos' | 'foruns' | 'pessoas' | 'loja';

export type PortugalDistrict =
  | 'Aveiro'
  | 'Beja'
  | 'Braga'
  | 'Bragança'
  | 'Castelo Branco'
  | 'Coimbra'
  | 'Évora'
  | 'Faro'
  | 'Guarda'
  | 'Leiria'
  | 'Lisboa'
  | 'Portalegre'
  | 'Porto'
  | 'Santarém'
  | 'Setúbal'
  | 'Viana do Castelo'
  | 'Vila Real'
  | 'Viseu'
  | 'Açores'
  | 'Madeira';

export interface DistrictInfo {
  name: PortugalDistrict;
  region: 'Norte' | 'Centro' | 'Lisboa e Vale do Tejo' | 'Alentejo' | 'Algarve' | 'Regiões Autónomas';
  level: 'Reduzido' | 'Moderado' | 'Elevado' | 'Muito Elevado' | 'Máximo';
  color: string;
  temp: string;
  humidity: string;
  wind: string;
  criticalZones: string;
  waterPoints: string;
  emergencyContact: string;
  fireAlert: string;
  icnfNotice: string;
}

interface PillarRevealCardProps {
  id: string;
  delayMs?: number;
  className?: string;
  children: React.ReactNode;
}

function PillarRevealCard({ id, delayMs = 0, className = '', children }: PillarRevealCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={cardRef}
      id={id}
      style={{
        transitionDelay: `${delayMs}ms`,
      }}
      className={`pillar-card-anim ${revealed ? 'pillar-revealed' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export default function App() {
  // Navigation & Pillar Modal States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePillarModal, setActivePillarModal] = useState<PillarType | null>(null);
  const [selectedManualDetail, setSelectedManualDetail] = useState<ManualItem | null>(null);

  // Hero Display Mode (Emblema de Metal vs Relevo de Portugal + Ilhas)
  const [heroDisplayMode, setHeroDisplayMode] = useState<'emblema' | 'relevo'>('emblema');

  // Loja de Sobrevivência & Utensílios State
  const [selectedGearCategory, setSelectedGearCategory] = useState<GearCategory>('todas');
  const [gearSearchQuery, setGearSearchQuery] = useState('');
  const [selectedGearDetail, setSelectedGearDetail] = useState<GearItem | null>(null);
  const [myLoadoutItemIds, setMyLoadoutItemIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sobrevivente_loadout');
      return saved ? JSON.parse(saved) : ['filtro-sawyer-squeeze', 'barra-ferrocerium-xl', 'faca-bushcraft-scandi'];
    } catch {
      return ['filtro-sawyer-squeeze', 'barra-ferrocerium-xl', 'faca-bushcraft-scandi'];
    }
  });

  const toggleLoadoutItem = (id: string) => {
    setMyLoadoutItemIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('sobrevivente_loadout', JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  const handleDownloadLoadoutTxt = () => {
    const selectedItems = SURVIVAL_GEAR_ITEMS.filter((item) => myLoadoutItemIds.includes(item.id));
    const totalWeight = selectedItems.reduce((acc, curr) => acc + curr.weightGrams, 0);
    const lines = [
      'SOBREVIVENTE.EU — LISTA DE EQUIPAMENTO & UTENSÍLIOS DE CAMPO',
      `Data de Emissão: ${new Date().toLocaleDateString('pt-PT')}`,
      `Total de Utensílios: ${selectedItems.length}`,
      `Peso Total Estimado: ${(totalWeight / 1000).toFixed(2)} kg (${totalWeight} gramas)`,
      '----------------------------------------------------------------',
      'UTENSÍLIOS SELECIONADOS PARA A MOCHILA:',
      ...selectedItems.map(
        (item, idx) =>
          `${idx + 1}. [${item.categoryLabel.toUpperCase()}] ${item.name} (${item.weightGrams}g)\n   Classificação: ${item.fieldVerdict} | Pontuação: ${item.utilityScore}/10 | Preço Est.: ${item.priceEstimate}\n   Especificações: ${item.specs}\n   Contexto em Portugal: ${item.portugalContext}\n`
      ),
      '----------------------------------------------------------------',
      'Curadoria de campo: Sobrevivente.eu — Testado no terreno sem patrocínios.',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'minha-mochila-sobrevivente.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Interactive Live Info State (All 18 Districts + Azores & Madeira)
  const [selectedDistrict, setSelectedDistrict] = useState<PortugalDistrict>('Guarda');
  const [districtRegionFilter, setDistrictRegionFilter] = useState<string>('Todos');
  const [districtSearchQuery, setDistrictSearchQuery] = useState<string>('');

  // Interactive Member Finder Filter
  const [memberRegionFilter, setMemberRegionFilter] = useState<string>('Todas');

  // Prevent background scroll when any pillar modal is open
  useEffect(() => {
    const isModalActive =
      activePillarModal !== null || selectedManualDetail !== null || selectedGearDetail !== null;
    const prevOverflow = document.body.style.overflow;
    if (isModalActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = prevOverflow;
    }
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [activePillarModal, selectedManualDetail, selectedGearDetail]);

  // Handle ESC key to close open modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedGearDetail) {
          setSelectedGearDetail(null);
        } else if (selectedManualDetail) {
          setSelectedManualDetail(null);
        } else if (activePillarModal) {
          setActivePillarModal(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGearDetail, selectedManualDetail, activePillarModal]);

  // Export a manual as offline text file
  const handleDownloadManualTxt = (manual: ManualItem) => {
    const lines = [
      `SOBREVIVENTE.EU — MANUAL DE CAMPO: ${manual.title.toUpperCase()}`,
      `Subtítulo: ${manual.subtitle}`,
      `Categoria: ${manual.categoryLabel} | Nível: ${manual.level} | Leitura: ${manual.readTime}`,
      `Autor / Validador: ${manual.author}`,
      '----------------------------------------------------------------',
      'RESUMO:',
      manual.summary,
      '',
      'MATERIAIS E FERRAMENTAS NECESSÁRIAS:',
      ...manual.materials.map((m) => `• ${m}`),
      '',
      'PASSO A PASSO TÉCNICO:',
      ...manual.steps.map((s, idx) => `${idx + 1}. ${s.title}\n   ${s.detail}\n`),
      'AVISO DE SEGURANÇA E LEGISLAÇÃO:',
      manual.fieldNote,
      '',
      'Documento fornecido pela comunidade Sobrevivente.eu — Uso cívico e educacional.',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manual-${manual.id}-sobrevivente.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download offline TXT district safety bulletin
  const handleDownloadDistrictBulletinTxt = (districtKey: PortugalDistrict) => {
    const data = districtRiskData[districtKey];
    if (!data) return;
    const lines = [
      '================================================================',
      'SOBREVIVENTE.EU — BOLETIM DE MONITORIZAÇÃO E RISCO RURAL',
      '================================================================',
      `Distrito / Região : ${data.name} (${data.region})`,
      `Data de Emissão   : ${new Date().toLocaleDateString('pt-PT')} ${new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`,
      `Índice de Perigo  : ${data.level.toUpperCase()}`,
      '----------------------------------------------------------------',
      'CONDIÇÕES METEOROLÓGICAS DE SUPERFÍCIE:',
      `- Temperatura Estimada : ${data.temp}`,
      `- Humidade Relativa    : ${data.humidity}`,
      `- Vento e Rajadas      : ${data.wind}`,
      '----------------------------------------------------------------',
      'MONITORIZAÇÃO DE RECURSOS & TERRENO:',
      `- Zonas Críticas / Serras : ${data.criticalZones}`,
      `- Fontes Hídricas Ativas  : ${data.waterPoints}`,
      `- Contacto Emergência/CDOS: ${data.emergencyContact}`,
      '----------------------------------------------------------------',
      'ALERTA DA PROTEÇÃO CIVIL (ANEPC):',
      data.fireAlert,
      '',
      'DIRETIVAS E RESTRIÇÕES FLORESTAIS (ICNF):',
      data.icnfNotice,
      '================================================================',
      'Boletim comunitário compilado por Sobrevivente.eu para uso offline no terreno.',
      'Em caso de emergência ou avistamento de incêndio, ligue imediatamente 112 ou 117.',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boletim-risco-${data.name.toLowerCase().replace(/\s+/g, '-')}-sobrevivente.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Complete District Risk & Territorial Data for all Portugal (18 Districts + Azores & Madeira)
  const districtRiskData: Record<PortugalDistrict, DistrictInfo> = {
    Aveiro: {
      name: 'Aveiro',
      region: 'Centro',
      level: 'Elevado',
      color: '#D4A359',
      temp: '22°C',
      humidity: '55%',
      wind: '18 km/h NW',
      criticalZones: 'Maciço da Gafanha, Serras da Freita e Arada, Vale do Vouga',
      waterPoints: '14 fontes ativas catalogadas',
      emergencyContact: 'CDOS Aveiro / 112',
      fireAlert: 'Aviso Amarelo: Risco agravado nas encostas serranas de Arouca e Sever do Vouga.',
      icnfNotice: 'Queimas condicionadas a validação prévia. Proibido fogo de recreio no maciço da Freita.',
    },
    Beja: {
      name: 'Beja',
      region: 'Alentejo',
      level: 'Muito Elevado',
      color: '#C85A3E',
      temp: '34°C',
      humidity: '20%',
      wind: '20 km/h E',
      criticalZones: 'Parque Natural do Vale do Guadiana, Planície de Mértola e Serpa',
      waterPoints: '9 fontes ativas catalogadas',
      emergencyContact: 'CDOS Beja / 112',
      fireAlert: 'Aviso Laranja: Calor abrasador e secura extrema de combustíveis finos no Baixo Alentejo.',
      icnfNotice: 'Proibição absoluta de fogueiras e queimas. Trabalhos com ceifeiras condicionados a período noturno.',
    },
    Braga: {
      name: 'Braga',
      region: 'Norte',
      level: 'Moderado',
      color: '#A8B88A',
      temp: '20°C',
      humidity: '65%',
      wind: '14 km/h NW',
      criticalZones: 'Parque Nacional Peneda-Gerês, Serra da Cabreira, Vale do Cávado',
      waterPoints: '26 fontes ativas catalogadas',
      emergencyContact: 'CDOS Braga / 112',
      fireAlert: 'Vigilância habitual em zonas de mato e serrania florestal no vale do Cávado.',
      icnfNotice: 'Queimas autorizadas apenas mediante registo obrigatório e confirmação na plataforma ICNF.',
    },
    Bragança: {
      name: 'Bragança',
      region: 'Norte',
      level: 'Muito Elevado',
      color: '#C85A3E',
      temp: '28°C',
      humidity: '25%',
      wind: '24 km/h NE',
      criticalZones: 'Parque Natural de Montesinho, Serra da Nogueira, Planalto Mirandês',
      waterPoints: '19 fontes ativas catalogadas',
      emergencyContact: 'CDOS Bragança / 112',
      fireAlert: 'Aviso Laranja: Elevado risco de ignição em áreas de giestal e soutos montanhosos.',
      icnfNotice: 'Acesso condicionado a caminhos rurais em perímetro florestal. Interdição de queimas.',
    },
    'Castelo Branco': {
      name: 'Castelo Branco',
      region: 'Centro',
      level: 'Máximo',
      color: '#E0533C',
      temp: '33°C',
      humidity: '18%',
      wind: '32 km/h NE',
      criticalZones: 'Serra da Gardunha, Tejo Internacional, Pinhal Interior Sul (Oleiros/Sertã)',
      waterPoints: '15 fontes ativas catalogadas',
      emergencyContact: 'CDOS Castelo Branco / 112',
      fireAlert: 'Alerta Vermelho ANEPC: Tolerância zero para equipamentos motorizados com fagulhas e fogueiras.',
      icnfNotice: 'Circulação proibida em caminhos florestais não pavimentados durante o período de maior calor.',
    },
    Coimbra: {
      name: 'Coimbra',
      region: 'Centro',
      level: 'Elevado',
      color: '#D4A359',
      temp: '26°C',
      humidity: '42%',
      wind: '17 km/h W',
      criticalZones: 'Serra da Lousã, Serra do Buçaco, Vales do Rio Alva e Ceira',
      waterPoints: '22 fontes ativas catalogadas',
      emergencyContact: 'CDOS Coimbra / 112',
      fireAlert: 'Aviso Amarelo: Monitorização reforçada nos relevos xistosos da Lousã e Arganil.',
      icnfNotice: 'Aconselhada restrição de circulação apeada em trilhos de bivaque florestal isolados.',
    },
    Évora: {
      name: 'Évora',
      region: 'Alentejo',
      level: 'Muito Elevado',
      color: '#C85A3E',
      temp: '33°C',
      humidity: '21%',
      wind: '22 km/h SE',
      criticalZones: 'Serra d’Ossa, Montados de Sobro e Azinho do Alentejo Central',
      waterPoints: '11 fontes ativas catalogadas',
      emergencyContact: 'CDOS Évora / 112',
      fireAlert: 'Aviso Laranja ANEPC: Condições favoráveis a rápida propagação com baixa humidade relativa.',
      icnfNotice: 'Interdição completa do uso de fogareiros ou fontes de chama aberta fora de recintos urbanos.',
    },
    Faro: {
      name: 'Faro',
      region: 'Algarve',
      level: 'Muito Elevado',
      color: '#C85A3E',
      temp: '31°C',
      humidity: '22%',
      wind: '22 km/h SE',
      criticalZones: 'Serra de Monchique, Serra do Caldeirão, Espinhaço de Cão',
      waterPoints: '13 fontes ativas catalogadas',
      emergencyContact: 'CDOS Faro / 112',
      fireAlert: 'Monchique e Serra do Caldeirão em patrulhamento preventivo permanente com vigilância aérea.',
      icnfNotice: 'Fontes naturais de montanha com caudal reduzido — garanta filtragem e autonomia hídrica.',
    },
    Guarda: {
      name: 'Guarda',
      region: 'Centro',
      level: 'Muito Elevado',
      color: '#C85A3E',
      temp: '29°C',
      humidity: '24%',
      wind: '28 km/h E (Rajadas)',
      criticalZones: 'Serra da Estrela (Torre, Manteigas, Seia, Gouveia), Sabugal',
      waterPoints: '31 fontes ativas catalogadas',
      emergencyContact: 'CDOS Guarda / 112',
      fireAlert: 'Aviso Laranja: Proibição total de queimas e fogueiras em toda a Serra da Estrela.',
      icnfNotice: 'Pernoita restrita a parques de campismo homologados. Acesso a trilhos de altitude condicionado.',
    },
    Leiria: {
      name: 'Leiria',
      region: 'Centro',
      level: 'Moderado',
      color: '#A8B88A',
      temp: '23°C',
      humidity: '52%',
      wind: '19 km/h N',
      criticalZones: 'Pinhal do Rei (Leiria), Serra dos Candeeiros, Maciço Calcário',
      waterPoints: '12 fontes ativas catalogadas',
      emergencyContact: 'CDOS Leiria / 112',
      fireAlert: 'Vigilância costeira e atenções redobradas na orla florestal de transição dunar.',
      icnfNotice: 'Proibido qualquer tipo de fogueira em zona de pinhal e matas dunares litorais.',
    },
    Lisboa: {
      name: 'Lisboa',
      region: 'Lisboa e Vale do Tejo',
      level: 'Moderado',
      color: '#A8B88A',
      temp: '24°C',
      humidity: '56%',
      wind: '21 km/h NW',
      criticalZones: 'Parque Natural de Sintra-Cascais, Parque Florestal de Monsanto, Serra de Montejunto',
      waterPoints: '17 fontes ativas catalogadas',
      emergencyContact: 'CDOS Lisboa / 112',
      fireAlert: 'Aviso de segurança: Risco moderado com vento de nortada nas cristas de Sintra.',
      icnfNotice: 'Parque Natural de Sintra-Cascais: interdição de trânsito em perímetro florestal nos dias de alerta agravado.',
    },
    Portalegre: {
      name: 'Portalegre',
      region: 'Alentejo',
      level: 'Muito Elevado',
      color: '#C85A3E',
      temp: '32°C',
      humidity: '23%',
      wind: '25 km/h E',
      criticalZones: 'Parque Natural da Serra de São Mamede, Marvão e Castelo de Vide',
      waterPoints: '14 fontes ativas catalogadas',
      emergencyContact: 'CDOS Portalegre / 112',
      fireAlert: 'Aviso Laranja: Risco elevado nas cristas de quartzito e sobreirais de São Mamede.',
      icnfNotice: 'Queimas de sobrantes proibidas. Acesso condicionado a veículos motorizados em vias florestais.',
    },
    Porto: {
      name: 'Porto',
      region: 'Norte',
      level: 'Moderado',
      color: '#A8B88A',
      temp: '21°C',
      humidity: '62%',
      wind: '16 km/h NW',
      criticalZones: 'Serras de Valongo e Santa Justa, Vale do Douro Litoral',
      waterPoints: '18 fontes ativas catalogadas',
      emergencyContact: 'CDOS Porto / 112',
      fireAlert: 'Situação com humidade atlântica favorável; vigilância preventiva em manchas florestais periurbanas.',
      icnfNotice: 'Registo e validação obrigatória para quaisquer queimas agrícolas em zonas florestadas.',
    },
    Santarém: {
      name: 'Santarém',
      region: 'Lisboa e Vale do Tejo',
      level: 'Elevado',
      color: '#D4A359',
      temp: '27°C',
      humidity: '38%',
      wind: '18 km/h W',
      criticalZones: 'Lezírias do Tejo, Serras de Aire e Candeeiros, Maciço Florestal de Tomar',
      waterPoints: '16 fontes ativas catalogadas',
      emergencyContact: 'CDOS Santarém / 112',
      fireAlert: 'Atenção aos pinhais litorais e áreas agrícolas com biomassa e palha seca.',
      icnfNotice: 'Consulte a junta de freguesia antes de qualquer trabalho mecânico em espaço rural.',
    },
    Setúbal: {
      name: 'Setúbal',
      region: 'Lisboa e Vale do Tejo',
      level: 'Moderado',
      color: '#A8B88A',
      temp: '25°C',
      humidity: '50%',
      wind: '18 km/h W',
      criticalZones: 'Parque Natural da Arrábida, Litoral Alentejano (Sines/Grândola/Alcácer)',
      waterPoints: '15 fontes ativas catalogadas',
      emergencyContact: 'CDOS Setúbal / 112',
      fireAlert: 'Vigilância permanente nos pinhais de Grândola e nas encostas calcárias da Arrábida.',
      icnfNotice: 'Acesso a praias selvagens e falésias da Arrábida condicionado para circulação automóvel.',
    },
    'Viana do Castelo': {
      name: 'Viana do Castelo',
      region: 'Norte',
      level: 'Reduzido',
      color: '#5B9A68',
      temp: '19°C',
      humidity: '72%',
      wind: '14 km/h NW',
      criticalZones: 'Serra d’Arga, Vale do Rio Lima, Porta do Mezio e Soajo (PNPG)',
      waterPoints: '28 fontes ativas catalogadas',
      emergencyContact: 'CDOS Viana do Castelo / 112',
      fireAlert: 'Nível verde na orla costeira e vales fluviais; patrulhamento preventivo na Serra d’Arga.',
      icnfNotice: 'Queimas autorizadas desde que comunicadas previamente ao posto florestal ou bombeiros.',
    },
    'Vila Real': {
      name: 'Vila Real',
      region: 'Norte',
      level: 'Elevado',
      color: '#D4A359',
      temp: '26°C',
      humidity: '35%',
      wind: '20 km/h NE',
      criticalZones: 'Serra do Marão, Parque Natural do Alvão, Alto Douro Vinhateiro',
      waterPoints: '21 fontes ativas catalogadas',
      emergencyContact: 'CDOS Vila Real / 112',
      fireAlert: 'Aviso Amarelo: Encostas secas e relevo íngreme na bacia duriense.',
      icnfNotice: 'Sapadores florestais em piquete de intervenção rápida na serra do Marão.',
    },
    Viseu: {
      name: 'Viseu',
      region: 'Centro',
      level: 'Elevado',
      color: '#D4A359',
      temp: '26°C',
      humidity: '36%',
      wind: '19 km/h NE',
      criticalZones: 'Serra do Caramulo, Maciço da Gralheira (Montemuro), Vale do Dão',
      waterPoints: '23 fontes ativas catalogadas',
      emergencyContact: 'CDOS Viseu / 112',
      fireAlert: 'Aviso Amarelo: Áreas de pinhal e povoamentos florestais sob monitorização ativa.',
      icnfNotice: 'Proibida a queima de amontoados em dias de vento; mantenha faixas limpas de gestão de combustível.',
    },
    Açores: {
      name: 'Açores',
      region: 'Regiões Autónomas',
      level: 'Reduzido',
      color: '#5B9A68',
      temp: '21°C',
      humidity: '78%',
      wind: '22 km/h W',
      criticalZones: 'Caldeira das Sete Cidades, Faial (Capelinhos), Montanha do Pico',
      waterPoints: '35 nascentes ativas catalogadas',
      emergencyContact: 'Serviço Regional de Proteção Civil dos Açores (SRPCBA) / 112',
      fireAlert: 'Risco rural reduzido. Avisos de precaução para nevoeiros de altitude e precipitação local.',
      icnfNotice: 'Subida à Montanha do Pico sujeita a autorização prévia e localizador GPS individual.',
    },
    Madeira: {
      name: 'Madeira',
      region: 'Regiões Autónomas',
      level: 'Elevado',
      color: '#D4A359',
      temp: '25°C',
      humidity: '48%',
      wind: '26 km/h NE (Alísios)',
      criticalZones: 'Maciço Montanhoso Central (Pico Ruivo / Pico do Arieiro), Floresta Laurissilva',
      waterPoints: '42 levadas e nascentes ativas catalogadas',
      emergencyContact: 'Serviço Regional de Proteção Civil da Madeira (SRPC Madeira) / 112',
      fireAlert: 'Aviso Amarelo: Vento canalizado nas cristas e vales profundos com risco de queda de pedras.',
      icnfNotice: 'Acesso a trilhos e levadas de montanha condicionado. Expressamente proibido fogo na Laurissilva.',
    },
  };

  // Sample community members for Pillar 5
  const communityMembers = [
    {
      name: 'Gonçalo Tavares',
      district: 'Braga',
      focus: 'Bushcraft & Navegação de Montanha',
      exp: 'Avançado',
      badge: 'Guia de Campo',
    },
    {
      name: 'Sofia Henriques',
      district: 'Guarda',
      focus: 'Botânica Autóctone & Primeiros Socorros',
      exp: 'Intermédio',
      badge: 'Fitoterapia Rural',
    },
    {
      name: 'Tiago Resende',
      district: 'Sintra / Lisboa',
      focus: 'Comunicações Rádio PMR446 & DIY',
      exp: 'Avançado',
      badge: 'Operador Rádio',
    },
    {
      name: 'Duarte Seixas',
      district: 'Castelo Branco',
      focus: 'Construção de Abrigos & Tratamento de Água',
      exp: 'Intermédio',
      badge: 'Pioneirismo Florestal',
    },
    {
      name: 'Marta Figueira',
      district: 'Faro',
      focus: 'Gestão Hídrica & Sobrevivência Costeira',
      exp: 'Avançado',
      badge: 'Guia do Litoral',
    },
    {
      name: 'Nuno Carvalheiro',
      district: 'Porto',
      focus: 'Logística de Emergência & Mochila 72h',
      exp: 'Intermédio',
      badge: 'Resiliência Urbana',
    },
  ];

  const filteredMembers =
    memberRegionFilter === 'Todas'
      ? communityMembers
      : communityMembers.filter((m) => m.district.toLowerCase().includes(memberRegionFilter.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#16271c] text-[#E6D7C3] antialiased selection:bg-[#C85A3E]/30 selection:text-[#E6D7C3] flex flex-col relative overflow-x-hidden">
      {/* Background Studio Lighting mimicking reference image */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse 75% 55% at 65% 20%, rgba(42, 75, 52, 0.55) 0%, rgba(22, 39, 28, 0.95) 60%, #101c14 100%)',
        }}
      />

      {/* Accessible Skip Link */}
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#E6D7C3] focus:text-[#16271c] focus:rounded-md focus:font-semibold focus:shadow-xl"
      >
        Saltar para o conteúdo principal
      </a>

      {/* =====================================================================
          1. HEADER / TOP NAVIGATION (Clean Luxury 3-Zone Contract)
         ===================================================================== */}
      <header className="sticky top-0 z-40 bg-[#16271c]/90 backdrop-blur-md border-b border-white/10 transition-colors">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-6">
          {/* Zone 1: Logo & Brand Lockup */}
          <a
            href="#inicio"
            className="flex items-center gap-3.5 group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A8B88A] rounded-lg p-1"
            aria-label="Sobrevivente.eu — Início"
          >
            <img
              src="/assets/aistudio/logo_7a6369a0.png"
              alt="Sobrevivente.eu Logótipo"
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-200"
            />
            <div className="flex flex-col">
              <span className="font-display text-xl sm:text-2xl font-semibold text-[#E6D7C3] tracking-wide">
                Sobrevivente<span className="text-[#A8B88A]">.eu</span>
              </span>
            </div>
          </a>

          {/* Zone 2: Navigation Links to Pillars */}
          <nav
            aria-label="Navegação da comunidade"
            className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#E6D7C3]/80"
          >
            <a
              href="#manuais"
              className="hover:text-[#E6D7C3] underline-offset-8 hover:underline decoration-[#A8B88A] transition-colors whitespace-nowrap shrink-0"
            >
              Manuais
            </a>
            <a
              href="#informacoes"
              className="hover:text-[#E6D7C3] underline-offset-8 hover:underline decoration-[#A8B88A] transition-colors whitespace-nowrap shrink-0"
            >
              Informações Úteis
            </a>
            <a
              href="#grupos"
              className="hover:text-[#E6D7C3] underline-offset-8 hover:underline decoration-[#A8B88A] transition-colors whitespace-nowrap shrink-0"
            >
              Grupos
            </a>
            <a
              href="#foruns"
              className="hover:text-[#E6D7C3] underline-offset-8 hover:underline decoration-[#A8B88A] transition-colors whitespace-nowrap shrink-0"
            >
              Fóruns
            </a>
            <a
              href="#pessoas"
              className="hover:text-[#E6D7C3] underline-offset-8 hover:underline decoration-[#A8B88A] transition-colors whitespace-nowrap shrink-0"
            >
              Encontrar Pessoas
            </a>
            <a
              href="#loja"
              className="hover:text-[#E6D7C3] underline-offset-8 hover:underline decoration-[#A8B88A] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#A8B88A]" />
              <span>Loja de Utensílios</span>
            </a>
          </nav>

          {/* Zone 3: Quick Action / Mobile Hamburger */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2.5">
              <a
                href="https://www.sobrevivente.eu/entrar"
                className="px-4 py-2 text-xs font-medium text-[#E6D7C3]/90 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
              >
                Entrar
              </a>
              <a
                href="https://www.sobrevivente.eu/inscrever"
                className="px-4 py-2 text-xs font-medium bg-[#E6D7C3] text-[#16271c] rounded-full hover:bg-white transition-colors whitespace-nowrap font-sans font-semibold cursor-pointer shadow-sm"
              >
                Inscrever-se
              </a>
            </div>

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#E6D7C3] hover:bg-white/5 border border-white/10 transition-colors"
              aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#132117] border-b border-white/10 px-6 py-5 space-y-4 animate-in slide-in-from-top-2 duration-150">
            <nav className="flex flex-col space-y-3 text-sm font-medium text-[#E6D7C3]/90">
              <a
                href="#manuais"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#A8B88A] transition-colors"
              >
                Manuais Práticos
              </a>
              <a
                href="#informacoes"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#A8B88A] transition-colors"
              >
                Informações Úteis Actualizadas
              </a>
              <a
                href="#grupos"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#A8B88A] transition-colors"
              >
                Grupos & Núcleos
              </a>
              <a
                href="#foruns"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#A8B88A] transition-colors"
              >
                Fóruns de Discussão
              </a>
              <a
                href="#pessoas"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#A8B88A] transition-colors"
              >
                Encontrar Outras Pessoas
              </a>
              <a
                href="#loja"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#A8B88A] transition-colors flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-[#A8B88A]" />
                <span>Loja & Utensílios de Sobrevivência</span>
              </a>
            </nav>
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
              <a
                href="https://www.sobrevivente.eu/entrar"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-full border border-[#E6D7C3]/30 text-[#E6D7C3] text-sm font-medium hover:bg-white/5 cursor-pointer"
              >
                Entrar
              </a>
              <a
                href="https://www.sobrevivente.eu/inscrever"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-full bg-[#E6D7C3] text-[#16271c] text-sm font-semibold hover:bg-white cursor-pointer shadow-md"
              >
                Inscrever-se
              </a>
            </div>
          </div>
        )}
      </header>

      {/* =====================================================================
          MAIN CONTENT
         ===================================================================== */}
      <main id="conteudo-principal" tabIndex={-1} className="relative z-10 flex-1 outline-none">
        {/* ===================================================================
            HERO SECTION: Minimalist Luxury, 3-phrase headline & Pedestal
           =================================================================== */}
        <section
          id="inicio"
          className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-8 sm:pt-16 pb-16 sm:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center"
        >
          {/* Left Column: Phrasing, Editorial Subtitle, Exact 2 Buttons */}
          <div className="lg:col-span-6 space-y-8 text-center lg:text-left flex flex-col items-center lg:items-start">
            <span className="hero-fade-kicker text-xs sm:text-sm tracking-widest uppercase text-[#A8B88A]/90 font-medium">
              Comunidade de Resiliência & Autonomia · Portugal
            </span>

            {/* Exact phrases in separate lines, original colors & format with progressive fade-in */}
            <h1
              className="font-display font-semibold tracking-tight leading-[1.08]"
              style={{ fontSize: 'clamp(2.6rem, 5.2vw, 4.4rem)' }}
            >
              <span className="hero-fade-title-1 block text-[#E6D7C3]">Prepara-te.</span>
              <span className="hero-fade-title-2 block text-[#A8B88A]">Adapta-te.</span>
              <span className="hero-fade-title-3 block text-[#C85A3E]">Sobrevive.</span>
            </h1>

            <p className="hero-fade-desc text-base sm:text-lg text-[#E6D7C3]/80 leading-relaxed max-w-[52ch] font-normal">
              A comunidade independente em Portugal dedicada à partilha de manuais técnicos de campo, monitorização territorial em tempo real, núcleos regionais e entreajuda de proximidade.
            </p>

            {/* Exactly two buttons right at the start as requested with progressive fade-in */}
            <div className="hero-fade-buttons pt-2 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              {/* Button 1: Entrar with link www.sobrevivente.eu/entrar */}
              <a
                href="https://www.sobrevivente.eu/entrar"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-medium border border-[#E6D7C3]/45 text-[#E6D7C3] hover:border-[#E6D7C3] hover:bg-white/5 transition-all duration-200 text-center whitespace-nowrap cursor-pointer shadow-sm"
              >
                Entrar
              </a>

              {/* Button 2: Inscrever-se with link www.sobrevivente.eu/inscrever */}
              <a
                href="https://www.sobrevivente.eu/inscrever"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-semibold bg-[#E6D7C3] text-[#16271c] hover:bg-white transition-all duration-200 text-center whitespace-nowrap cursor-pointer shadow-lg shadow-black/25"
              >
                Inscrever-se
              </a>
            </div>

            {/* Subtle editorial trust anchors */}
            <div className="hero-fade-badges pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-[#E6D7C3]/65">
              <span>Manuais Práticos</span>
              <span aria-hidden="true">·</span>
              <span>Dados em Tempo Real</span>
              <span aria-hidden="true">·</span>
              <span>Núcleos Regionais</span>
              <span aria-hidden="true">·</span>
              <span>100% Gratuito</span>
            </div>
          </div>

          {/* Right Column: Architectural Pedestal Showcase with Metal Logo & Portugal + Islands Relief Map */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end hero-fade-pedestal">
            <div className="relative w-full max-w-[480px] rounded-[36px] bg-gradient-to-b from-[#203a29] via-[#1a3123] to-[#122218] p-6 sm:p-7 border border-white/10 shadow-2xl flex flex-col justify-between overflow-hidden group">
              {/* Subtle top spotlight glow */}
              <div
                className="absolute top-0 right-0 w-64 h-64 pointer-events-none rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(168, 184, 138, 0.22) 0%, transparent 70%)',
                }}
              />

              {/* Top Card Controls: Title & View Mode Selector */}
              <div className="relative z-20 flex items-center justify-between gap-2 pb-3 border-b border-white/10">
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider text-[#A8B88A] font-mono">
                    Território & Identidade
                  </span>
                  <span className="text-xs text-[#E6D7C3]/90 font-medium">
                    Portugal · Açores · Madeira
                  </span>
                </div>

                {/* Mode Selector */}
                <div className="flex items-center gap-1 p-1 bg-[#132217] rounded-lg border border-white/10 text-xs">
                  <button
                    onClick={() => setHeroDisplayMode('emblema')}
                    className={`px-2.5 py-1 rounded-md font-mono text-[11px] transition-colors ${
                      heroDisplayMode === 'emblema'
                        ? 'bg-[#264531] text-[#E6D7C3] shadow-sm font-semibold'
                        : 'text-[#E6D7C3]/60 hover:text-white'
                    }`}
                    aria-label="Ver emblema de metal"
                  >
                    Emblema
                  </button>
                  <button
                    onClick={() => setHeroDisplayMode('relevo')}
                    className={`px-2.5 py-1 rounded-md font-mono text-[11px] transition-colors flex items-center gap-1 ${
                      heroDisplayMode === 'relevo'
                        ? 'bg-[#264531] text-[#E6D7C3] shadow-sm font-semibold'
                        : 'text-[#E6D7C3]/60 hover:text-white'
                    }`}
                    aria-label="Ver mapa de relevo de Portugal e Ilhas"
                  >
                    <span>Relevo</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C85A3E]" />
                  </button>
                </div>
              </div>

              {/* Card Center: Mode 1 (Emblema com Relevo ao Fundo) vs Mode 2 (Mapa de Relevo Completo) */}
              {heroDisplayMode === 'emblema' ? (
                <div className="relative z-10 flex flex-col items-center my-auto py-4">
                  {/* Background Relief Map watermark/contours behind pedestal */}
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none transform scale-95"
                    aria-hidden="true"
                  >
                    <PortugalReliefMap compact={true} className="w-full h-full max-h-[290px]" />
                  </div>

                  {/* 3D Geometric Pedestal block with Floating Metal Medallion */}
                  <div className="relative flex flex-col items-center z-10">
                    {/* Floating Medallion with light reflection */}
                    <div className="relative mb-5 transform group-hover:scale-105 transition-transform duration-500">
                      <img
                        src="/assets/aistudio/logo_7a6369a0.png"
                        alt="Emblema Sobrevivente.eu em bronze sobre o relevo do território português"
                        className="w-32 h-32 sm:w-40 sm:h-40 object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.65)]"
                      />
                    </div>

                    {/* Architectural pedestal surface */}
                    <div className="w-56 sm:w-64 h-11 bg-[#264531] rounded-t-xl border-t border-x border-[#A8B88A]/30 shadow-lg flex items-center justify-center">
                      <span className="text-[11px] uppercase tracking-widest text-[#E6D7C3]/80 font-mono">
                        Autonomia · Natureza
                      </span>
                    </div>
                    {/* Pedestal base plinth */}
                    <div className="w-64 sm:w-72 h-6 bg-[#1c3324] rounded-b-lg border-b border-x border-black/40 shadow-2xl" />

                    {/* Regional Altitudes Interactive Pill */}
                    <button
                      onClick={() => setHeroDisplayMode('relevo')}
                      className="mt-4 px-3 py-1.5 rounded-full bg-[#142318]/90 hover:bg-[#1a3021] border border-[#A8B88A]/30 text-[11px] text-[#A8B88A] hover:text-[#E6D7C3] transition-colors flex items-center gap-2 font-mono group/btn"
                    >
                      <Layers className="w-3.5 h-3.5 text-[#C85A3E] group-hover/btn:rotate-12 transition-transform" />
                      <span>Relevo: Açores 2.351m · Estrela 1.993m · Madeira 1.862m</span>
                      <ChevronRight className="w-3 h-3 text-[#A8B88A]" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Mode 2: Full Interactive Topographic Relief Map with Portugal, Madeira & Açores */
                <div className="relative z-10 flex flex-col items-center my-auto py-2 animate-in fade-in duration-200">
                  <div className="w-full flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-[#A8B88A]">
                      Mapa Topográfico & Curvas de Nível
                    </span>
                    <button
                      onClick={() => setHeroDisplayMode('emblema')}
                      className="flex items-center gap-1.5 text-[11px] text-[#E6D7C3]/75 hover:text-white transition-colors"
                      title="Voltar ao emblema"
                    >
                      <img
                        src="/assets/aistudio/logo_7a6369a0.png"
                        alt="Miniatura do logótipo"
                        className="w-5 h-5 object-contain"
                      />
                      <span className="underline">Ver Emblema</span>
                    </button>
                  </div>

                  {/* Render the full SVG Topographic Relief Map */}
                  <div className="w-full bg-[#122218]/90 rounded-2xl p-2 border border-white/10 shadow-inner">
                    <PortugalReliefMap compact={false} />
                  </div>
                </div>
              )}

              {/* Bottom Quote & Explorer CTA */}
              <div className="relative z-10 text-center space-y-1.5 pt-3 border-t border-white/10">
                <p className="text-xs text-[#E6D7C3]/75 italic font-display">
                  «O conhecimento de campo não pesa na mochila.»
                </p>
                <div className="flex items-center justify-center gap-2 text-[11px] text-[#A8B88A]">
                  <span>6 Pilares da Comunidade abaixo</span>
                  <ArrowRight className="w-3.5 h-3.5 animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION TITLE: O Que Encontra na Comunidade
           =================================================================== */}
        <section className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-8 pb-10 text-center">
          <p className="text-xs sm:text-sm font-medium tracking-widest uppercase text-[#A8B88A]">
            O que poderá encontrar na comunidade
          </p>
          <h2 className="font-display text-3xl sm:text-4xl text-[#E6D7C3] font-medium tracking-tight mt-2">
            Os 6 Pilares de Autonomia
          </h2>
          <p className="text-sm sm:text-base text-[#E6D7C3]/70 max-w-[62ch] mx-auto mt-3">
            Estrutura completa pensada para capacitar qualquer pessoa com conhecimento prático, dados reais sobre o território português, equipamento de campo testado e uma rede solidária.
          </p>
        </section>

        {/* ===================================================================
            THE 6 PILLARS: Vertical Rounded Showcase Cards (2x3 Balanced Grid)
           =================================================================== */}
        <section className="max-w-[1280px] mx-auto px-4 sm:px-8 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
            {/* -------------------------------------------------------------
                PILLAR 1: MANUAIS
               ------------------------------------------------------------- */}
            <PillarRevealCard
              id="manuais"
              delayMs={0}
              className="rounded-[32px] bg-gradient-to-b from-[#1d3525] to-[#14261a] p-7 border border-white/10 hover:border-[#A8B88A]/40 transition-all duration-300 shadow-xl flex flex-col justify-between group"
            >
              <div className="space-y-6">
                {/* Visual Pedestal Header */}
                <div className="w-full aspect-[4/3] rounded-2xl bg-[#142318] border border-white/5 overflow-hidden relative flex items-center justify-center p-3">
                  <BushcraftIllustration type="water-filter" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-[#16271c]/80 backdrop-blur-sm text-[11px] text-[#A8B88A] border border-white/10 font-mono">
                    8 Manuais
                  </div>
                </div>

                {/* Typography Header */}
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#A8B88A] font-mono">
                    Pilar 01
                  </span>
                  <h3 className="font-display text-2xl text-[#E6D7C3] font-semibold mt-1">
                    Manuais Práticos
                  </h3>
                  <p className="text-sm text-[#E6D7C3]/75 mt-2 leading-relaxed">
                    Guias passo a passo testados em condições reais de terreno. Filtragem de água, fogo por fricção, abrigos térmicos, nós táticos e forrageamento seguro.
                  </p>
                </div>

                {/* Feature Checklist */}
                <ul className="space-y-2 text-xs text-[#E6D7C3]/80 pt-2 border-t border-white/10">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#A8B88A] shrink-0" />
                    <span>Passo a passo com materiais e ferramentas de campo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#A8B88A] shrink-0" />
                    <span>Descarregamento offline em ficheiro de texto</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#A8B88A] shrink-0" />
                    <span>Validação por técnicos de resgate e biólogos</span>
                  </li>
                </ul>
              </div>

              {/* Card Action */}
              <div className="pt-6 mt-6 border-t border-white/10">
                <button
                  onClick={() => setActivePillarModal('manuais')}
                  className="w-full py-3 px-5 rounded-full bg-[#24422e] hover:bg-[#2e533b] text-[#E6D7C3] font-medium text-xs tracking-wide transition-colors flex items-center justify-center gap-2 border border-[#A8B88A]/25 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-[#A8B88A]" />
                  <span>Explorar Manuais de Campo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </PillarRevealCard>

            {/* -------------------------------------------------------------
                PILLAR 2: INFORMAÇÕES ÚTEIS ACTUALIZADAS
               ------------------------------------------------------------- */}
            <PillarRevealCard
              id="informacoes"
              delayMs={120}
              className="rounded-[32px] bg-gradient-to-b from-[#1d3525] to-[#14261a] p-7 border border-white/10 hover:border-[#A8B88A]/40 transition-all duration-300 shadow-xl flex flex-col justify-between group"
            >
              <div className="space-y-6">
                {/* Visual Pedestal Header with Dynamic Live District Status */}
                <div className="w-full rounded-2xl bg-[#142318] border border-white/5 overflow-hidden relative flex flex-col justify-between p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#A8B88A]">IPMA & ANEPC Live</span>
                    <span
                      className="text-xs px-2.5 py-0.5 rounded-full font-semibold border transition-colors"
                      style={{
                        backgroundColor: `${districtRiskData[selectedDistrict]?.color || '#C85A3E'}22`,
                        color: districtRiskData[selectedDistrict]?.color || '#C85A3E',
                        borderColor: `${districtRiskData[selectedDistrict]?.color || '#C85A3E'}50`,
                      }}
                    >
                      {districtRiskData[selectedDistrict]?.level || 'Muito Elevado'}
                    </span>
                  </div>

                  <div className="space-y-1.5 my-auto">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-display font-medium text-[#E6D7C3]">
                        Perigo de Incêndio
                      </span>
                      <span className="text-xs font-mono font-normal text-[#E6D7C3]/80">
                        {districtRiskData[selectedDistrict]?.temp} · {districtRiskData[selectedDistrict]?.humidity}
                      </span>
                    </div>
                    <p className="text-xs text-[#E6D7C3]/75 line-clamp-2">
                      {districtRiskData[selectedDistrict]?.fireAlert}
                    </p>

                    {/* Quick District Selector directly inside the card */}
                    <div className="pt-2">
                      <label htmlFor="landing-district-select" className="text-[10px] uppercase font-mono tracking-wider text-[#A8B88A] block mb-1">
                        Distrito em consulta:
                      </label>
                      <div className="relative flex items-center">
                        <MapPin className="w-3.5 h-3.5 text-[#A8B88A] absolute left-2.5 pointer-events-none" />
                        <select
                          id="landing-district-select"
                          value={selectedDistrict}
                          onChange={(e) => setSelectedDistrict(e.target.value as PortugalDistrict)}
                          className="w-full bg-[#1c3324] text-[#E6D7C3] text-xs py-1.5 pl-8 pr-3 rounded-lg border border-white/10 hover:border-[#A8B88A]/40 focus:border-[#A8B88A] focus:outline-none cursor-pointer"
                        >
                          <optgroup label="Norte">
                            <option value="Braga">Braga</option>
                            <option value="Bragança">Bragança</option>
                            <option value="Porto">Porto</option>
                            <option value="Viana do Castelo">Viana do Castelo</option>
                            <option value="Vila Real">Vila Real</option>
                          </optgroup>
                          <optgroup label="Centro">
                            <option value="Aveiro">Aveiro</option>
                            <option value="Castelo Branco">Castelo Branco</option>
                            <option value="Coimbra">Coimbra</option>
                            <option value="Guarda">Guarda</option>
                            <option value="Leiria">Leiria</option>
                            <option value="Viseu">Viseu</option>
                          </optgroup>
                          <optgroup label="Lisboa e Vale do Tejo">
                            <option value="Lisboa">Lisboa</option>
                            <option value="Santarém">Santarém</option>
                            <option value="Setúbal">Setúbal</option>
                          </optgroup>
                          <optgroup label="Alentejo">
                            <option value="Beja">Beja</option>
                            <option value="Évora">Évora</option>
                            <option value="Portalegre">Portalegre</option>
                          </optgroup>
                          <optgroup label="Algarve">
                            <option value="Faro">Faro</option>
                          </optgroup>
                          <optgroup label="Regiões Autónomas">
                            <option value="Açores">Açores</option>
                            <option value="Madeira">Madeira</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10 text-[#E6D7C3]/60 font-mono">
                    <span className="truncate max-w-[170px]">{selectedDistrict}: {districtRiskData[selectedDistrict]?.level}</span>
                    <span>18 Distritos + Ilhas</span>
                  </div>
                </div>

                {/* Typography Header */}
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#A8B88A] font-mono">
                    Pilar 02
                  </span>
                  <h3 className="font-display text-2xl text-[#E6D7C3] font-semibold mt-1">
                    Informações Úteis Actualizadas
                  </h3>
                  <p className="text-sm text-[#E6D7C3]/75 mt-2 leading-relaxed">
                    Acompanhamento contínuo dos 18 distritos de Portugal continental e das regiões autónomas dos Açores e Madeira. Risco de incêndio rural diário, avisos de proteção civil, nascentes hídricas e normas ICNF.
                  </p>
                </div>

                {/* Feature Checklist */}
                <ul className="space-y-2 text-xs text-[#E6D7C3]/80 pt-2 border-t border-white/10">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#A8B88A] shrink-0" />
                    <span>Consulta completa dos 18 distritos + Açores e Madeira</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#A8B88A] shrink-0" />
                    <span>Regras legais de pernoita e uso do fogo em vigor</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#A8B88A] shrink-0" />
                    <span>Cadastro comunitário de pontos de água potável</span>
                  </li>
                </ul>
              </div>

              {/* Card Action */}
              <div className="pt-6 mt-6 border-t border-white/10">
                <button
                  onClick={() => setActivePillarModal('informacoes')}
                  className="w-full py-3 px-5 rounded-full bg-[#24422e] hover:bg-[#2e533b] text-[#E6D7C3] font-medium text-xs tracking-wide transition-colors flex items-center justify-center gap-2 border border-[#A8B88A]/25 cursor-pointer"
                >
                  <Thermometer className="w-4 h-4 text-[#A8B88A]" />
                  <span>Consultar Todos os Distritos</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </PillarRevealCard>

            {/* -------------------------------------------------------------
                PILLAR 3: GRUPOS & NÚCLEOS
               ------------------------------------------------------------- */}
            <PillarRevealCard
              id="grupos"
              delayMs={240}
              className="rounded-[32px] bg-gradient-to-b from-[#1d3525] to-[#14261a] p-7 border border-white/10 hover:border-[#A8B88A]/40 transition-all duration-300 shadow-xl flex flex-col justify-between group"
            >
              <div className="space-y-6">
                {/* Visual Pedestal Header */}
                <div className="w-full aspect-[4/3] rounded-2xl bg-[#142318] border border-white/5 overflow-hidden relative flex flex-col justify-between p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#A8B88A]">Núcleos Regionais</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#A8B88A]/20 text-[#A8B88A] border border-[#A8B88A]/30">
                      Norte a Sul
                    </span>
                  </div>

                  <div className="space-y-1.5 my-auto">
                    <div className="text-sm font-semibold text-[#E6D7C3] flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#C85A3E]" />
                      <span>Gerês · Estrela · Sintra · Alentejo</span>
                    </div>
                    <p className="text-xs text-[#E6D7C3]/70">
                      Equipas autónomas que organizam treinos de campo e apoio mútuo.
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10 text-[#E6D7C3]/60 font-mono">
                    <span>6 Núcleos Ativos</span>
                    <span>Saídas Presenciais</span>
                  </div>
                </div>

                {/* Typography Header */}
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#A8B88A] font-mono">
                    Pilar 03
                  </span>
                  <h3 className="font-display text-2xl text-[#E6D7C3] font-semibold mt-1">
                    Grupos & Núcleos
                  </h3>
                  <p className="text-sm text-[#E6D7C3]/75 mt-2 leading-relaxed">
                    A sobrevivência é mais forte em comunidade. Conecte-se a núcleos locais organizados por relevo e clima em Portugal continental e ilhas.
                  </p>
                </div>

                {/* Feature Checklist */}
                <ul className="space-y-2 text-xs text-[#E6D7C3]/80 pt-2 border-t border-white/10">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#A8B88A] shrink-0" />
                    <span>Equipas regionais com bivaques e treinos práticos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#A8B88A] shrink-0" />
                    <span>Círculos temáticos de rádio PMR446 e primeiros socorros</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#A8B88A] shrink-0" />
                    <span>Protocolos de comunicação em caso de corte de rede</span>
                  </li>
                </ul>
              </div>

              {/* Card Action */}
              <div className="pt-6 mt-6 border-t border-white/10">
                <button
                  onClick={() => setActivePillarModal('grupos')}
                  className="w-full py-3 px-5 rounded-full bg-[#24422e] hover:bg-[#2e533b] text-[#E6D7C3] font-medium text-xs tracking-wide transition-colors flex items-center justify-center gap-2 border border-[#A8B88A]/25 cursor-pointer"
                >
                  <Users className="w-4 h-4 text-[#A8B88A]" />
                  <span>Ver Núcleos Regionais</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </PillarRevealCard>

            {/* -------------------------------------------------------------
                PILLAR 4: FÓRUNS DE DISCUSSÃO
               ------------------------------------------------------------- */}
            <PillarRevealCard
              id="foruns"
              delayMs={120}
              className="rounded-[32px] bg-gradient-to-b from-[#1d3525] to-[#14261a] p-7 border border-white/10 hover:border-[#A8B88A]/40 transition-all duration-300 shadow-xl flex flex-col justify-between group"
            >
              <div className="space-y-6">
                {/* Visual Pedestal Header */}
                <div className="w-full aspect-[4/3] rounded-2xl bg-[#142318] border border-white/5 overflow-hidden relative flex flex-col justify-between p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#A8B88A]">Bancada de Discussão</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-[#E6D7C3] font-medium">
                      Sem Publicidade
                    </span>
                  </div>

                  <div className="space-y-1.5 my-auto">
                    <div className="text-sm font-semibold text-[#E6D7C3]">
                      «Testes reais de lâminas, filtros e rádios»
                    </div>
                    <p className="text-xs text-[#E6D7C3]/70">
                      Análises sinceras de membros sem patrocínios nem links afiliados.
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10 text-[#E6D7C3]/60 font-mono">
                    <span>Perguntas Táticas</span>
                    <span>Bancada DIY</span>
                  </div>
                </div>

                {/* Typography Header */}
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#A8B88A] font-mono">
                    Pilar 04
                  </span>
                  <h3 className="font-display text-2xl text-[#E6D7C3] font-semibold mt-1">
                    Fóruns da Comunidade
                  </h3>
                  <p className="text-sm text-[#E6D7C3]/75 mt-2 leading-relaxed">
                    Espaço sério e despretensioso para esclarecer dúvidas táticas, partilhar relatórios pós-expedição e construir equipamento na bancada faça-você-mesmo.
                  </p>
                </div>

                {/* Feature Checklist */}
                <ul className="space-y-2 text-xs text-[#E6D7C3]/80 pt-2 border-t border-white/10">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#A8B88A] shrink-0" />
                    <span>Análises honestas de equipamento testado no terreno</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#A8B88A] shrink-0" />
                    <span>Respostas detalhadas de praticantes experientes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#A8B88A] shrink-0" />
                    <span>Relatórios de travessias e erros para não repetir</span>
                  </li>
                </ul>
              </div>

              {/* Card Action */}
              <div className="pt-6 mt-6 border-t border-white/10">
                <button
                  onClick={() => setActivePillarModal('foruns')}
                  className="w-full py-3 px-5 rounded-full bg-[#24422e] hover:bg-[#2e533b] text-[#E6D7C3] font-medium text-xs tracking-wide transition-colors flex items-center justify-center gap-2 border border-[#A8B88A]/25 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-[#A8B88A]" />
                  <span>Explorar Fóruns e Tópicos</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </PillarRevealCard>

            {/* -------------------------------------------------------------
                PILLAR 5: ENCONTRAR OUTRAS PESSOAS
               ------------------------------------------------------------- */}
            <PillarRevealCard
              id="pessoas"
              delayMs={240}
              className="rounded-[32px] bg-gradient-to-b from-[#1d3525] to-[#14261a] p-7 border border-white/10 hover:border-[#A8B88A]/40 transition-all duration-300 shadow-xl flex flex-col justify-between group"
            >
              <div className="space-y-6">
                {/* Visual Pedestal Header */}
                <div className="w-full aspect-[4/3] rounded-2xl bg-[#142318] border border-white/5 overflow-hidden relative flex flex-col justify-between p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#A8B88A]">Rede de Proximidade</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#E6D7C3]/15 text-[#E6D7C3] font-medium">
                      Entreajuda
                    </span>
                  </div>

                  <div className="space-y-1.5 my-auto">
                    <div className="text-sm font-semibold text-[#E6D7C3] flex items-center gap-2">
                      <Compass className="w-4 h-4 text-[#A8B88A]" />
                      <span>Companheiros de Marcha & Bivaque</span>
                    </div>
                    <p className="text-xs text-[#E6D7C3]/70">
                      Encontre pessoas da sua região para praticar com segurança.
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10 text-[#E6D7C3]/60 font-mono">
                    <span>Duplas de Autonomia</span>
                    <span>Apoio Local</span>
                  </div>
                </div>

                {/* Typography Header */}
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#A8B88A] font-mono">
                    Pilar 05
                  </span>
                  <h3 className="font-display text-2xl text-[#E6D7C3] font-semibold mt-1">
                    Encontrar Outras Pessoas
                  </h3>
                  <p className="text-sm text-[#E6D7C3]/75 mt-2 leading-relaxed">
                    Não precisa de treinar sozinho. Conheça outros membros no seu concelho, forme duplas de marcha e participe numa rede voluntária de auxílio mútuo em emergências.
                  </p>
                </div>

                {/* Feature Checklist */}
                <ul className="space-y-2 text-xs text-[#E6D7C3]/80 pt-2 border-t border-white/10">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#A8B88A] shrink-0" />
                    <span>Diretório de exploradores por concelho/distrito</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#A8B88A] shrink-0" />
                    <span>Companheiros para travessias e caminhadas de autonomia</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#A8B88A] shrink-0" />
                    <span>Rede solidária para tempestades ou falhas de energia</span>
                  </li>
                </ul>
              </div>

              {/* Card Action */}
              <div className="pt-6 mt-6 border-t border-white/10">
                <button
                  onClick={() => setActivePillarModal('pessoas')}
                  className="w-full py-3 px-5 rounded-full bg-[#24422e] hover:bg-[#2e533b] text-[#E6D7C3] font-medium text-xs tracking-wide transition-colors flex items-center justify-center gap-2 border border-[#A8B88A]/25 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-[#A8B88A]" />
                  <span>Encontrar Praticantes Próximos</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </PillarRevealCard>

            {/* -------------------------------------------------------------
                PILLAR 6: LOJA & UTENSÍLIOS DE SOBREVIVÊNCIA
               ------------------------------------------------------------- */}
            <PillarRevealCard
              id="loja"
              delayMs={360}
              className="rounded-[32px] bg-gradient-to-b from-[#1d3525] to-[#14261a] p-7 border border-white/10 hover:border-[#A8B88A]/40 transition-all duration-300 shadow-xl flex flex-col justify-between group"
            >
              <div className="space-y-6">
                {/* Visual Pedestal Header */}
                <div className="w-full aspect-[4/3] rounded-2xl bg-[#142318] border border-white/5 overflow-hidden relative flex flex-col justify-between p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#A8B88A]">Bazar & Equipamento</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#C85A3E]/20 text-[#C85A3E] border border-[#C85A3E]/30 font-medium">
                      12 Utensílios Úteis
                    </span>
                  </div>

                  <div className="space-y-1.5 my-auto">
                    <div className="text-sm font-semibold text-[#E6D7C3] flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-[#A8B88A]" />
                      <span>Ferramentas Testadas no Terreno</span>
                    </div>
                    <p className="text-xs text-[#E6D7C3]/70">
                      Água, fogo, abrigo, corte, rádio e primeiros socorros sem quinquilharias.
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10 text-[#E6D7C3]/60 font-mono">
                    <span>Filtros · Faca Scandi · Tarp</span>
                    <span>Lista 72h</span>
                  </div>
                </div>

                {/* Typography Header */}
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#A8B88A] font-mono">
                    Pilar 06
                  </span>
                  <h3 className="font-display text-2xl text-[#E6D7C3] font-semibold mt-1">
                    Loja & Utensílios Úteis
                  </h3>
                  <p className="text-sm text-[#E6D7C3]/75 mt-2 leading-relaxed">
                    Utensílios e equipamento de sobrevivência indispensáveis, rigorosamente avaliados por praticantes em Portugal. Sem patrocínios ou brinquedos: apenas ferramentas que salvam vidas.
                  </p>
                </div>

                {/* Feature Checklist */}
                <ul className="space-y-2 text-xs text-[#E6D7C3]/80 pt-2 border-t border-white/10">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#A8B88A] shrink-0" />
                    <span>Curadoria séria: testado nas serras e matas nacionais</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#A8B88A] shrink-0" />
                    <span>Fichas técnicas com peso exato em gramas e utilidade</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#A8B88A] shrink-0" />
                    <span>Montagem interativa e exportação do kit de mochila</span>
                  </li>
                </ul>
              </div>

              {/* Card Action */}
              <div className="pt-6 mt-6 border-t border-white/10">
                <button
                  onClick={() => setActivePillarModal('loja')}
                  className="w-full py-3 px-5 rounded-full bg-[#24422e] hover:bg-[#2e533b] text-[#E6D7C3] font-medium text-xs tracking-wide transition-colors flex items-center justify-center gap-2 border border-[#A8B88A]/25 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-[#A8B88A]" />
                  <span>Explorar Loja de Utensílios</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </PillarRevealCard>
          </div>
        </section>

        {/* ===================================================================
            COMMUNITY PHILOSOPHY & BOTTOM CONVERSION BLOCK
           =================================================================== */}
        <section className="max-w-[1280px] mx-auto px-4 sm:px-8 pb-20">
          <div className="rounded-[36px] bg-gradient-to-b from-[#1a3324] to-[#122218] border border-white/10 p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
            {/* Ambient subtle glow */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 pointer-events-none rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(168, 184, 138, 0.14) 0%, transparent 70%)',
              }}
            />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <span className="text-xs uppercase tracking-widest text-[#A8B88A] font-mono">
                Junte-se a Nós
              </span>
              <h2 className="font-display text-3xl sm:text-4xl text-[#E6D7C3] font-semibold">
                Comece hoje a desenvolver a sua autonomia
              </h2>
              <p className="text-sm sm:text-base text-[#E6D7C3]/80 leading-relaxed font-normal">
                Aceda gratuitamente aos manuais de campo completos, participe nas conversas do fórum, receba alertas de território e conecte-se com pessoas da sua região.
              </p>

              {/* The Two Action Buttons repeated cleanly at bottom */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://www.sobrevivente.eu/entrar"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-medium border border-[#E6D7C3]/45 text-[#E6D7C3] hover:border-[#E6D7C3] hover:bg-white/5 transition-all text-center whitespace-nowrap cursor-pointer"
                >
                  Entrar
                </a>
                <a
                  href="https://www.sobrevivente.eu/inscrever"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-semibold bg-[#E6D7C3] text-[#16271c] hover:bg-white transition-all text-center whitespace-nowrap cursor-pointer shadow-lg shadow-black/25"
                >
                  Inscrever-se
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================================
          FOOTER (Quiet, Compliant, Respectful)
         ===================================================================== */}
      <footer className="border-t border-white/10 bg-[#121f16] py-12 text-xs text-[#E6D7C3]/70">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-white/10">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3">
              <img
                src="/assets/aistudio/logo_7a6369a0.png"
                alt="Logótipo Sobrevivente.eu"
                className="w-8 h-8 object-contain"
              />
              <span className="font-display text-base font-semibold text-[#E6D7C3]">
                Sobrevivente.eu
              </span>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-[#E6D7C3]/80">
              <a href="#manuais" className="hover:text-white transition-colors">
                Manuais
              </a>
              <a href="#informacoes" className="hover:text-white transition-colors">
                Informações Úteis
              </a>
              <a href="#grupos" className="hover:text-white transition-colors">
                Grupos
              </a>
              <a href="#foruns" className="hover:text-white transition-colors">
                Fóruns
              </a>
              <a href="#pessoas" className="hover:text-white transition-colors">
                Encontrar Pessoas
              </a>
              <a
                href="https://www.sobrevivente.eu/entrar"
                className="hover:text-white transition-colors cursor-pointer"
              >
                Entrar
              </a>
              <a
                href="https://www.sobrevivente.eu/inscrever"
                className="hover:text-white transition-colors cursor-pointer"
              >
                Inscrever-se
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[#E6D7C3]/50">
            <p>
              © {new Date().getFullYear()} Sobrevivente.eu — Plataforma cívica e educativa de sobrevivencialismo ético em Portugal.
            </p>
            <p className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#A8B88A]" />
              <span>Em caso de emergência real ligue sempre 112 (Emergência) ou 117 (Incêndios Florestais).</span>
            </p>
          </div>
        </div>
      </footer>

      {/* =====================================================================
          INTERACTIVE PILLAR PREVIEW MODALS
          (Provides instant interactive access to verified data without clutter)
         ===================================================================== */}

      {/* MODAL 1: MANUAIS */}
      {activePillarModal === 'manuais' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-manuais-titulo"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActivePillarModal(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] bg-[#16271c] border border-white/15 rounded-[28px] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#132218]">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#A8B88A] font-mono">
                  Pilar 01 · Biblioteca de Campo
                </span>
                <h3 id="modal-manuais-titulo" className="font-display text-2xl text-[#E6D7C3] font-semibold">
                  Manuais Práticos de Campo
                </h3>
              </div>
              <button
                onClick={() => setActivePillarModal(null)}
                className="p-2 rounded-full hover:bg-white/10 text-[#E6D7C3] transition-colors"
                aria-label="Fechar janela de manuais"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Manuals Grid */}
            <div className="p-6 overflow-y-auto space-y-4">
              <p className="text-sm text-[#E6D7C3]/80">
                Estes são os manuais práticos disponíveis na comunidade. Selecione um manual para consultar o passo a passo ou descarregá-lo para leitura offline:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {FEATURED_MANUALS.map((manual) => (
                  <div
                    key={manual.id}
                    onClick={() => setSelectedManualDetail(manual)}
                    className="p-4 rounded-2xl bg-[#1d3525]/70 hover:bg-[#1d3525] border border-white/10 hover:border-[#A8B88A]/50 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-[#A8B88A] font-mono">
                        <span>{manual.categoryLabel}</span>
                        <span>{manual.readTime}</span>
                      </div>
                      <h4 className="font-display text-lg text-[#E6D7C3] font-semibold mt-1 group-hover:text-white transition-colors">
                        {manual.title}
                      </h4>
                      <p className="text-xs text-[#E6D7C3]/75 mt-1 line-clamp-2">
                        {manual.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#E6D7C3]/60 pt-2 border-t border-white/5">
                      <span>Nível: {manual.level}</span>
                      <span className="text-[#A8B88A] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Ler passos <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer with Direct CTAs */}
            <div className="px-6 py-4 border-t border-white/10 bg-[#132218] flex items-center justify-between text-xs">
              <span className="text-[#E6D7C3]/70">
                Quer guardar manuais na sua mochila pessoal?
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.sobrevivente.eu/entrar"
                  className="px-4 py-2 rounded-full border border-[#E6D7C3]/30 text-[#E6D7C3] hover:bg-white/5 cursor-pointer"
                >
                  Entrar
                </a>
                <a
                  href="https://www.sobrevivente.eu/inscrever"
                  className="px-4 py-2 rounded-full bg-[#E6D7C3] text-[#16271c] font-semibold hover:bg-white cursor-pointer"
                >
                  Inscrever-se
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL: READ SPECIFIC MANUAL */}
      {selectedManualDetail && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="manual-detalhe-titulo"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedManualDetail(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[92vh] bg-[#16271c] border border-white/20 rounded-[28px] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#132218]">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#A8B88A] font-mono">
                  {selectedManualDetail.categoryLabel} · {selectedManualDetail.level}
                </span>
                <h3 id="manual-detalhe-titulo" className="font-display text-2xl text-[#E6D7C3] font-semibold">
                  {selectedManualDetail.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedManualDetail(null)}
                className="p-2 rounded-full hover:bg-white/10 text-[#E6D7C3] transition-colors"
                aria-label="Fechar manual"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              <p className="text-sm text-[#E6D7C3]/90 leading-relaxed font-normal">
                {selectedManualDetail.summary}
              </p>

              {/* Materials */}
              <div className="p-4 rounded-xl bg-[#142318] border border-white/10 space-y-2">
                <span className="text-xs uppercase tracking-wider text-[#A8B88A] font-mono font-medium">
                  Materiais e Ferramentas Necessárias:
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedManualDetail.materials.map((mat, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-md bg-[#1d3525] text-xs text-[#E6D7C3] border border-white/10"
                    >
                      {mat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                <span className="text-xs uppercase tracking-wider text-[#A8B88A] font-mono font-medium">
                  Passo a Passo Técnico:
                </span>
                <div className="space-y-3">
                  {selectedManualDetail.steps.map((st, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-[#1c3324] border border-white/5 space-y-1"
                    >
                      <div className="text-sm font-semibold text-[#E6D7C3] flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#A8B88A]/20 text-[#A8B88A] text-xs flex items-center justify-center font-mono">
                          {i + 1}
                        </span>
                        <span>{st.title}</span>
                      </div>
                      <p className="text-xs text-[#E6D7C3]/75 leading-relaxed pl-7">
                        {st.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Field Note / Disclaimer */}
              <div className="p-4 rounded-xl bg-[#2a1e1b] border border-[#C85A3E]/30 text-xs text-[#E6D7C3]/80 space-y-1">
                <span className="text-[#C85A3E] font-medium flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Regulamento Florestal e Segurança:
                </span>
                <p>{selectedManualDetail.fieldNote}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 bg-[#132218] flex items-center justify-between">
              <button
                onClick={() => handleDownloadManualTxt(selectedManualDetail)}
                className="px-4 py-2 rounded-full border border-[#A8B88A]/40 text-[#E6D7C3] text-xs font-medium hover:bg-[#A8B88A]/10 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#A8B88A]" />
                <span>Descarregar TXT Offline</span>
              </button>

              <button
                onClick={() => setSelectedManualDetail(null)}
                className="px-5 py-2 rounded-full bg-[#E6D7C3] text-[#16271c] text-xs font-semibold hover:bg-white transition-colors"
              >
                Concluir Leitura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: INFORMAÇÕES ÚTEIS */}
      {activePillarModal === 'informacoes' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-info-titulo"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActivePillarModal(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] bg-[#16271c] border border-white/15 rounded-[28px] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#132218]">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#A8B88A] font-mono">
                  Pilar 02 · Monitorização Territorial
                </span>
                <h3 id="modal-info-titulo" className="font-display text-2xl text-[#E6D7C3] font-semibold">
                  Informações Úteis em Tempo Real
                </h3>
              </div>
              <button
                onClick={() => setActivePillarModal(null)}
                className="p-2 rounded-full hover:bg-white/10 text-[#E6D7C3] transition-colors"
                aria-label="Fechar informações úteis"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Complete Portugal District Risk Inspector */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Filter Controls: Search & Regional Categorization */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs uppercase tracking-wider text-[#A8B88A] font-mono font-medium">
                    Consultar Todos os Distritos de Portugal (18 + Regiões Autónomas):
                  </span>
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-[#A8B88A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={districtSearchQuery}
                      onChange={(e) => setDistrictSearchQuery(e.target.value)}
                      placeholder="Pesquisar distrito ou serra..."
                      className="w-full bg-[#142318] text-[#E6D7C3] placeholder-[#E6D7C3]/40 text-xs py-1.5 pl-8 pr-7 rounded-full border border-white/10 focus:border-[#A8B88A] focus:outline-none"
                    />
                    {districtSearchQuery && (
                      <button
                        onClick={() => setDistrictSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#E6D7C3]/50 hover:text-[#E6D7C3]"
                        aria-label="Limpar pesquisa"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Regional Filter Tabs */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { id: 'Todos', label: 'Todos (20)' },
                    { id: 'Norte', label: 'Norte (5)' },
                    { id: 'Centro', label: 'Centro (6)' },
                    { id: 'Lisboa e Vale do Tejo', label: 'Lisboa & Tejo (3)' },
                    { id: 'Alentejo', label: 'Alentejo (3)' },
                    { id: 'Algarve', label: 'Algarve (1)' },
                    { id: 'Regiões Autónomas', label: 'Ilhas (2)' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setDistrictRegionFilter(tab.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-mono transition-colors cursor-pointer ${
                        districtRegionFilter === tab.id
                          ? 'bg-[#A8B88A] text-[#16271c] font-semibold'
                          : 'bg-[#142318] text-[#E6D7C3]/70 hover:bg-[#1c3324] border border-white/5'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* District Buttons Grid */}
                <div className="flex flex-wrap gap-2 pt-2 max-h-48 overflow-y-auto p-1 rounded-xl bg-[#132218]/50 border border-white/5">
                  {(Object.keys(districtRiskData) as PortugalDistrict[])
                    .filter((key) => {
                      const item = districtRiskData[key];
                      if (!item) return false;
                      const matchesRegion =
                        districtRegionFilter === 'Todos' || item.region === districtRegionFilter;
                      const matchesSearch =
                        districtSearchQuery.trim() === '' ||
                        item.name.toLowerCase().includes(districtSearchQuery.toLowerCase()) ||
                        item.criticalZones.toLowerCase().includes(districtSearchQuery.toLowerCase()) ||
                        item.region.toLowerCase().includes(districtSearchQuery.toLowerCase());
                      return matchesRegion && matchesSearch;
                    })
                    .map((dist) => {
                      const info = districtRiskData[dist];
                      const isSelected = selectedDistrict === dist;
                      return (
                        <button
                          key={dist}
                          onClick={() => setSelectedDistrict(dist)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-2 border ${
                            isSelected
                              ? 'bg-[#E6D7C3] text-[#16271c] font-semibold shadow-md border-[#E6D7C3]'
                              : 'bg-[#1c3324] text-[#E6D7C3]/80 hover:bg-[#23422f] border-white/10'
                          }`}
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: info.color }}
                            title={`Perigo: ${info.level}`}
                          />
                          <span>{dist}</span>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Active District Comprehensive Dashboard Card */}
              {districtRiskData[selectedDistrict] && (
                <div className="p-6 rounded-2xl bg-[#142318] border border-white/10 space-y-5 shadow-inner">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-white/10 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[#A8B88A]">
                          Boletim Territorial · Região {districtRiskData[selectedDistrict].region}
                        </span>
                      </div>
                      <h4 className="font-display text-2xl text-[#E6D7C3] font-semibold mt-0.5">
                        {selectedDistrict === 'Açores' || selectedDistrict === 'Madeira'
                          ? `Região Autónoma dos ${selectedDistrict}`
                          : `Distrito de ${selectedDistrict}`}
                      </h4>
                      <p className="text-xs text-[#E6D7C3]/70 mt-1 flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-[#A8B88A]" />
                        <span>Relevos & Zonas Críticas: {districtRiskData[selectedDistrict].criticalZones}</span>
                      </p>
                    </div>

                    <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#E6D7C3]/70">Nível de Perigo IPMA:</span>
                        <span
                          className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                          style={{
                            backgroundColor: `${districtRiskData[selectedDistrict].color}25`,
                            color: districtRiskData[selectedDistrict].color,
                            border: `1px solid ${districtRiskData[selectedDistrict].color}50`,
                          }}
                        >
                          {districtRiskData[selectedDistrict].level}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-[#E6D7C3]/50">
                        Índice FWI Atualizado Hoje
                      </span>
                    </div>
                  </div>

                  {/* 4-Metric Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-[#1c3324] border border-white/5 text-center">
                      <div className="flex items-center justify-center gap-1 text-[11px] text-[#A8B88A] font-mono">
                        <Thermometer className="w-3.5 h-3.5" />
                        <span>Temperatura</span>
                      </div>
                      <p className="text-lg font-semibold text-[#E6D7C3] mt-1">
                        {districtRiskData[selectedDistrict].temp}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#1c3324] border border-white/5 text-center">
                      <div className="flex items-center justify-center gap-1 text-[11px] text-[#A8B88A] font-mono">
                        <Droplets className="w-3.5 h-3.5" />
                        <span>Humidade</span>
                      </div>
                      <p className="text-lg font-semibold text-[#E6D7C3] mt-1">
                        {districtRiskData[selectedDistrict].humidity}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#1c3324] border border-white/5 text-center">
                      <div className="flex items-center justify-center gap-1 text-[11px] text-[#A8B88A] font-mono">
                        <Wind className="w-3.5 h-3.5" />
                        <span>Vento</span>
                      </div>
                      <p className="text-sm font-semibold text-[#E6D7C3] mt-1 truncate">
                        {districtRiskData[selectedDistrict].wind}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#1c3324] border border-white/5 text-center">
                      <div className="flex items-center justify-center gap-1 text-[11px] text-[#A8B88A] font-mono">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Fontes de Água</span>
                      </div>
                      <p className="text-xs font-semibold text-[#E6D7C3] mt-1 line-clamp-1">
                        {districtRiskData[selectedDistrict].waterPoints}
                      </p>
                    </div>
                  </div>

                  {/* Directives & Regulations */}
                  <div className="space-y-2.5 text-xs">
                    <div className="p-3.5 rounded-xl bg-[#1f2821] border border-white/5 flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-[#C85A3E] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#E6D7C3]">Alerta ANEPC / Proteção Civil: </span>
                        <span className="text-[#E6D7C3]/80">{districtRiskData[selectedDistrict].fireAlert}</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#1f2821] border border-white/5 flex items-start gap-3">
                      <Shield className="w-4 h-4 text-[#A8B88A] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#E6D7C3]">Diretivas e Normas ICNF: </span>
                        <span className="text-[#E6D7C3]/80">{districtRiskData[selectedDistrict].icnfNotice}</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#1b2f23] border border-[#A8B88A]/20 flex items-start gap-3">
                      <PhoneCall className="w-4 h-4 text-[#A8B88A] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#E6D7C3]">Apoio Operacional & Emergência: </span>
                        <span className="text-[#E6D7C3]/80">{districtRiskData[selectedDistrict].emergencyContact} — Emergências Ligue 112 ou 117</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
                    <button
                      onClick={() => handleDownloadDistrictBulletinTxt(selectedDistrict)}
                      className="w-full sm:w-auto px-4 py-2 rounded-full border border-[#A8B88A]/40 text-[#E6D7C3] text-xs font-medium hover:bg-[#A8B88A]/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#A8B88A]" />
                      <span>Descarregar Boletim deste Distrito (TXT)</span>
                    </button>

                    <button
                      onClick={() => {
                        setActivePillarModal('grupos');
                        setMemberRegionFilter(districtRiskData[selectedDistrict].region);
                      }}
                      className="w-full sm:w-auto px-4 py-2 rounded-full bg-[#24422e] hover:bg-[#2e533b] text-[#E6D7C3] text-xs font-medium transition-colors flex items-center justify-center gap-2 border border-[#A8B88A]/30 cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 text-[#A8B88A]" />
                      <span>Ver Núcleos da Região {districtRiskData[selectedDistrict].region}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Water sources reminder */}
              <div className="p-4 rounded-xl bg-[#102319] border border-[#A8B88A]/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <Droplets className="w-5 h-5 text-[#A8B88A] shrink-0" />
                  <span className="text-[#E6D7C3]/90">
                    No Sobrevivente.eu mantemos um cadastro colaborativo georreferenciado com mais de 140 fontes, levadas e nascentes ativas em Portugal continental e ilhas.
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/10 bg-[#132218] flex items-center justify-between text-xs">
              <span className="text-[#E6D7C3]/70">
                Receba alertas meteorológicos no seu telemóvel:
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.sobrevivente.eu/entrar"
                  className="px-4 py-2 rounded-full border border-[#E6D7C3]/30 text-[#E6D7C3] hover:bg-white/5 cursor-pointer"
                >
                  Entrar
                </a>
                <a
                  href="https://www.sobrevivente.eu/inscrever"
                  className="px-4 py-2 rounded-full bg-[#E6D7C3] text-[#16271c] font-semibold hover:bg-white cursor-pointer"
                >
                  Inscrever-se
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: GRUPOS & NÚCLEOS */}
      {activePillarModal === 'grupos' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-grupos-titulo"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActivePillarModal(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] bg-[#16271c] border border-white/15 rounded-[28px] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#132218]">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#A8B88A] font-mono">
                  Pilar 03 · Organização Regional
                </span>
                <h3 id="modal-grupos-titulo" className="font-display text-2xl text-[#E6D7C3] font-semibold">
                  Grupos & Núcleos Regionais
                </h3>
              </div>
              <button
                onClick={() => setActivePillarModal(null)}
                className="p-2 rounded-full hover:bg-white/10 text-[#E6D7C3] transition-colors"
                aria-label="Fechar grupos"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <p className="text-sm text-[#E6D7C3]/80">
                Os núcleos são círculos territoriais independentes que organizam saídas práticas de campo, testes de rádio e entreajuda:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {INITIAL_GROUPS.map((group) => (
                  <div
                    key={group.id}
                    className="p-5 rounded-2xl bg-[#1d3525]/70 border border-white/10 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-[#A8B88A] font-mono">
                        <span>{group.biome}</span>
                        <span>{group.members} Praticantes</span>
                      </div>
                      <h4 className="font-display text-lg text-[#E6D7C3] font-semibold mt-1">
                        {group.name}
                      </h4>
                      <p className="text-xs text-[#E6D7C3]/75 mt-1 leading-relaxed">
                        Coordenação local: {group.coordinator}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                      <span className="text-[#E6D7C3]/60">{group.nextMeetup}</span>
                      <a
                        href="https://www.sobrevivente.eu/inscrever"
                        className="text-[#A8B88A] hover:underline font-medium flex items-center gap-1 cursor-pointer"
                      >
                        Aderir ao Núcleo <ChevronRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/10 bg-[#132218] flex items-center justify-between text-xs">
              <span className="text-[#E6D7C3]/70">
                Pretende fundar um núcleo no seu concelho?
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.sobrevivente.eu/inscrever"
                  className="px-4 py-2 rounded-full bg-[#E6D7C3] text-[#16271c] font-semibold hover:bg-white cursor-pointer"
                >
                  Registar-se na Comunidade
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: FÓRUNS */}
      {activePillarModal === 'foruns' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-foruns-titulo"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActivePillarModal(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] bg-[#16271c] border border-white/15 rounded-[28px] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#132218]">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#A8B88A] font-mono">
                  Pilar 04 · Troca de Experiências
                </span>
                <h3 id="modal-foruns-titulo" className="font-display text-2xl text-[#E6D7C3] font-semibold">
                  Fóruns de Discussão & Partilha
                </h3>
              </div>
              <button
                onClick={() => setActivePillarModal(null)}
                className="p-2 rounded-full hover:bg-white/10 text-[#E6D7C3] transition-colors"
                aria-label="Fechar fóruns"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Active Forum Topics */}
            <div className="p-6 overflow-y-auto space-y-4">
              <p className="text-sm text-[#E6D7C3]/80">
                Discussões técnicas em curso entre membros da comunidade. Sem patrocínios, focado na prática:
              </p>

              <div className="space-y-3">
                {INITIAL_FORUM_QUESTIONS.map((faq) => (
                  <div
                    key={faq.id}
                    className="p-4 rounded-xl bg-[#1d3525]/70 border border-white/10 space-y-2 hover:bg-[#1d3525] transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded bg-[#A8B88A]/20 text-[#A8B88A] font-mono">
                        {faq.categoryLabel}
                      </span>
                      <span className="text-[#E6D7C3]/60">{faq.votes} votos de membros</span>
                    </div>

                    <h4 className="font-display text-base font-semibold text-[#E6D7C3]">
                      {faq.question}
                    </h4>

                    <p className="text-xs text-[#E6D7C3]/75 leading-relaxed">
                      {faq.instructorAnswer}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-[#E6D7C3]/50 pt-1 border-t border-white/5 font-mono">
                      <span>Iniciado por: {faq.author} ({faq.region})</span>
                      <span>Resposta: {faq.instructorName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/10 bg-[#132218] flex items-center justify-between text-xs">
              <span className="text-[#E6D7C3]/70">
                Participe nas discussões e publique as suas questões:
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.sobrevivente.eu/entrar"
                  className="px-4 py-2 rounded-full border border-[#E6D7C3]/30 text-[#E6D7C3] hover:bg-white/5 cursor-pointer"
                >
                  Entrar
                </a>
                <a
                  href="https://www.sobrevivente.eu/inscrever"
                  className="px-4 py-2 rounded-full bg-[#E6D7C3] text-[#16271c] font-semibold hover:bg-white cursor-pointer"
                >
                  Inscrever-se
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ENCONTRAR OUTRAS PESSOAS */}
      {activePillarModal === 'pessoas' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-pessoas-titulo"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActivePillarModal(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] bg-[#16271c] border border-white/15 rounded-[28px] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#132218]">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#A8B88A] font-mono">
                  Pilar 05 · Rede de Proximidade
                </span>
                <h3 id="modal-pessoas-titulo" className="font-display text-2xl text-[#E6D7C3] font-semibold">
                  Encontrar Outras Pessoas
                </h3>
              </div>
              <button
                onClick={() => setActivePillarModal(null)}
                className="p-2 rounded-full hover:bg-white/10 text-[#E6D7C3] transition-colors"
                aria-label="Fechar encontrar pessoas"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-sm text-[#E6D7C3]/80">
                  Praticantes registados disponíveis para travessias e duplas de campo:
                </p>

                {/* Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#E6D7C3]/60 font-mono">Filtrar:</span>
                  <select
                    value={memberRegionFilter}
                    onChange={(e) => setMemberRegionFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-[#142318] border border-white/15 text-xs text-[#E6D7C3] focus:outline-none focus:border-[#A8B88A]"
                  >
                    <option value="Todas">Todos os Distritos</option>
                    <option value="Braga">Braga</option>
                    <option value="Guarda">Guarda</option>
                    <option value="Sintra">Lisboa / Sintra</option>
                    <option value="Castelo Branco">Castelo Branco</option>
                    <option value="Faro">Faro</option>
                    <option value="Porto">Porto</option>
                  </select>
                </div>
              </div>

              {/* Members Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredMembers.map((member, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-[#1d3525]/70 border border-white/10 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-[#A8B88A] font-mono">
                        <span>{member.district}</span>
                        <span className="px-2 py-0.5 rounded bg-[#A8B88A]/15 text-[10px]">
                          {member.exp}
                        </span>
                      </div>
                      <h4 className="font-display text-base font-semibold text-[#E6D7C3] mt-1.5">
                        {member.name}
                      </h4>
                      <p className="text-xs text-[#E6D7C3]/75 mt-1">
                        {member.focus}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-[#A8B88A]">
                      <span>{member.badge}</span>
                      <a
                        href="https://www.sobrevivente.eu/inscrever"
                        className="underline hover:text-white cursor-pointer"
                      >
                        Conectar
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/10 bg-[#132218] flex items-center justify-between text-xs">
              <span className="text-[#E6D7C3]/70">
                Registe o seu perfil para aparecer no mapa comunitário:
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.sobrevivente.eu/entrar"
                  className="px-4 py-2 rounded-full border border-[#E6D7C3]/30 text-[#E6D7C3] hover:bg-white/5 cursor-pointer"
                >
                  Entrar
                </a>
                <a
                  href="https://www.sobrevivente.eu/inscrever"
                  className="px-4 py-2 rounded-full bg-[#E6D7C3] text-[#16271c] font-semibold hover:bg-white cursor-pointer"
                >
                  Inscrever-se
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: LOJA & UTENSÍLIOS DE SOBREVIVÊNCIA */}
      {activePillarModal === 'loja' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-loja-titulo"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActivePillarModal(null)}
        >
          <div
            className="w-full max-w-5xl max-h-[92vh] bg-[#16271c] border border-white/15 rounded-[28px] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#132218]">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#A8B88A] font-mono">
                  Pilar 06 · Equipamento & Ferramentas Úteis
                </span>
                <h3 id="modal-loja-titulo" className="font-display text-2xl text-[#E6D7C3] font-semibold">
                  Loja de Sobrevivência & Utensílios de Campo
                </h3>
              </div>
              <button
                onClick={() => setActivePillarModal(null)}
                className="p-2 rounded-full hover:bg-white/10 text-[#E6D7C3] transition-colors"
                aria-label="Fechar loja de utensílios"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Loadout Backpack Summary Bar */}
            <div className="px-6 py-3 bg-[#111f15] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-[#E6D7C3]">
                  <ShoppingBag className="w-4 h-4 text-[#A8B88A]" />
                  <span className="font-medium">O Meu Kit de Mochila:</span>
                  <span className="font-mono text-[#A8B88A] bg-[#1a3122] px-2 py-0.5 rounded border border-white/10">
                    {myLoadoutItemIds.length} utensílios
                  </span>
                </div>
                <span className="text-white/20">|</span>
                <div className="flex items-center gap-1.5 text-[#E6D7C3]/80 font-mono">
                  <Weight className="w-3.5 h-3.5 text-[#C85A3E]" />
                  <span>
                    {(
                      SURVIVAL_GEAR_ITEMS.filter((i) => myLoadoutItemIds.includes(i.id)).reduce(
                        (acc, c) => acc + c.weightGrams,
                        0
                      ) / 1000
                    ).toFixed(2)}{' '}
                    kg
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadLoadoutTxt}
                  disabled={myLoadoutItemIds.length === 0}
                  className="px-3 py-1.5 rounded-lg bg-[#24422e] hover:bg-[#2e553b] text-[#E6D7C3] disabled:opacity-40 transition-colors flex items-center gap-1.5 font-mono text-xs border border-white/10 cursor-pointer"
                  title="Descarregar lista em ficheiro de texto"
                >
                  <Download className="w-3.5 h-3.5 text-[#A8B88A]" />
                  <span>Descarregar Lista (.txt)</span>
                </button>
                {myLoadoutItemIds.length > 0 && (
                  <button
                    onClick={() => {
                      setMyLoadoutItemIds([]);
                      try {
                        localStorage.removeItem('sobrevivente_loadout');
                      } catch {}
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-[#E6D7C3]/60 hover:text-[#C85A3E] transition-colors"
                    title="Esvaziar mochila"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="p-4 sm:px-6 bg-[#142318] border-b border-white/10 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-[#A8B88A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={gearSearchQuery}
                    onChange={(e) => setGearSearchQuery(e.target.value)}
                    placeholder="Pesquisar por utensílio, especificação ou terreno..."
                    className="w-full pl-9 pr-4 py-2 bg-[#101b13] border border-white/15 rounded-xl text-xs text-[#E6D7C3] placeholder-[#E6D7C3]/40 focus:outline-none focus:border-[#A8B88A]"
                  />
                  {gearSearchQuery && (
                    <button
                      onClick={() => setGearSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#E6D7C3]/50 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Info Disclaimer */}
                <div className="text-[11px] text-[#A8B88A] font-mono flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Sem patrocínios nem links de afiliados. Testes 100% independentes.</span>
                </div>
              </div>

              {/* Category Segmented Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {GEAR_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedGearCategory(cat.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                      selectedGearCategory === cat.id
                        ? 'bg-[#24422e] text-[#E6D7C3] border border-[#A8B88A]/40 shadow-sm'
                        : 'bg-[#101b13]/60 text-[#E6D7C3]/70 hover:text-white hover:bg-[#101b13]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Body: Gear Items Grid */}
            <div className="p-6 overflow-y-auto space-y-4">
              {(() => {
                const filteredGear = SURVIVAL_GEAR_ITEMS.filter((item) => {
                  const matchCategory = selectedGearCategory === 'todas' || item.category === selectedGearCategory;
                  const q = gearSearchQuery.toLowerCase().trim();
                  const matchQuery =
                    !q ||
                    item.name.toLowerCase().includes(q) ||
                    item.description.toLowerCase().includes(q) ||
                    item.specs.toLowerCase().includes(q) ||
                    item.portugalContext.toLowerCase().includes(q);
                  return matchCategory && matchQuery;
                });

                if (filteredGear.length === 0) {
                  return (
                    <div className="text-center py-12 space-y-3">
                      <ShoppingBag className="w-10 h-10 text-[#A8B88A]/40 mx-auto" />
                      <p className="text-sm text-[#E6D7C3]/70">
                        Nenhum utensílio encontrado para o termo pesquisado.
                      </p>
                      <button
                        onClick={() => {
                          setGearSearchQuery('');
                          setSelectedGearCategory('todas');
                        }}
                        className="px-4 py-2 text-xs rounded-full bg-[#24422e] text-[#E6D7C3]"
                      >
                        Limpar Filtros
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredGear.map((item) => {
                      const isInLoadout = myLoadoutItemIds.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          className={`rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                            isInLoadout
                              ? 'bg-[#1d3525] border-[#A8B88A]/60 shadow-lg'
                              : 'bg-[#182c1f]/80 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="space-y-3">
                            {/* Top row: Category & Score & Weight */}
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[11px] font-mono text-[#A8B88A]">
                                {item.categoryLabel}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/10 text-[#E6D7C3]">
                                  {item.weightGrams}g
                                </span>
                                <span
                                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                                    item.fieldVerdict === 'Indispensável'
                                      ? 'bg-[#C85A3E]/20 text-[#C85A3E] border border-[#C85A3E]/30'
                                      : 'bg-[#A8B88A]/20 text-[#A8B88A] border border-[#A8B88A]/30'
                                  }`}
                                >
                                  {item.fieldVerdict}
                                </span>
                              </div>
                            </div>

                            {/* Item Name */}
                            <div>
                              <h4 className="font-display text-base font-semibold text-[#E6D7C3] leading-snug">
                                {item.name}
                              </h4>
                              <p className="text-xs text-[#E6D7C3]/75 mt-1.5 line-clamp-2 leading-relaxed">
                                {item.description}
                              </p>
                            </div>

                            {/* Portugal Context Quote */}
                            <div className="p-2.5 rounded-xl bg-[#111f15] border border-white/5 text-[11px] text-[#A8B88A] font-mono leading-relaxed">
                              <span className="text-[#E6D7C3] font-semibold">Uso em PT: </span>
                              <span>{item.portugalContext}</span>
                            </div>

                            {/* Specs snippet */}
                            <div className="text-[11px] text-[#E6D7C3]/60 font-mono">
                              <span>Specs: {item.specs}</span>
                            </div>
                          </div>

                          {/* Card Footer: Add to backpack & Detail view */}
                          <div className="pt-3 mt-4 border-t border-white/10 flex items-center justify-between gap-2">
                            <button
                              onClick={() => setSelectedGearDetail(item)}
                              className="text-xs text-[#A8B88A] hover:underline flex items-center gap-1 font-mono"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Ficha Técnica</span>
                            </button>

                            <button
                              onClick={() => toggleLoadoutItem(item.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                                isInLoadout
                                  ? 'bg-[#A8B88A] text-[#16271c] hover:bg-white shadow-sm'
                                  : 'bg-[#24422e] text-[#E6D7C3] hover:bg-[#2f553b] border border-white/10'
                              }`}
                            >
                              {isInLoadout ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Na Mochila</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Adicionar</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/10 bg-[#132218] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-[#E6D7C3]/70 text-center sm:text-left">
                <span>Quer recomendar ou reportar o desgaste de uma ferramenta? </span>
                <span className="text-[#A8B88A]">Participe na bancada comunitária.</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.sobrevivente.eu/entrar"
                  className="px-4 py-2 rounded-full border border-[#E6D7C3]/30 text-[#E6D7C3] hover:bg-white/5 cursor-pointer"
                >
                  Entrar
                </a>
                <a
                  href="https://www.sobrevivente.eu/inscrever"
                  className="px-4 py-2 rounded-full bg-[#E6D7C3] text-[#16271c] font-semibold hover:bg-white cursor-pointer"
                >
                  Inscrever-se
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GEAR ITEM DETAIL DIALOG */}
      {selectedGearDetail && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-gear-detail-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedGearDetail(null)}
        >
          <div
            className="w-full max-w-2xl bg-[#16271c] border border-white/20 rounded-[28px] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dialog Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#132218]">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#A8B88A]/20 text-[#A8B88A] font-mono text-xs">
                  {selectedGearDetail.categoryLabel}
                </span>
                <span className="text-xs font-mono text-[#E6D7C3]/60">
                  {selectedGearDetail.weightGrams}g · {selectedGearDetail.priceEstimate}
                </span>
              </div>
              <button
                onClick={() => setSelectedGearDetail(null)}
                className="p-2 rounded-full hover:bg-white/10 text-[#E6D7C3] transition-colors"
                aria-label="Fechar detalhe do utensílio"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dialog Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              <div>
                <h3 id="dialog-gear-detail-title" className="font-display text-2xl font-semibold text-[#E6D7C3]">
                  {selectedGearDetail.name}
                </h3>
                <p className="text-sm text-[#E6D7C3]/80 mt-2 leading-relaxed">
                  {selectedGearDetail.description}
                </p>
              </div>

              {/* Utility Score & Durability strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-[#1d3525] border border-white/10 text-center">
                  <span className="text-[11px] text-[#A8B88A] font-mono">Índice de Utilidade</span>
                  <p className="text-lg font-bold text-[#E6D7C3] mt-0.5 font-mono">
                    {selectedGearDetail.utilityScore} / 10
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#1d3525] border border-white/10 text-center">
                  <span className="text-[11px] text-[#A8B88A] font-mono">Peso de Transporte</span>
                  <p className="text-lg font-bold text-[#E6D7C3] mt-0.5 font-mono">
                    {selectedGearDetail.weightGrams} g
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#1d3525] border border-white/10 text-center col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-[#A8B88A] font-mono">Classificação</span>
                  <p className="text-base font-bold text-[#C85A3E] mt-0.5 font-mono">
                    {selectedGearDetail.fieldVerdict}
                  </p>
                </div>
              </div>

              {/* Field relevance in Portugal */}
              <div className="p-4 rounded-xl bg-[#122218] border border-[#A8B88A]/30 space-y-1">
                <div className="text-xs font-semibold text-[#A8B88A] font-mono flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Porquê indispensável no território português:</span>
                </div>
                <p className="text-xs text-[#E6D7C3]/90 leading-relaxed">
                  {selectedGearDetail.portugalContext}
                </p>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-2 text-xs">
                <span className="font-mono text-[#A8B88A] uppercase tracking-wider text-[11px]">
                  Especificações de Fabrico:
                </span>
                <p className="p-3 rounded-xl bg-[#1a3021] border border-white/5 font-mono text-[#E6D7C3]/85 leading-relaxed">
                  {selectedGearDetail.specs}
                </p>
              </div>

              {/* Key Features */}
              <div className="space-y-2 text-xs">
                <span className="font-mono text-[#A8B88A] uppercase tracking-wider text-[11px]">
                  Características Verificadas no Terreno:
                </span>
                <ul className="space-y-2">
                  {selectedGearDetail.keyFeatures.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-[#E6D7C3]/85">
                      <Check className="w-4 h-4 text-[#A8B88A] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Field test summary */}
              <div className="p-3 rounded-xl bg-[#1d271f] border border-white/10 text-xs text-[#E6D7C3]/75 space-y-1">
                <span className="font-semibold text-[#E6D7C3] font-mono">Relatório de Teste: </span>
                <span>{selectedGearDetail.fieldTestingSummary}</span>
              </div>
            </div>

            {/* Dialog Footer */}
            <div className="px-6 py-4 border-t border-white/10 bg-[#132218] flex items-center justify-between">
              <span className="text-xs text-[#E6D7C3]/70 font-mono">
                {myLoadoutItemIds.includes(selectedGearDetail.id)
                  ? 'Utensílio incluído na sua lista'
                  : 'Utensílio fora da sua lista'}
              </span>
              <button
                onClick={() => {
                  toggleLoadoutItem(selectedGearDetail.id);
                }}
                className={`px-5 py-2.5 rounded-full text-xs font-mono font-medium transition-all flex items-center gap-2 ${
                  myLoadoutItemIds.includes(selectedGearDetail.id)
                    ? 'bg-[#A8B88A] text-[#16271c] hover:bg-white'
                    : 'bg-[#C85A3E] text-white hover:bg-[#d8664a]'
                }`}
              >
                {myLoadoutItemIds.includes(selectedGearDetail.id) ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Remover da Mochila</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Adicionar à Mochila</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
