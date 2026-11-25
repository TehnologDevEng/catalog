import { Check, ChevronRight, Maximize2, Plus, RotateCcw, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { type EquipmentItem, type ProductVariant } from '../data/catalog';
import { EquipmentImage } from './EquipmentImage';

interface ProductModalProps {
  item: EquipmentItem | null;
  imageOverride?: string;
  onClose: () => void;
  onAddToSpec: (item: EquipmentItem, variant: ProductVariant) => void;
  onUploadImage: (itemId: string, dataUrl: string) => void;
  onResetImage: (itemId: string) => void;
}

export function ProductModal({
  item,
  imageOverride,
  onClose,
  onAddToSpec,
  onUploadImage,
  onResetImage,
}: ProductModalProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [justAdded, setJustAdded] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (item && item.variants.length > 0) {
      setSelectedVariantId(item.variants[0].id);
      setJustAdded(false);
      setZoomOpen(false);
    }
  }, [item]);

  useEffect(() => {
    if (!item) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (zoomOpen) {
          setZoomOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [item, zoomOpen, onClose]);

  if (!item) return null;

  const activeVariant =
    item.variants.find((v) => v.id === selectedVariantId) ?? item.variants[0];
  const displayImage = imageOverride ?? item.image;

  const handleAdd = () => {
    onAddToSpec(item, activeVariant);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1600);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUploadImage(item.id, reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar with breadcrumbs & close */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-4 bg-white border-b border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 min-w-0 truncate">
            <span>Каталог</span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{item.categoryLabel}</span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="text-slate-900 font-medium truncate">{item.shortCode}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть карточку оборудования"
            className="p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: 2-column engineering datasheet layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
          {/* Left column: CAD Cutaway Visual + Image controls + Description */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => setZoomOpen(true)}
                aria-label="Увеличить изображение оборудования"
                className="group relative aspect-square w-full rounded-lg overflow-hidden bg-[#F2F5F9] border border-slate-200 block text-left"
              >
                <EquipmentImage
                  src={displayImage}
                  alt={item.title}
                  className={`w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.03] ${
                    imageOverride ? 'p-3' : 'mix-blend-multiply'
                  }`}
                />
                <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white/90 border border-slate-200 rounded-md shadow-xs opacity-90 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3.5 h-3.5" />
                  Увеличить
                </span>
              </button>

              {/* Replace / Reset equipment image */}
              <div className="flex items-center justify-between gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-md transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Загрузить своё фото
                </button>
                {imageOverride && (
                  <button
                    type="button"
                    onClick={() => onResetImage(item.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Вернуть оригинал
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2.5">
              <h3 className="text-sm font-semibold text-slate-900">
                Назначение и конструкция
              </h3>
              <p className="text-sm leading-relaxed text-slate-600">
                {item.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-2">
              <div className="text-xs font-medium text-slate-500">
                Область применения
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-700">
                {item.applicationTags.map((tag, idx) => (
                  <span key={tag} className="inline-flex items-center gap-2">
                    {idx > 0 && <span className="text-slate-300" aria-hidden="true">·</span>}
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: Contiguous spec & selection module */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <span>{item.categoryLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{item.sizeGroup}</span>
                  {item.standard && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{item.standard}</span>
                    </>
                  )}
                </div>
                <h2
                  id="modal-product-title"
                  className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight"
                >
                  {item.title}
                </h2>
              </div>

              {/* Variant selector */}
              {item.variants.length > 1 && (
                <div className="space-y-2.5">
                  <div className="text-xs font-medium text-slate-500">
                    Выберите типоразмер / модификацию
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.variants.map((variant) => {
                      const active = variant.id === activeVariant.id;
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => {
                            setSelectedVariantId(variant.id);
                            setJustAdded(false);
                          }}
                          className={`px-3 py-2 text-xs font-medium rounded-md border transition-colors whitespace-nowrap ${
                            active
                              ? 'bg-[#1D5FA7] text-white border-[#1D5FA7]'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:text-slate-900'
                          }`}
                        >
                          {variant.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selected model code + technical table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-[#F1F4F8] border-b border-slate-200 flex items-center justify-between gap-4">
                  <span className="text-xs font-medium text-slate-600">
                    Технические характеристики
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-900">
                    {activeVariant.code}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs text-slate-500 bg-white">
                        <th className="py-2.5 px-4 font-medium">Параметр</th>
                        <th className="py-2.5 px-4 font-medium w-28">Ед. изм.</th>
                        <th className="py-2.5 px-4 font-medium text-right">Значение</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {activeVariant.specs.map((row) => (
                        <tr key={row.param} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-4 text-slate-700">{row.param}</td>
                          <td className="py-2.5 px-4 text-xs text-slate-500 font-mono">
                            {row.unit}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-xs sm:text-sm font-medium text-slate-900 tabular-nums">
                            {row.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Contiguous action footer */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                Позиция: <span className="font-mono font-medium text-slate-800">{activeVariant.code}</span>
              </div>
              <button
                type="button"
                onClick={handleAdd}
                className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  justAdded
                    ? 'bg-emerald-700 text-white'
                    : 'bg-[#1D5FA7] hover:bg-[#174E8A] text-white'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    Добавлено в спецификацию
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Добавить в спецификацию
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen CAD zoom lightbox */}
      {zoomOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-950/85"
          onClick={(e) => {
            e.stopPropagation();
            setZoomOpen(false);
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoomOpen(false);
            }}
            aria-label="Закрыть просмотр изображения"
            className="absolute top-5 right-5 p-2.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div
            className="max-w-3xl w-full aspect-square bg-white rounded-xl overflow-hidden shadow-2xl p-4 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <EquipmentImage
              src={displayImage}
              alt={item.title}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
