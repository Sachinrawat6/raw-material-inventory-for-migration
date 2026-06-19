import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useGlobalContext } from './context/StockContextProvider';
import Papa from 'papaparse';
import { fetchColorsFromGoogleSheet } from '../service/GoogleSheet.services';

const SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
const PAGE_SIZE = 10;

/* ─────────────────────────────────────────────────────────────────────────────
   Utility: normalise OMS CSV column names
   OMS exports use inconsistent casing: "Item SKU Code" / "Item SkuCode" / etc.
───────────────────────────────────────────────────────────────────────────── */
const findSkuColumn = (headers) => {
  const candidates = ['item skucode', 'item sku code', 'sku code', 'skucode', 'sku'];
  return headers.find((h) => candidates.includes(h.toLowerCase().trim())) ?? null;
};

/* ─────────────────────────────────────────────────────────────────────────────
   Build a Map<styleNumber, string[]> from the OMS SKU list.
   e.g. { "24048" -> ["24048-Red-XXS", "24048-Red-XS", "24048-Fuchia Pink-XXS", ...] }
   Style number is extracted as sku.split('-')[0]
───────────────────────────────────────────────────────────────────────────── */
const buildOmsStyleMap = (skuSet) => {
  const map = new Map();
  for (const sku of skuSet) {
    const styleNum = sku.split('-')[0];
    if (!styleNum) continue;
    if (!map.has(styleNum)) map.set(styleNum, []);
    map.get(styleNum).push(sku);
  }
  return map;
};

/* ─────────────────────────────────────────────────────────────────────────────
   Status badge helpers
───────────────────────────────────────────────────────────────────────────── */
const getStockStatus = (stock) => {
  if (stock > 3)
    return {
      label: 'Low',
      color: 'bg-orange-100 text-orange-700 border-orange-200',
      dot: 'bg-orange-500',
    };
  if (stock > 1)
    return {
      label: 'Very Low',
      color: 'bg-red-100 text-red-700 border-red-200',
      dot: 'bg-red-500',
    };
  return { label: 'Critical', color: 'bg-red-200 text-red-900 border-red-300', dot: 'bg-red-700' };
};

