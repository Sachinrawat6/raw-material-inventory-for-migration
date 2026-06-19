import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaBox,
  FaPlus,
  FaSpinner,
  FaCheckCircle,
  FaWarehouse,
  FaCalendarAlt,
  FaTag,
  FaSearchLocation,
  FaLayerGroup,
} from 'react-icons/fa';
import { useGlobalContext } from '../components/context/StockContextProvider';

const BASE_URL = 'https://raw-material-backend.onrender.com';
const EMPTY_FORM = { styleNumber: '', stockQuantity: '', location: '', width: 'Normal' };

/* ─── Fabric picker card ────────────────────────────────── */
const FabricCard = ({ fabric, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full text-left flex items-center justify-between gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
      selected
        ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-300 ring-offset-1'
        : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
    }`}
  >
    <div className="min-w-0">
      <p
        className={`text-sm font-bold truncate ${selected ? 'text-indigo-700' : 'text-slate-800'}`}
      >
        #{fabric.fabricNumber}
      </p>
      <p className="text-xs text-slate-400 truncate mt-0.5">{fabric.fabricName || '—'}</p>
    </div>
    <div className="flex-shrink-0 text-right">
      <p
        className={`text-xs font-semibold ${Number(fabric.availableStock) > 0 ? 'text-emerald-600' : 'text-red-500'}`}
      >
        {Number(fabric.availableStock).toFixed(2)} MTR
      </p>
      <p className="text-xs text-slate-400 mt-0.5">{fabric.location || 'No location'}</p>
    </div>
    {selected && <FaCheckCircle className="text-indigo-500 flex-shrink-0 text-base" />}
  </button>
);

/* ─── Main component ────────────────────────────────────── */
const StockKeepingWithStyleNumber = () => {
  const { meterAndKG, fetchMeterAndKgRelationShip, styleLoading, stock } = useGlobalContext();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updatedStock, setUpdatedStock] = useState(null);

  useEffect(() => {
    fetchMeterAndKgRelationShip();
  }, []);

  /* ─── All fabrics linked to the entered style number ──── */
  const matchingFabrics = useMemo(() => {
    const sn = Number(formData.styleNumber);
    if (!sn || formData.styleNumber.length < 4) return [];
    return stock.filter((f) => Array.isArray(f.styleNumbers) && f.styleNumbers.includes(sn));
  }, [stock, formData.styleNumber]);

  /* ─── KG→MTR ratio for the SELECTED fabric ──────────── */
  const fabricAverage = useMemo(() => {
    if (!selectedFabric || !meterAndKG.length) return null;
    return (
      meterAndKG.find((m) => m.fabric_number === Number(selectedFabric.fabricNumber))
        ?.fabric_in_meter ?? null
    );
  }, [meterAndKG, selectedFabric]);

  const widthMultiplier = formData.width === 'Wide' ? 1.4 : 1;

  /* ─── Computed MTR preview (including width) ─────────── */
  const mtrPreview = useMemo(() => {
    if (!fabricAverage || !formData.stockQuantity) return null;
    return (Number(formData.stockQuantity) * fabricAverage * widthMultiplier).toFixed(2);
  }, [fabricAverage, formData.stockQuantity, widthMultiplier]);

  /* ─── Product preview ────────────────────────────────── */
  const handleFetchProduct = useCallback(async (styleCode) => {
    if (!styleCode) {
      setProduct(null);
      return;
    }
    try {
      const res = await axios.get(
        `https://inventorybackend-m1z8.onrender.com/api/product?style_code=${styleCode}`
      );
      setProduct(res.data[0] ?? null);
    } catch {
      setProduct(null);
    }
  }, []);

  useEffect(() => {
    if (selectedFabric?.styleNumbers?.[0]) {
      handleFetchProduct(selectedFabric.styleNumbers[0]);
    } else {
      setProduct(null);
    }
  }, [selectedFabric]);

  /* ─── Reset selection when style number clears ───────── */
  useEffect(() => {
    if (!formData.styleNumber) {
      setSelectedFabric(null);
      setProduct(null);
    }
  }, [formData.styleNumber]);

  /* ─── Handlers ───────────────────────────────────────── */
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'styleNumber') setSelectedFabric(null);
  }, []);

  const handleSelectFabric = useCallback((fabric) => {
    setSelectedFabric((prev) => (prev?._id === fabric._id ? null : fabric));
  }, []);

  const resetAll = useCallback(() => {
    setFormData(EMPTY_FORM);
    setSelectedFabric(null);
    setProduct(null);
    setUpdatedStock(null);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFabric) {
      toast.error('Please select a fabric from the list.');
      return;
    }
    if (!formData.stockQuantity) {
      toast.error('Please enter the quantity to add.');
      return;
    }
    if (!fabricAverage || fabricAverage < 1) {
      toast.error('Unmapped KG–MTR relationship for this fabric. Please map it first.');
      return;
    }

    setLoading(true);
    try {
      const metersToAdd = Number(formData.stockQuantity) * fabricAverage * widthMultiplier;

      const [response] = await Promise.all([
        axios.put(
          `${BASE_URL}/api/v1/stock/update`,
          {
            fabricNumber: selectedFabric.fabricNumber,
            stockQuantity: metersToAdd,
            location: formData.location,
          },
          { headers: { 'Content-Type': 'application/json' } }
        ),
        axios.put(`${BASE_URL}/api/v1/stock/${selectedFabric._id}?fabric_source=Vendor`, {
          location: formData.location,
        }),
      ]);

      if (response.data.success) {
        setUpdatedStock(response.data.message);
        toast.success('Stock updated successfully!');
        // Clear everything including product to prevent stale preview reappearing
        setFormData(EMPTY_FORM);
        setSelectedFabric(null);
        setProduct(null);
        setTimeout(() => setUpdatedStock(null), 4000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update stock.');
    } finally {
      setLoading(false);
    }
  };

  /* ─── Loading ────────────────────────────────────────── */
  if (styleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <FaSpinner className="animate-spin text-indigo-600 text-3xl" />
          <p className="text-slate-500 text-sm font-medium">Loading stock data…</p>
        </div>
      </div>
    );
  }

  const showPreview = !updatedStock && product?.style_id;

  /* ─── Render ─────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      {/* Page header */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl">
            <FaLayerGroup className="text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Stock Keeping by Style Number</h1>
            <p className="text-sm text-slate-500">
              Find linked fabrics via style number and update stock
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Form card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4">
            <h2 className="text-white font-semibold text-base">Stock Details</h2>
            <p className="text-indigo-200 text-xs mt-0.5">
              Search by style number, select a fabric, then add quantity
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Style Number search */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <FaTag className="text-indigo-500 text-xs" />
                Style Number <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="styleNumber"
                value={formData.styleNumber}
                onChange={handleInputChange}
                placeholder="e.g. 24045"
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                required
              />
            </div>

            {/* Fabric picker list */}
            {formData.styleNumber.length >= 4 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Linked Fabrics
                  </p>
                  {matchingFabrics.length > 0 && (
                    <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full font-semibold">
                      {matchingFabrics.length} found
                    </span>
                  )}
                </div>

                {matchingFabrics.length > 0 ? (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-0.5">
                    {matchingFabrics.map((fabric) => (
                      <FabricCard
                        key={fabric._id}
                        fabric={fabric}
                        selected={selectedFabric?._id === fabric._id}
                        onClick={() => handleSelectFabric(fabric)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <svg
                      className="w-4 h-4 text-amber-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <p className="text-xs text-amber-700 font-medium">
                      No fabrics linked to style #{formData.styleNumber}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Selected fabric summary */}
            {selectedFabric && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wide">
                    Selected Fabric
                  </p>
                  <p className="text-sm font-bold text-indigo-800 mt-0.5">
                    #{selectedFabric.fabricNumber} — {selectedFabric.fabricName}
                  </p>
                  {fabricAverage && (
                    <p className="text-xs text-indigo-600 mt-0.5">1 KG = {fabricAverage} MTR</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-indigo-500">Current</p>
                  <p
                    className={`text-sm font-bold ${Number(selectedFabric.availableStock) > 0 ? 'text-emerald-600' : 'text-red-500'}`}
                  >
                    {Number(selectedFabric.availableStock).toFixed(2)} MTR
                  </p>
                </div>
              </div>
            )}

            {/* Remaining fields after fabric is selected */}
            {selectedFabric && (
              <>
                {/* Quantity */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <FaPlus className="text-emerald-500 text-xs" />
                    Quantity to Add (KG) <span className="text-red-500">*</span>
                    {fabricAverage > 0 && (
                      <span className="ml-auto text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
                        1 KG = {fabricAverage} MTR
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleInputChange}
                    placeholder="Enter quantity in KG"
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                    required
                  />
                  {mtrPreview && (
                    <p className="text-xs text-slate-500 pl-1">
                      ≈ <span className="font-semibold text-indigo-600">{mtrPreview} MTR</span> will
                      be added
                      {formData.width === 'Wide' && (
                        <span className="text-amber-600 ml-1">(×1.4 Wide)</span>
                      )}
                    </p>
                  )}
                </div>

                {/* Width */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Width</label>
                  <select
                    name="width"
                    value={formData.width}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-700 bg-white"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Wide">Wide (×1.4)</option>
                  </select>
                  {formData.width === 'Wide' && (
                    <p className="text-xs text-amber-600 pl-1">
                      Wide fabric: entered quantity will be multiplied by 1.4
                    </p>
                  )}
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <FaSearchLocation className="text-amber-500 text-xs" />
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g. Warehouse A, Rack 3"
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                    required
                  />
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={resetAll}
                className="flex-1 py-2.5 px-4 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={loading || !selectedFabric}
                className="flex-[2] flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-indigo-200 cursor-pointer"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Updating…
                  </>
                ) : (
                  <>
                    <FaPlus />
                    Add Stock
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ── Right panel ── */}
        <div>
          {/* Success card */}
          {updatedStock && (
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <FaCheckCircle className="text-white text-lg" />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-base">Stock Updated!</h2>
                  <p className="text-emerald-100 text-xs mt-0.5">Changes saved successfully</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-xs text-slate-400 mb-1">Fabric Name</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {updatedStock.fabricName}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-xs text-slate-400 mb-1">Fabric Number</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {updatedStock.fabricNumber}
                    </p>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-emerald-600 mb-0.5">Available Stock</p>
                    <p className="text-2xl font-bold text-emerald-700">
                      {updatedStock.availableStock?.toFixed(2)}
                      <span className="text-sm font-medium ml-1">MTR</span>
                    </p>
                  </div>
                  <div className="bg-emerald-100 p-3 rounded-xl">
                    <FaBox className="text-emerald-600 text-xl" />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="bg-slate-100 p-1.5 rounded-lg">
                      <FaWarehouse className="text-slate-500 text-xs" />
                    </div>
                    <span className="text-slate-500">Location</span>
                    <span className="ml-auto font-medium text-slate-800">
                      {updatedStock.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="bg-slate-100 p-1.5 rounded-lg">
                      <FaCalendarAlt className="text-slate-500 text-xs" />
                    </div>
                    <span className="text-slate-500">Updated</span>
                    <span className="ml-auto font-medium text-slate-800">
                      {new Date(updatedStock.updatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {updatedStock.styleNumbers?.length > 0 && (
                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Style Numbers
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {updatedStock.styleNumbers.slice(0, 6).map((style, i) => (
                        <span
                          key={i}
                          className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-lg text-xs font-medium"
                        >
                          {style}
                        </span>
                      ))}
                      {updatedStock.styleNumbers.length > 6 && (
                        <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg text-xs">
                          +{updatedStock.styleNumbers.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Product preview */}
          {showPreview && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">Product Preview</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Style #{selectedFabric?.styleNumbers?.[0]}
                  </p>
                </div>
                <span className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-1 rounded-full font-medium">
                  Live
                </span>
              </div>
              <div className="overflow-hidden">
                <iframe
                  className="w-full h-[980px] -mt-56"
                  src={`https://www.myntra.com/dresses/qurvii/qurvii-flared-sleeves-sequinned-georgette-a-line-midi-dress/${product.style_id}/buy`}
                  frameBorder="0"
                  title="Product Preview"
                />
              </div>
            </div>
          )}

          {/* Empty state */}
          {!showPreview && !updatedStock && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 flex flex-col items-center justify-center text-center min-h-[300px]">
              <div className="bg-indigo-50 p-5 rounded-2xl mb-4">
                <FaLayerGroup className="text-3xl text-indigo-400" />
              </div>
              <p className="text-sm font-semibold text-slate-600">
                {formData.styleNumber.length >= 4 && matchingFabrics.length > 0
                  ? 'Select a fabric from the list to preview'
                  : 'Enter a style number to get started'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Product preview appears after selecting a fabric
              </p>
            </div>
          )}
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
        toastClassName="text-sm"
      />
    </div>
  );
};

export default StockKeepingWithStyleNumber;
