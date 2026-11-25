import { ArrowRight, Check, Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EquipmentImage } from './components/EquipmentImage';
import { Header } from './components/Header';
import { ProductModal } from './components/ProductModal';
import { SpecDrawer, type SpecEntry } from './components/SpecDrawer';
import {
  CATEGORIES,
  EQUIPMENT_CATALOG,
  HYDRO_OPERATING_CONDITIONS,
  IMAGES,
  type CategoryId,
  type EquipmentItem,
  type ProductVariant,
} from './data/catalog';

const HERO_KPI = [
  { label: 'Габаритный ряд ЭЦН', value: '2А – 7А', detail: 'Подача от 25 до 1 250 м³/сут' },
  { label: 'Погружные двигатели', value: '81 – 143 мм', detail: 'Асинхронные ПЭД и вентильные ПВД' },
  { label: 'Термостойкость', value: 'до +170 °C', detail: 'Базовое, тепло- и особо теплостойкое' },
  { label: 'Рабочее давление', value: 'до 40 МПа', detail: 'Соответствие ГОСТ 633-80 и ТУ' },
];

export default function App() {
  const [activeCategory, setActiveCategory] = useState<CategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<EquipmentItem | null>(null);
  const [specDrawerOpen, setSpecDrawerOpen] = useState(false);
  const [specEntries, setSpecEntries] = useState<SpecEntry[]>([]);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const [customImages, setCustomImages] = useState<Record<string, string>>({});

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return EQUIPMENT_CATALOG.filter((item) => {
      const matchesCat = activeCategory === 'all' || item.category === activeCategory;
      if (!matchesCat) return false;
      if (!q) return true;
      const haystack = [
        item.title,
        item.shortCode,
        item.categoryLabel,
        item.sizeGroup,
        item.summary,
        item.standard ?? '',
        ...item.applicationTags,
        ...item.variants.map((v) => `${v.code} ${v.label}`),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [activeCategory, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: EQUIPMENT_CATALOG.length };
    for (const cat of CATEGORIES) {
      counts[cat.id] = EQUIPMENT_CATALOG.filter((i) => i.category === cat.id).length;
    }
    return counts;
  }, []);

  const totalSpecCount = useMemo(
    () => specEntries.reduce((sum, entry) => sum + entry.qty, 0),
    [specEntries]
  );

  const handleAddToSpec = (item: EquipmentItem, variant: ProductVariant) => {
    const key = `${item.id}::${variant.id}`;
    setSpecEntries((prev) => {
      const existing = prev.find((e) => e.key === key);
      if (existing) {
        return prev.map((e) => (e.key === key ? { ...e, qty: e.qty + 1 } : e));
      }
      return [
        ...prev,
        {
          key,
          itemId: item.id,
          title: item.title,
          categoryLabel: item.categoryLabel,
          variantCode: variant.code,
          variantLabel: variant.label,
          qty: 1,
        },
      ];
    });
    setRecentlyAddedId(item.id);
    window.setTimeout(() => {
      setRecentlyAddedId((curr) => (curr === item.id ? null : curr));
    }, 1400);
  };

  const handleUpdateQty = (key: string, delta: number) => {
    setSpecEntries((prev) =>
      prev
        .map((e) => (e.key === key ? { ...e, qty: e.qty + delta } : e))
        .filter((e) => e.qty > 0)
    );
  };

  const handleRemoveEntry = (key: string) => {
    setSpecEntries((prev) => prev.filter((e) => e.key !== key));
  };

  const handleUploadImage = (itemId: string, dataUrl: string) => {
    setCustomImages((prev) => ({ ...prev, [itemId]: dataUrl }));
  };

  const handleResetImage = (itemId: string) => {
    setCustomImages((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#F7F8FA] text-[#0F172A]">
      <Header
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        specCount={totalSpecCount}
        onOpenSpec={() => setSpecDrawerOpen(true)}
      />

      <main className="flex-1">
        {/* SECTION 1: Storefront Industrial Hero */}
        <section className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 lg:pt-14 lg:pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
              {/* Left: Value proposition & direct catalog entry */}
              <div className="lg:col-span-6 flex flex-col justify-between gap-8">
                <div className="space-y-5">
                  <p className="text-xs font-medium text-[#1D5FA7] tracking-wide">
                    Каталог нефтепогружного оборудования · Серии УЭЦН и фильтрация
                  </p>
                  <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-slate-900 leading-[1.12] tracking-tight">
                    Погружное оборудование для осложнённого фонда скважин
                  </h1>
                  <p className="text-base text-slate-600 leading-relaxed max-w-xl">
                    Электроцентробежные насосы габаритов 2А–7А, асинхронные и вентильные
                    электродвигатели, гидрозащита, газосепараторы и противопесочные фильтры
                    с 3D-разрезами, таблицами параметров и подбором спецификации.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Direct Hero Search Bar */}
                  <div className="relative max-w-xl">
                    <Search
                      className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') scrollToCatalog();
                      }}
                      placeholder="Поиск по марке или параметру: ЭЦНКИС2А, ПЭД 130, ФСП-73, СГМП…"
                      className="w-full pl-10 pr-24 py-3 text-sm bg-[#F7F8FA] border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={scrollToCatalog}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3.5 py-1.5 text-xs font-medium text-white bg-[#1D5FA7] hover:bg-[#174E8A] rounded-md transition-colors whitespace-nowrap"
                    >
                      Найти
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    <button
                      type="button"
                      onClick={scrollToCatalog}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap"
                    >
                      Открыть каталог
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpecDrawerOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-400 rounded-md bg-white transition-colors whitespace-nowrap"
                    >
                      Собрать опросный лист
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Original 3D CAD cutaway multi-module hero render */}
              <div className="lg:col-span-6">
                <div className="h-full min-h-[280px] lg:min-h-[380px] rounded-xl overflow-hidden bg-gradient-to-br from-[#F4F7FA] to-[#E6EDF5] border border-slate-200 flex items-end justify-end">
                  <EquipmentImage
                    src={IMAGES.hero}
                    alt="3D-разрез многосекционного погружного оборудования УЭЦН и модулей МФН"
                    className="w-full h-full object-contain object-right-bottom mix-blend-multiply"
                  />
                </div>
              </div>
            </div>

            {/* Full-width 4-column engineering strip below Hero split */}
            <div className="mt-10 pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {HERO_KPI.map((kpi) => (
                <div key={kpi.label} className="space-y-1">
                  <div className="text-xs font-medium text-slate-500">{kpi.label}</div>
                  <div className="font-mono text-xl font-semibold text-slate-900 tabular-nums">
                    {kpi.value}
                  </div>
                  <div className="text-xs text-slate-600">{kpi.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 2: Interactive Equipment Catalog */}
        <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Номенклатура поставляемого оборудования
              </h2>
              <p className="text-sm text-slate-600">
                Каждая позиция содержит оригинальный 3D-разрез оборудования, таблицу характеристик
                и выбор модификаций. Нажмите на карточку, чтобы увеличить изображение или загрузить своё фото.
              </p>
            </div>
            <div className="text-xs font-mono text-slate-500 tabular-nums shrink-0">
              Показано: {filteredItems.length} из {EQUIPMENT_CATALOG.length}
            </div>
          </div>

          {/* Segmented Category Filter + Inline Search */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200">
            <div
              role="tablist"
              aria-label="Фильтр по категориям оборудования"
              className="flex items-center gap-1 p-1 bg-[#EAEFF5] rounded-lg overflow-x-auto"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeCategory === 'all'}
                onClick={() => setActiveCategory('all')}
                className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 tabular-nums ${
                  activeCategory === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Все ({categoryCounts.all})
              </button>
              {CATEGORIES.map((cat) => {
                const active = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 tabular-nums ${
                      active
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat.shortLabel} ({categoryCounts[cat.id]})
                  </button>
                );
              })}
            </div>

            {/* Active search filter input */}
            <div className="relative w-full lg:w-72 shrink-0">
              <SlidersHorizontal
                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Фильтр по коду или габариту…"
                className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Очистить поиск"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 3-Column Product Grid */}
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center bg-white border border-slate-200 rounded-xl px-6 space-y-3">
              <p className="text-base font-semibold text-slate-900">
                По запросу «{searchQuery}» оборудование не найдено
              </p>
              <p className="text-sm text-slate-600">
                Попробуйте ввести код модели (например, ЭЦНКИС2А, ПЭД, ФСП, СГМП, КОП, ПАВ92Дэ) или сбросьте фильтры.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="mt-2 px-4 py-2 text-xs font-medium text-white bg-[#1D5FA7] hover:bg-[#174E8A] rounded-md transition-colors"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                const isJustAdded = recentlyAddedId === item.id;
                const customImg = customImages[item.id];
                const cardImage = customImg ?? item.image;
                return (
                  <article
                    key={item.id}
                    className="group bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300"
                  >
                    {/* Lead with 4:3 clean studio frame for real CAD cutaway renders */}
                    <button
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      className="block aspect-[4/3] w-full bg-[#F2F5F9] border-b border-slate-100 overflow-hidden text-left focus-visible:outline-none"
                    >
                      <EquipmentImage
                        src={cardImage}
                        alt={item.title}
                        className={`w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.04] ${
                          customImg ? 'p-3' : 'object-right-bottom mix-blend-multiply'
                        }`}
                      />
                    </button>

                    {/* Identical field order across all cards */}
                    <div className="p-5 flex-1 flex flex-col justify-between gap-5">
                      <div className="space-y-2.5">
                        {/* Unboxed metadata with typographic separator */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
                          <span className="truncate">{item.categoryLabel}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono shrink-0">{item.sizeGroup}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          className="block text-left group/title"
                        >
                          <h3 className="text-base font-bold text-slate-900 group-hover/title:text-[#1D5FA7] transition-colors leading-snug">
                            {item.title}
                          </h3>
                        </button>

                        <p className="text-xs font-mono text-slate-600 truncate">
                          {item.shortCode}
                        </p>

                        <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                          {item.summary}
                        </p>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-xs text-slate-500">
                            {item.keyMetricLabel}
                          </span>
                          <span className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
                            {item.keyMetricValue}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedItem(item)}
                            className="flex-1 px-3 py-2 text-xs font-medium text-slate-800 bg-[#F1F4F8] hover:bg-[#E4EAF2] rounded-md transition-colors whitespace-nowrap"
                          >
                            Характеристики ({item.variants.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddToSpec(item, item.variants[0])}
                            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                              isJustAdded
                                ? 'bg-emerald-700 text-white'
                                : 'bg-[#1D5FA7] hover:bg-[#174E8A] text-white'
                            }`}
                          >
                            {isJustAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                Добавлено
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                В список
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION 3: Operating Conditions & Engineering Reference */}
        <section className="bg-[#0E1525] text-slate-100 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-5 space-y-4">
                <p className="text-xs font-medium text-[#7EB3EC] tracking-wide">
                  Эксплуатационный регламент и нормативы
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Условия эксплуатации гидрозащиты и компоновок УЭЦН
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Оборудование поставляется в базовом, теплостойком и особо теплостойком
                  исполнениях с подтверждённой совместимостью по присоединительным резьбам
                  ГОСТ 633-80 и стойкостью к абразивному износу по ГОСТ 6370-83.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSpecDrawerOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#1D5FA7] hover:bg-[#266EBD] rounded-md transition-colors whitespace-nowrap"
                  >
                    Сформировать спецификацию
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {HYDRO_OPERATING_CONDITIONS.map((cond) => (
                  <div
                    key={cond.label}
                    className="p-5 rounded-lg bg-[#162035] border border-slate-800 space-y-1.5"
                  >
                    <div className="text-xs text-slate-400">{cond.label}</div>
                    <div className="font-mono text-lg font-semibold text-white tabular-nums">
                      {cond.value}
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed">
                      {cond.note}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* SECTION 4: Clean Industrial Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="font-display text-sm font-bold text-slate-900">
              УЭЦН Каталог
            </div>
            <p className="text-xs text-slate-500">
              Электроцентробежные насосы, ПЭД, гидрозащита, приёмные устройства и фильтрация
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  scrollToCatalog();
                }}
                className="hover:text-slate-900 transition-colors whitespace-nowrap"
              >
                {cat.shortLabel}
              </button>
            ))}
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ProductModal
        item={selectedItem}
        imageOverride={selectedItem ? customImages[selectedItem.id] : undefined}
        onClose={() => setSelectedItem(null)}
        onAddToSpec={handleAddToSpec}
        onUploadImage={handleUploadImage}
        onResetImage={handleResetImage}
      />

      <SpecDrawer
        open={specDrawerOpen}
        entries={specEntries}
        onClose={() => setSpecDrawerOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemove={handleRemoveEntry}
        onClear={() => setSpecEntries([])}
      />
    </div>
  );
}