/* ─────────────────────────────────────────────────────────────────────────────
   CSV download helper
───────────────────────────────────────────────────────────────────────────── */
const downloadCSV = (rows, filename) => {
  const csv = Papa.unparse(rows, { quotes: true, delimiter: ',', header: true });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/* ─────────────────────────────────────────────────────────────────────────────
   Pagination
───────────────────────────────────────────────────────────────────────────── */
const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, pageSize }) => {
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  const pages = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const result = [];
    if (currentPage <= 4) {
      result.push(1, 2, 3, 4, 5, '…', totalPages);
    } else if (currentPage >= totalPages - 3) {
      result.push(
        1,
        '…',
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      );
    } else {
      result.push(1, '…', currentPage - 1, currentPage, currentPage + 1, '…', totalPages);
    }
    return result;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
      <p className="text-xs text-slate-500">
        Showing{' '}
        <span className="font-semibold text-slate-700">
          {start}–{end}
        </span>{' '}
        of <span className="font-semibold text-slate-700">{totalItems}</span> items
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-slate-400 text-sm">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentPage === p
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   Filter card
───────────────────────────────────────────────────────────────────────────── */
const FilterCard = ({ label, count, sublabel, active, onClick, colorScheme }) => {
  const schemes = {
    red: {
      border: active
        ? 'border-red-500 ring-2 ring-red-400 ring-offset-2'
        : 'border-slate-200 hover:border-red-300',
      count: active ? 'text-red-600' : 'text-red-500',
      icon: active ? 'bg-red-600 text-white' : 'bg-red-100 text-red-600',
      check: 'text-red-600',
    },
    emerald: {
      border: active
        ? 'border-emerald-500 ring-2 ring-emerald-400 ring-offset-2'
        : 'border-slate-200 hover:border-emerald-300',
      count: active ? 'text-emerald-600' : 'text-emerald-500',
      icon: active ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-600',
      check: 'text-emerald-600',
    },
  };
  const s = schemes[colorScheme];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full bg-white rounded-2xl border-2 p-5 text-left transition-all duration-200 shadow-sm cursor-pointer ${s.border}`}
    >
      {active && (
        <span className={`absolute top-3 right-3 ${s.check}`}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      )}
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl flex-shrink-0 transition-colors ${s.icon}`}>
          {colorScheme === 'red' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          )}
        </div>
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-wide ${active ? s.count : 'text-slate-400'}`}
          >
            {label}
          </p>
          <p className={`text-3xl font-bold mt-0.5 ${s.count}`}>{count}</p>
          <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>
        </div>
      </div>
    </button>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   Table row
───────────────────────────────────────────────────────────────────────────── */
const StockRow = ({ item, mode }) => {
  const status = getStockStatus(item.availableStock);
  const maxStock = mode === 'low' ? 5 : Math.max(item.availableStock, 100);
  const barPct = Math.min((item.availableStock / maxStock) * 100, 100);

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      {mode === 'low' && (
        <td className="px-5 py-4 whitespace-nowrap">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${status.color}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </td>
      )}
      <td className="px-5 py-4 whitespace-nowrap">
        <p className="text-sm font-bold text-slate-800">#{item.fabricNumber}</p>
        <p className="text-xs text-slate-400 mt-0.5">{item.fabricName || '—'}</p>
      </td>
      <td className="px-5 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${mode === 'low' ? status.dot : 'bg-emerald-500'}`}
              style={{ width: `${barPct}%` }}
            />
          </div>
          <span className="text-sm font-bold text-slate-800">
            {Number(item.availableStock).toFixed(2)}
          </span>
          <span className="text-xs text-slate-400">MTR</span>
        </div>
      </td>
      <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-600">
        {item.location || 'Main Warehouse'}
      </td>
      <td className="px-5 py-4">
        <div className="flex flex-wrap gap-1 max-w-xs">
          {item.styleNumbers?.length > 0 ? (
            <>
              {item.styleNumbers.slice(0, 3).map((s, idx) => (
                <span
                  key={idx}
                  className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-lg text-xs font-medium"
                >
                  {s}
                </span>
              ))}
              {item.styleNumbers.length > 3 && (
                <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg text-xs">
                  +{item.styleNumbers.length - 3}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs text-slate-400">No styles</span>
          )}
        </div>
      </td>
    </tr>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   OMS Upload Panel
   – Drag & drop or click-to-browse
   – Parses Item SKU Code column → omsSkuSet
   – Shows parse result: total SKUs loaded, column found, error state
───────────────────────────────────────────────────────────────────────────── */
const OmsUploadPanel = ({ omsSkuSet, omsFileName, omsError, onUpload, onClear }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) onUpload(file);
    },
    [onUpload]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };
  const handleDragLeave = () => setDragging(false);
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  // Loaded state
  if (omsSkuSet.size > 0) {
    return (
      <div className="bg-white rounded-2xl border-2 border-violet-200 shadow-sm p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-violet-100 p-2.5 rounded-xl flex-shrink-0">
              <svg
                className="w-5 h-5 text-violet-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">OMS File Loaded</p>
              <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{omsFileName}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="bg-violet-100 text-violet-700 border border-violet-200 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {omsSkuSet.size.toLocaleString()} SKUs loaded
                </span>
                <span className="text-xs text-slate-400">Source of truth active ✓</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClear}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0"
            title="Remove OMS file"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Upload state
  return (
    <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 shadow-sm overflow-hidden">
      {/* Header strip */}
      <div className="px-5 pt-4 pb-2 flex items-center gap-2">
        <div className="bg-violet-100 p-2 rounded-xl">
          <svg
            className="w-4 h-4 text-violet-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">
            Step 4 — Upload OMS Simple Products CSV
          </p>
          <p className="text-xs text-slate-400">
            Required before export · source of truth for valid SKUs
          </p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`mx-5 mb-4 mt-1 rounded-xl border-2 border-dashed p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
          dragging
            ? 'border-violet-500 bg-violet-50'
            : 'border-slate-200 hover:border-violet-400 hover:bg-violet-50/40'
        }`}
      >
        <div
          className={`p-3 rounded-full transition-colors ${dragging ? 'bg-violet-100' : 'bg-slate-100'}`}
        >
          <svg
            className={`w-6 h-6 ${dragging ? 'text-violet-600' : 'text-slate-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
        <p className="text-sm font-semibold text-slate-700">
          {dragging ? 'Drop the CSV file here' : 'Drag & drop or click to browse'}
        </p>
        <p className="text-xs text-slate-400">Accepts .csv — must contain "Item SKU Code" column</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Error */}
      {omsError && (
        <div className="mx-5 mb-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
          <svg
            className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-xs text-red-700 font-medium">{omsError}</p>
        </div>
      )}

      {/* Info pills */}
      <div className="px-5 pb-4 flex flex-wrap gap-2">
        {[
          'Item SKU Code column required',
          'Downloaded from OMS Guru → Simple Products',
          'All sizes XXS–5XL resolved',
        ].map((t) => (
          <span key={t} className="bg-slate-100 text-slate-500 text-xs px-2.5 py-1 rounded-full">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   SKU Match Preview strip
   Shows how many generated SKUs matched OMS per group before export
───────────────────────────────────────────────────────────────────────────── */
const SkuMatchStrip = ({ zeroMatchCount, liveMatchCount, omsLoaded }) => {
  if (!omsLoaded) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {[
        { label: 'ZERO Export — OMS-Validated SKUs', count: zeroMatchCount, color: 'red' },
        { label: 'LIVE Export — OMS-Validated SKUs', count: liveMatchCount, color: 'emerald' },
      ].map(({ label, count, color }) => (
        <div
          key={label}
          className={`flex items-center justify-between bg-white rounded-xl border border-${color}-200 px-4 py-3 shadow-sm`}
        >
          <p className="text-xs font-semibold text-slate-600">{label}</p>
          <span
            className={`text-sm font-bold text-${color}-600 bg-${color}-50 border border-${color}-200 px-2.5 py-0.5 rounded-full`}
          >
            {count} rows
          </span>
        </div>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────────────────────── */
const LowStockInventory = () => {
  const { stockLoading, stock } = useGlobalContext();

  // Colors from Google Sheet
  const [colors, setColors] = useState([]);

  // ── OMS state ──────────────────────────────────────────────────────────────
  const [omsSkuSet, setOmsSkuSet] = useState(new Set()); // Set<string> — all OMS SKUs
  const [omsStyleMap, setOmsStyleMap] = useState(new Map()); // Map<styleNum, SKU[]>
  const [omsFileName, setOmsFileName] = useState('');
  const [omsError, setOmsError] = useState('');
  const [omsParsing, setOmsParsing] = useState(false);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [exportingLive, setExportingLive] = useState(false);
  const [exportingZero, setExportingZero] = useState(false);
  const [activeFilter, setActiveFilter] = useState('low'); // 'low' | 'safe'
  const [currentPage, setCurrentPage] = useState(1);

  /* ── Data fetches ──────────────────────────────────────────────────────── */
  useEffect(() => {
    fetchColorsFromGoogleSheet()
      .then(setColors)
      .catch(() => {});
  }, []);

  /* ── Derived stock groups ──────────────────────────────────────────────── */
  const lowStockItems = useMemo(() => stock.filter((p) => p.availableStock < 5), [stock]);
  const safeStockItems = useMemo(() => stock.filter((p) => p.availableStock >= 5), [stock]);
  const criticalCount = useMemo(
    () => lowStockItems.filter((i) => i.availableStock <= 1).length,
    [lowStockItems]
  );

  const displayItems = activeFilter === 'low' ? lowStockItems : safeStockItems;
  const totalPages = Math.ceil(displayItems.length / PAGE_SIZE);
  const pagedItems = useMemo(
    () => displayItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [displayItems, currentPage]
  );

  const handleFilterChange = useCallback((filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  }, []);

  /* ── OMS CSV upload handler ────────────────────────────────────────────────
     1. Parse the uploaded CSV with PapaParse
     2. Find the SKU column (handles casing variations)
     3. Extract all non-empty SKU values into a Set
     4. Store in state — this Set becomes the source of truth for all exports
  ─────────────────────────────────────────────────────────────────────────── */
  const handleOMSUpload = useCallback((file) => {
    if (!file) return;
    setOmsError('');
    setOmsParsing(true);
    setOmsFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields ?? [];
        const skuColumn = findSkuColumn(headers);

        if (!skuColumn) {
          setOmsError(
            `Could not find SKU column. Detected columns: ${headers.slice(0, 5).join(', ')}…`
          );
          setOmsParsing(false);
          return;
        }

        const skuSet = new Set(
          results.data.map((row) => String(row[skuColumn] ?? '').trim()).filter(Boolean)
        );

        if (skuSet.size === 0) {
          setOmsError('SKU column found but contains no values. Check the CSV file.');
          setOmsParsing(false);
          return;
        }

        // Build style → [SKUs] map so exports can look up ALL SKUs per style directly
        const styleMap = buildOmsStyleMap(skuSet);

        setOmsSkuSet(skuSet);
        setOmsStyleMap(styleMap);
        setOmsParsing(false);
        console.log(
          `[OMS] Loaded ${skuSet.size} SKUs across ${styleMap.size} styles from "${skuColumn}" column`
        );
      },
      error: (err) => {
        setOmsError(`CSV parse error: ${err.message}`);
        setOmsParsing(false);
      },
    });
  }, []);

  const handleOMSClear = useCallback(() => {
    setOmsSkuSet(new Set());
    setOmsStyleMap(new Map());
    setOmsFileName('');
    setOmsError('');
  }, []);

  /* ── Core SKU resolution ───────────────────────────────────────────────────
     Algorithm (OMS-first approach):
       1. Collect unique style numbers from the stock group
       2. For each style number → look up ALL matching SKUs from omsStyleMap
          (omsStyleMap was built from the uploaded OMS CSV as Map<style, SKU[]>)
       3. Those SKUs already contain the correct colors and sizes — no
          permutation generation needed. OMS is the source of truth.
       4. Export only those SKUs with the target VirtualStock value.

     Example:
       Stock group has style "24048"
       omsStyleMap["24048"] = [
         "24048-Red-XXS", "24048-Red-XS", ..., "24048-Fuchia Pink-5XL"
       ]
       → All of those go into the output file.
  ─────────────────────────────────────────────────────────────────────────── */
  const buildCSVRows = useCallback(
    (items, virtualStock) => {
      // OMS file must be uploaded before export
      if (omsStyleMap.size === 0) return [];

      const uniqueStyles = [...new Set(items.flatMap((item) => item.styleNumbers ?? []))];
      const rows = [];

      for (const styleNum of uniqueStyles) {
        const omsSkus = omsStyleMap.get(String(styleNum));

        if (!omsSkus || omsSkus.length === 0) {
          console.warn(`[SKU] Style "${styleNum}" not found in OMS file — skipped`);
          continue;
        }

        // Every SKU in omsStyleMap for this style goes into the export file
        for (const sku of omsSkus) {
          rows.push({
            'DropshipWarehouseId*': 22784,
            'Item SkuCode': sku,
            VirtualStock: virtualStock,
          });
        }
      }

      return rows;
    },
    [omsStyleMap]
  );

  /* ── Pre-compute match counts for the info strip ─────────────────────── */
  const zeroMatchCount = useMemo(
    () => buildCSVRows(lowStockItems, 0).length,
    [buildCSVRows, lowStockItems]
  );
  const liveMatchCount = useMemo(
    () => buildCSVRows(safeStockItems, 100).length,
    [buildCSVRows, safeStockItems]
  );

  /* ── Export handlers ───────────────────────────────────────────────────── */
  const handleExportZero = useCallback(async () => {
    setExportingZero(true);
    try {
      const rows = buildCSVRows(lowStockItems, 0);
      if (rows.length === 0) {
        alert('No matching OMS SKUs found for Zero Inventory group.');
        return;
      }
      downloadCSV(rows, 'BulkUpdateVirtualStock.csv');
    } catch {
      /* silent */
    } finally {
      setTimeout(() => setExportingZero(false), 800);
    }
  }, [lowStockItems, buildCSVRows]);

  const handleExportLive = useCallback(async () => {
    setExportingLive(true);
    try {
      const rows = buildCSVRows(safeStockItems, 100);
      if (rows.length === 0) {
        alert('No matching OMS SKUs found for Live Inventory group.');
        return;
      }
      downloadCSV(rows, 'BulkUpdateVirtualStock.csv');
    } catch {
      /* silent */
    } finally {
      setTimeout(() => setExportingLive(false), 800);
    }
  }, [safeStockItems, buildCSVRows]);

  /* ── Unique style counts for info cards ───────────────────────────────── */
  const liveUniqueStyles = useMemo(
    () => [...new Set(safeStockItems.flatMap((i) => i.styleNumbers ?? []))].length,
    [safeStockItems]
  );
  const zeroUniqueStyles = useMemo(
    () => [...new Set(lowStockItems.flatMap((i) => i.styleNumbers ?? []))].length,
    [lowStockItems]
  );

  const omsLoaded = omsSkuSet.size > 0;

  /* ── Loading screen ───────────────────────────────────────────────────── */
  if (stockLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Loading stock data…</p>
        </div>
      </div>
    );
  }

  const tableHeaders =
    activeFilter === 'low'
      ? ['Status', 'Fabric', 'Stock Level', 'Location', 'Style Numbers']
      : ['Fabric', 'Stock Level', 'Location', 'Style Numbers'];

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ── Page header ───────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2.5 rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Stock Inventory Management</h1>
              <p className="text-sm text-slate-500">Monitor and export fabric inventory levels</p>
            </div>
          </div>

          {/* Export buttons */}
          <div className="flex flex-wrap gap-2">
            {/* OMS not loaded warning */}
            {!omsLoaded && (
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-2 rounded-xl">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Upload OMS file to validate SKUs
              </div>
            )}

            <button
              onClick={handleExportZero}
              disabled={exportingZero || !omsLoaded || lowStockItems.length === 0}
              title={!omsLoaded ? 'Upload OMS Simple Products CSV first' : undefined}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-xl shadow-sm shadow-red-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {exportingZero ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Exporting…
                </>
              ) : (
                <>
                  <DownloadIcon />
                  Zero Inventory<CountBadge>{omsLoaded ? zeroMatchCount : '—'}</CountBadge>
                </>
              )}
            </button>

            <button
              onClick={handleExportLive}
              disabled={exportingLive || !omsLoaded || safeStockItems.length === 0}
              title={!omsLoaded ? 'Upload OMS Simple Products CSV first' : undefined}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-sm shadow-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {exportingLive ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Exporting…
                </>
              ) : (
                <>
                  <DownloadIcon />
                  Live Inventory<CountBadge>{omsLoaded ? liveMatchCount : '—'}</CountBadge>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── OMS Upload Panel (Step 4 & 5) ─────────────────────────────── */}
        {omsParsing ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-600 font-medium">
              Parsing OMS CSV — extracting Item SKU Codes…
            </p>
          </div>
        ) : (
          <OmsUploadPanel
            omsSkuSet={omsSkuSet}
            omsFileName={omsFileName}
            omsError={omsError}
            onUpload={handleOMSUpload}
            onClear={handleOMSClear}
          />
        )}

        {/* ── OMS-validated SKU match strip ────────────────────────────── */}
        <SkuMatchStrip
          zeroMatchCount={zeroMatchCount}
          liveMatchCount={liveMatchCount}
          omsLoaded={omsLoaded}
        />

        {/* ── Stats card ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-5 border-l-4 border-indigo-500 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Total Fabrics
              </p>
              <p className="text-3xl font-bold mt-1 text-indigo-600">{stock.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-100">
              <svg
                className="w-5 h-5 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* ── Filter cards ─────────────────────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Filter by Stock Type
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FilterCard
              label="Low Stock"
              count={lowStockItems.length}
              sublabel={`${criticalCount} critical · stock < 5 MTR`}
              active={activeFilter === 'low'}
              onClick={() => handleFilterChange('low')}
              colorScheme="red"
            />
            <FilterCard
              label="Safe Stock"
              count={safeStockItems.length}
              sublabel="Stock ≥ 5 MTR — healthy inventory"
              active={activeFilter === 'safe'}
              onClick={() => handleFilterChange('safe')}
              colorScheme="emerald"
            />
          </div>
        </div>

        {/* ── CSV info strip ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              color: 'emerald',
              title: 'Live Inventory Export',
              desc: 'Fabrics ≥ 5 MTR · VirtualStock =',
              value: '100',
              valueColor: 'text-emerald-600',
              styles: liveUniqueStyles,
              rows: omsLoaded ? liveMatchCount : liveUniqueStyles * SIZES.length,
              note: omsLoaded ? 'OMS-validated rows' : 'Estimated (upload OMS to validate)',
            },
            {
              color: 'red',
              title: 'Zero Inventory Export',
              desc: 'Fabrics < 5 MTR · VirtualStock =',
              value: '0',
              valueColor: 'text-red-600',
              styles: zeroUniqueStyles,
              rows: omsLoaded ? zeroMatchCount : zeroUniqueStyles * SIZES.length,
              note: omsLoaded ? 'OMS-validated rows' : 'Estimated (upload OMS to validate)',
            },
          ].map(({ color, title, desc, value, valueColor, styles, rows, note }) => (
            <div key={title} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-start gap-3">
                <div className={`bg-${color}-100 p-2 rounded-xl flex-shrink-0`}>
                  <svg
                    className={`w-4 h-4 text-${color}-600`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {desc} <span className={`font-bold ${valueColor}`}>{value}</span> · unique
                    styles × 10 sizes
                  </p>
                  <p className="text-xs text-indigo-600 font-medium mt-1.5">
                    {styles} unique styles → <span className="font-bold">{rows} rows</span>
                  </p>
                  <p
                    className={`text-xs mt-0.5 ${omsLoaded ? 'text-violet-600 font-semibold' : 'text-slate-400'}`}
                  >
                    {note}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Table ─────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full animate-pulse ${activeFilter === 'low' ? 'bg-red-500' : 'bg-emerald-500'}`}
              />
              <h2 className="text-sm font-bold text-slate-800">
                {activeFilter === 'low' ? 'Low Stock Items' : 'Safe Stock Items'}
              </h2>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                  activeFilter === 'low'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {displayItems.length} items
              </span>
            </div>
            {activeFilter === 'low' && criticalCount > 0 && (
              <span className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded-full">
                {criticalCount} critical
              </span>
            )}
          </div>

          {pagedItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead>
                  <tr className="bg-slate-50">
                    {tableHeaders.map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pagedItems.map((item, i) => (
                    <StockRow key={`${item.fabricNumber}-${i}`} item={item} mode={activeFilter} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div
                className={`p-5 rounded-2xl mb-4 ${activeFilter === 'low' ? 'bg-emerald-100' : 'bg-slate-100'}`}
              >
                <svg
                  className={`w-10 h-10 ${activeFilter === 'low' ? 'text-emerald-600' : 'text-slate-400'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <p className="text-base font-bold text-slate-700">
                {activeFilter === 'low' ? 'All stock levels healthy' : 'No safe stock items'}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {activeFilter === 'low'
                  ? 'No fabrics below the 5 MTR threshold'
                  : 'No fabrics above the 5 MTR threshold'}
              </p>
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={displayItems.length}
            pageSize={PAGE_SIZE}
          />
        </div>
      </div>
    </div>
  );
};

/* ── Tiny inline helpers ──────────────────────────────────────────────────── */
const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
    />
  </svg>
);

const CountBadge = ({ children }) => (
  <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-md">{children}</span>
);

export default LowStockInventory;
