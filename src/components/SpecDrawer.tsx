import { Check, Copy, Download, Minus, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

export interface SpecEntry {
  key: string;
  itemId: string;
  title: string;
  categoryLabel: string;
  variantCode: string;
  variantLabel: string;
  qty: number;
}

interface SpecDrawerProps {
  open: boolean;
  entries: SpecEntry[];
  onClose: () => void;
  onUpdateQty: (key: string, delta: number) => void;
  onRemove: (key: string) => void;
  onClear: () => void;
}

export function SpecDrawer({
  open,
  entries,
  onClose,
  onUpdateQty,
  onRemove,
  onClear,
}: SpecDrawerProps) {
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const [wellParams, setWellParams] = useState('');
  const [copied, setCopied] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const totalUnits = entries.reduce((sum, e) => sum + e.qty, 0);

  const buildPlainTextSpec = () => {
    const lines = [
      'СПЕЦИФИКАЦИЯ / ОПРОСНЫЙ ЛИСТ УЭЦН',
      `Дата формирования: ${new Date().toLocaleDateString('ru-RU')}`,
      company ? `Организация: ${company}` : null,
      contact ? `Контакт: ${contact}` : null,
      wellParams ? `Параметры скважины: ${wellParams}` : null,
      '',
      'Позиции оборудования:',
      ...entries.map(
        (e, i) =>
          `${i + 1}. ${e.variantCode} — ${e.title} (${e.variantLabel}) × ${e.qty} шт.`
      ),
      '',
      `Итого единиц оборудования: ${totalUnits} шт.`,
    ].filter((l): l is string => l !== null);
    return lines.join('\n');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildPlainTextSpec());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard fallback ignored silently if blocked in sandbox
    }
  };

  const handleDownload = () => {
    const content = buildPlainTextSpec();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spec-uecn-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const refNumber = `КП-${new Date().getFullYear()}-${String(
      Math.floor(1000 + Math.random() * 9000)
    )}`;
    setSubmittedRef(refNumber);
  };

  const handleResetReceipt = () => {
    setSubmittedRef(null);
    onClear();
    setCompany('');
    setContact('');
    setWellParams('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="spec-drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/55 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white h-full flex flex-col shadow-2xl border-l border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <h2
              id="spec-drawer-title"
              className="text-lg font-bold text-slate-900"
            >
              Спецификация и запрос КП
            </h2>
            <p className="text-xs text-slate-500 tabular-nums mt-0.5">
              {entries.length > 0
                ? `Выбрано позиций: ${entries.length} · Всего единиц: ${totalUnits}`
                : 'Соберите компоновку УЭЦН для расчёта'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть спецификацию"
            className="p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {submittedRef ? (
            <div className="p-6 rounded-lg border border-slate-200 bg-[#F7F8FA] space-y-4">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800">
                <Check className="w-4 h-4" />
                Запрос {submittedRef} сформирован
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Спецификация на {totalUnits} ед. оборудования подготовлена. Вы можете
                скачать текстовый опросный лист для передачи в инженерный отдел или
                сформировать новую компоновку.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[#1D5FA7] text-white rounded-md hover:bg-[#174E8A] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Скачать опросный лист (.txt)
                </button>
                <button
                  type="button"
                  onClick={handleResetReceipt}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                >
                  Очистить и начать заново
                </button>
              </div>
            </div>
          ) : entries.length === 0 ? (
            <div className="py-12 text-center space-y-3 border border-dashed border-slate-300 rounded-lg px-6">
              <p className="text-sm font-medium text-slate-900">
                Спецификация пока пуста
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Откройте карточку насоса, двигателя, протектора или фильтра в каталоге
                и нажмите «Добавить в спецификацию», чтобы собрать компоновку скважины.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-4 py-2 text-xs font-medium text-[#1D5FA7] hover:text-[#174E8A] border border-[#1D5FA7]/30 rounded-md transition-colors"
              >
                Перейти к каталогу
              </button>
            </div>
          ) : (
            <>
              {/* Itemized list */}
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                {entries.map((entry) => (
                  <div
                    key={entry.key}
                    className="p-4 bg-white flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="font-mono text-xs font-semibold text-[#1D5FA7]">
                        {entry.variantCode}
                      </div>
                      <div className="text-sm font-medium text-slate-900 mt-0.5">
                        {entry.title}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {entry.categoryLabel} · {entry.variantLabel}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center border border-slate-200 rounded-md">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(entry.key, -1)}
                          aria-label="Уменьшить количество"
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-mono font-medium tabular-nums">
                          {entry.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(entry.key, 1)}
                          aria-label="Увеличить количество"
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemove(entry.key)}
                        aria-label="Удалить позицию"
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Export quick actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Скачать .txt
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                      Скопировано
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Копировать список
                    </>
                  )}
                </button>
              </div>

              {/* RFQ Form */}
              <form id="rfq-form" onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900">
                  Данные для коммерческого предложения
                </h3>
                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="rfq-company"
                      className="block text-xs font-medium text-slate-600 mb-1"
                    >
                      Организация / Месторождение
                    </label>
                    <input
                      id="rfq-company"
                      type="text"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Например: ООО «Нефтегаздобыча»"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="rfq-contact"
                      className="block text-xs font-medium text-slate-600 mb-1"
                    >
                      Контактный email или телефон
                    </label>
                    <input
                      id="rfq-contact"
                      type="text"
                      required
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="engineer@company.ru / +7 (___) ___-__-__"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="rfq-params"
                      className="block text-xs font-medium text-slate-600 mb-1"
                    >
                      Условия скважины (ЭК, температура, КВЧ, газовый фактор)
                    </label>
                    <textarea
                      id="rfq-params"
                      rows={3}
                      value={wellParams}
                      onChange={(e) => setWellParams(e.target.value)}
                      placeholder="ЭК 146 мм, Т пласта 135 °C, КВЧ до 0,8 г/л, требуемый дебит 120 м³/сут"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 resize-none"
                    />
                  </div>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Sticky footer CTA */}
        {!submittedRef && entries.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 bg-[#F7F8FA] flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onClear}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              Очистить всё
            </button>
            <button
              type="submit"
              form="rfq-form"
              className="px-5 py-2.5 text-sm font-medium text-white bg-[#1D5FA7] hover:bg-[#174E8A] rounded-md transition-colors whitespace-nowrap"
            >
              Сформировать запрос КП
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
