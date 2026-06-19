// import React, { useEffect, useState } from 'react';
// import { useGlobalContext } from '../components/context/StockContextProvider';
// import axios from 'axios';

// const Ship_Stock = () => {
//   const [loading, setLoading] = useState(false);
//   const [product, setProduct] = useState({});
//   const [formData, setFormData] = useState({
//     fabricNumber: '',
//     ship_quantity: '',
//     destination: '',
//     current_destination: '',
//   });

//   const BASE_URL = 'https://raw-material-backend.onrender.com';
//   // const BASE_URL = "http://localhost:5000"

//   // _________________________________________________ input handle change  ________________________________________________________

//   const { stock, fetchStock } = useGlobalContext();
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // _________________________________________________end of input handle change  ________________________________________________________

//   // _________________________________________________ start stock2 updating code   ________________________________________________________

//   const updateStock2Inventory = async () => {
//     const { fabricNumber } = formData;
//     const matchedStyleNumbersAndFabricName = stock.find(
//       (fab) => Number(fab.fabricNumber) === Number(fabricNumber)
//     );
//     try {
//       const payload = {
//         fabricNumber: matchedStyleNumbersAndFabricName?.fabricNumber || '',
//         fabricName: matchedStyleNumbersAndFabricName?.fabricName || '',
//         fabric_source: formData.current_destination,
//         availableStock: Number(formData.ship_quantity),
//         styleNumbers: matchedStyleNumbersAndFabricName.styleNumbers || [],
//       };
//       const response = await axios.post(`${BASE_URL}/api/v1/stock2/bulk`, { stocks: [payload] });
//       console.log('payload ', payload);
//       console.log('Stock2 updated', response);
//       setFormData({ fabricNumber: '', fabricName: '', current_destination: '', destination: '' });
//     } catch (error) {
//       console.log(`Failed to update stock2 stock inventory error is :: ${error}`);
//     }
//   };

//   console.log('stock', stock);
//   // _________________________________________________ start Style id fetching for product image ________________________________________________________

//   const handleFetchProduct = async () => {
//     setLoading(true);
//     try {
//       const existingStock = stock.find(
//         (item) => Number(item.fabricNumber) === Number(formData.fabricNumber)
//       );
//       if (!existingStock) return;
//       console.log(existingStock);
//       const response = await fetch(
//         `https://inventorybackend-m1z8.onrender.com/api/product?style_code=${existingStock?.styleNumbers[0]}`
//       );
//       const data = await response.json();
//       setProduct(data[0]);
//     } catch (error) {
//       console.log('Failed to fetch product details.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     handleFetchProduct();
//   }, [formData.fabricNumber]);

//   // _________________________________________________ end of style id fetching for product image _____________________________________________________

//   // _________________________________________________ start stock updating ________________________________________________________

//   let localStock = stock.map((s) => ({ ...s }));
//   const handleStockUpdate = async (e) => {
//     e.preventDefault();
//     const existingStock = localStock.find(
//       (item) => Number(item.fabricNumber) === Number(formData.fabricNumber)
//     );

//     if (!existingStock) {
//       alert(`Stock not found for ${formData.fabricNumber}`);
//       setFormData({ fabricNumber: '', ship_quantity: '', destination: '' });
//       return;
//     }
//     const newStock = Math.max(
//       0,
//       Number(existingStock.availableStock || 0) - Number(formData.ship_quantity)
//     );

//     try {
//       await axios.put(`${BASE_URL}/api/v1/stock/${existingStock._id}`, {
//         availableStock: newStock,
//       });

//       // __________________________ add stock in store2 if destination is store2 ______________________________________
//       if (
//         !formData.destination === 'store2' ||
//         !(Number(existingStock?.availableStock) >= Number(formData.ship_quantity))
//       ) {
//         alert('Stock is not sufficient for ship');
//         return;
//       } else {
//         await updateStock2Inventory();
//       }
//       alert(`Stock Shipped from ${formData.fabricNumber}`);
//       fetchStock();
//       setFormData({
//         fabricNumber: '',
//         ship_quantity: '',
//         destination: '',
//         current_destination: '',
//       });

//       console.log(
//         `Updated fabric ${formData.fabricNumber}: ${existingStock.availableStock} - ${formData.ship_quantity} = ${newStock}`
//       );

//       // Update local stock for next iteration
//       existingStock.availableStock = newStock;
//     } catch (error) {
//       console.error(`Failed to update stock for fabric ${formData.fabricNumber}`, error);
//     }
//   };

//   // _________________________________________________end of  stock updating ________________________________________________________
//   const { fabricNumber, ship_quantity, current_destination, destination } = formData;

//   return (
//     <div className="min-h-screen">
//       <div className="container mx-auto">
//         <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
//             {/* Left Column - Form */}
//             <div className="space-y-6">
//               <div className="border-b border-gray-200 pb-4">
//                 <h1 className="text-2xl font-bold text-gray-900">Stock Shipping</h1>
//                 <p className="text-sm text-gray-600 mt-1">Transfer inventory between locations</p>
//               </div>

//               <form onSubmit={handleStockUpdate} className="space-y-5">
//                 <div className="space-y-4">
//                   <div>
//                     <label
//                       htmlFor="fabricNumber"
//                       className="block text-sm font-medium text-gray-700 mb-1"
//                     >
//                       Fabric Number
//                     </label>
//                     <input
//                       type="number"
//                       id="fabricNumber"
//                       name="fabricNumber"
//                       placeholder="Enter fabric number..."
//                       value={fabricNumber}
//                       required
//                       onChange={handleChange}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
//                     />
//                   </div>

//                   <div>
//                     <label
//                       htmlFor="ship_quantity"
//                       className="block text-sm font-medium text-gray-700 mb-1"
//                     >
//                       Ship Quantity (METER)
//                     </label>
//                     <input
//                       type="number"
//                       id="ship_quantity"
//                       name="ship_quantity"
//                       placeholder="Enter ship quantity..."
//                       value={ship_quantity}
//                       required
//                       onChange={handleChange}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
//                     />
//                   </div>

//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     <div>
//                       <label
//                         htmlFor="current_destination"
//                         className="block text-sm font-medium text-gray-700 mb-1"
//                       >
//                         Current Location
//                       </label>
//                       <select
//                         id="current_destination"
//                         onChange={handleChange}
//                         required
//                         value={current_destination}
//                         name="current_destination"
//                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
//                       >
//                         <option value="">Select Current Location</option>
//                         <option value="store1">Store 1</option>
//                         <option value="vendor">Vendor</option>
//                       </select>
//                     </div>

//                     <div>
//                       <label
//                         htmlFor="destination"
//                         className="block text-sm font-medium text-gray-700 mb-1"
//                       >
//                         Destination
//                       </label>
//                       <select
//                         id="destination"
//                         required
//                         onChange={handleChange}
//                         value={destination}
//                         name="destination"
//                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
//                       >
//                         <option value="">Select Destination</option>
//                         <option value="store2">Store 2</option>
//                         <option value="production">Production</option>
//                       </select>
//                     </div>
//                   </div>
//                 </div>

//                 <button
//                   type="submit"
//                   className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//                 >
//                   Ship Stock
//                 </button>
//               </form>

//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                 <h3 className="text-sm font-semibold text-blue-800 mb-1">Quick Tips</h3>
//                 <ul className="text-xs text-blue-700 space-y-1">
//                   <li>• Enter valid fabric number to load product details</li>
//                   <li>• Ensure sufficient stock before shipping</li>
//                   <li>• Double-check destination locations</li>
//                 </ul>
//               </div>
//             </div>

//             {/* Right Column - Product Preview */}
//             <div className="space-y-4">
//               <div className="border-b border-gray-200 pb-4">
//                 <h2 className="text-lg font-semibold text-gray-900">Product Preview</h2>
//                 <p className="text-sm text-gray-600 mt-1">Product details will appear here</p>
//               </div>

//               <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 min-h-[500px] flex items-center justify-center">
//                 {loading ? (
//                   <div className="flex flex-col items-center justify-center space-y-3">
//                     <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//                     <p className="text-center text-sm text-gray-600 font-medium">
//                       Loading product details...
//                     </p>
//                   </div>
//                 ) : product?.style_id ? (
//                   <div className="w-full h-full rounded-lg  shadow-md overflow-hidden">
//                     <iframe
//                       className="w-full h-[600px] rounded-lg -mt-40"
//                       src={`https://www.myntra.com/dresses/qurvii/qurvii-flared-sleeves-sequinned-georgette-a-line-midi-dress/${product?.style_id}/buy`}
//                       frameBorder="0"
//                       title="Product Preview"
//                     />
//                   </div>
//                 ) : (
//                   <div className="text-center text-gray-500 space-y-3">
//                     <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
//                       <svg
//                         className="w-8 h-8 text-gray-400"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
//                         />
//                       </svg>
//                     </div>
//                     <p className="font-medium text-gray-600">
//                       Enter a fabric number to view product details
//                     </p>
//                     <p className="text-sm text-gray-500">Product preview will appear here</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Ship_Stock;

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useGlobalContext } from '../components/context/StockContextProvider';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSpinner } from 'react-icons/fa';

const BASE_URL = 'https://raw-material-backend.onrender.com';
const EMPTY_FORM = {
  fabricNumber: '',
  ship_quantity: '',
  destination: '',
  current_destination: '',
};

/* ── Submitting overlay ──────────────────────────────────── */
const SubmittingOverlay = () => (
  <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center gap-4">
    <div className="bg-white border border-slate-200 shadow-lg rounded-2xl px-8 py-6 flex flex-col items-center gap-3">
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full bg-blue-50 border-2 border-blue-300 animate-pulse" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-slate-800">Shipping Stock…</p>
        <p className="text-xs text-slate-400 mt-0.5">Updating inventory, please wait</p>
      </div>
      <div className="flex gap-1.5">
        {[0, 150, 300].map((delay) => (
          <div
            key={delay}
            className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  </div>
);

/* ── Main component ─────────────────────────────────────── */
const Ship_Stock = () => {
  const { stock, fetchStock } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [product, setProduct] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const { fabricNumber, ship_quantity, current_destination, destination } = formData;

  /* ─── Derived values ──────────────────────────────────── */

  const existingStock = useMemo(
    () => stock.find((item) => Number(item.fabricNumber) === Number(fabricNumber)),
    [stock, fabricNumber]
  );

  const availableStock = existingStock?.availableStock ?? null;

  const remainingAfterShip = useMemo(() => {
    if (availableStock === null || !ship_quantity) return null;
    return Math.max(0, Number(availableStock) - Number(ship_quantity));
  }, [availableStock, ship_quantity]);

  const isInsufficient =
    ship_quantity > 0 && availableStock !== null && Number(ship_quantity) > Number(availableStock);

  /* ─── Fetch product preview ───────────────────────────── */

  const fetchProduct = useCallback(async () => {
    if (!existingStock?.styleNumbers?.[0]) {
      setProduct(null);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(
        `https://inventorybackend-m1z8.onrender.com/api/product?style_code=${existingStock.styleNumbers[0]}`
      );
      setProduct(res.data[0] ?? null);
    } catch {
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [existingStock?.styleNumbers]);

  useEffect(() => {
    if (fabricNumber.toString().length > 3) {
      fetchProduct();
    } else {
      setProduct(null);
    }
  }, [fabricNumber]);

  /* ─── Handlers ────────────────────────────────────────── */

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(EMPTY_FORM);
    setProduct(null);
  }, []);

  /* ─── Add to Store 2 ──────────────────────────────────── */

  const updateStock2Inventory = useCallback(async () => {
    if (!existingStock) return;
    const payload = {
      fabricNumber: existingStock.fabricNumber,
      fabricName: existingStock.fabricName || '',
      fabric_source: current_destination,
      availableStock: Number(ship_quantity),
      styleNumbers: existingStock.styleNumbers || [],
    };
    await axios.post(`${BASE_URL}/api/v1/stock2/bulk`, { stocks: [payload] });
  }, [existingStock, current_destination, ship_quantity]);

  /* ─── Submit ──────────────────────────────────────────── */

  const handleStockUpdate = async (e) => {
    e.preventDefault();

    if (!existingStock) {
      toast.error(`Stock not found for fabric number ${fabricNumber}.`);
      return;
    }

    // FIX: sufficiency check BEFORE any API call
    if (Number(ship_quantity) > Number(existingStock.availableStock || 0)) {
      toast.error(`Insufficient stock. Available: ${existingStock.availableStock} MTR.`);
      return;
    }

    const newStock = Number(existingStock.availableStock || 0) - Number(ship_quantity);

    setSubmitting(true);
    try {
      // Deduct from main stock
      const stockUpdate = axios.put(`${BASE_URL}/api/v1/stock/${existingStock._id}`, {
        availableStock: newStock,
      });

      // FIX: correct destination check — was `!formData.destination === 'store2'` (always false)
      if (destination === 'store2') {
        // Run both in parallel
        await Promise.all([stockUpdate, updateStock2Inventory()]);
      } else {
        await stockUpdate;
      }

      toast.success(`Stock shipped successfully from fabric ${fabricNumber}!`);
      fetchStock();
      resetForm();
    } catch (error) {
      toast.error(`Failed to ship stock: ${error.response?.data?.message || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Render ──────────────────────────────────────────── */

  return (
    <>
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        {/* Page header */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2.5 rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Ship Stock</h1>
              <p className="text-sm text-slate-500">Transfer inventory between locations</p>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Form card ── */}
          <div className="relative bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {submitting && <SubmittingOverlay />}

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h2 className="text-white font-semibold text-base">Shipment Details</h2>
              <p className="text-blue-100 text-xs mt-0.5">Fill in the shipping information below</p>
            </div>

            <form onSubmit={handleStockUpdate} className="p-6 space-y-4">
              {/* Fabric Number */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Fabric Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="fabricNumber"
                  value={fabricNumber}
                  onChange={handleChange}
                  placeholder="e.g. 6020"
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                  required
                />
                {/* Available stock indicator */}
                {availableStock !== null && (
                  <p className="text-xs pl-1 text-slate-500">
                    Available:{' '}
                    <span
                      className={`font-semibold ${Number(availableStock) > 0 ? 'text-emerald-600' : 'text-red-500'}`}
                    >
                      {Number(availableStock).toFixed(2)} MTR
                    </span>
                  </p>
                )}
              </div>

              {/* Ship Quantity */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Ship Quantity (MTR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="ship_quantity"
                  value={ship_quantity}
                  onChange={handleChange}
                  placeholder="Enter quantity to ship"
                  className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-2 outline-none transition-all placeholder:text-slate-400 ${
                    isInsufficient
                      ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
                      : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  required
                />
                {/* Remaining stock preview */}
                {remainingAfterShip !== null && !isInsufficient && (
                  <p className="text-xs pl-1 text-slate-500">
                    Remaining after ship:{' '}
                    <span className="font-semibold text-blue-600">
                      {remainingAfterShip.toFixed(2)} MTR
                    </span>
                  </p>
                )}
                {isInsufficient && (
                  <p className="text-xs pl-1 font-semibold text-red-500">
                    Insufficient stock — only {Number(availableStock).toFixed(2)} MTR available.
                  </p>
                )}
              </div>

              {/* Current Location + Destination */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Current Location <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="current_destination"
                    value={current_destination}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-700 bg-white"
                    required
                  >
                    <option value="">Select location</option>
                    <option value="store1">Store 1</option>
                    <option value="vendor">Vendor</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Destination <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="destination"
                    value={destination}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-700 bg-white"
                    required
                  >
                    <option value="">Select destination</option>
                    <option value="store2">Store 2</option>
                    <option value="production">Production</option>
                  </select>
                </div>
              </div>

              {/* Store 2 info */}
              {destination === 'store2' && ship_quantity > 0 && !isInsufficient && (
                <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
                  <div className="bg-indigo-100 p-1.5 rounded-lg flex-shrink-0">
                    <svg
                      className="w-3.5 h-3.5 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-xs text-indigo-700">
                    <span className="font-semibold">{Number(ship_quantity).toFixed(2)} MTR</span>{' '}
                    will be added to Store 2 inventory.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={submitting || loading || isInsufficient}
                  className="flex-[2] flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-blue-200 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Shipping…
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12"
                        />
                      </svg>
                      Ship Stock
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick tips */}
            <div className="mx-6 mb-6 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Quick Tips
              </p>
              <ul className="text-xs text-slate-500 space-y-1">
                <li>• Enter a fabric number to auto-load available stock</li>
                <li>• Shipping to Store 2 automatically updates Store 2 inventory</li>
                <li>• Available stock is shown in real time as you type</li>
              </ul>
            </div>
          </div>

          {/* ── Product preview ── */}
          <div>
            {loading ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center min-h-[420px] gap-3">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-500">Loading product…</p>
              </div>
            ) : product?.style_id ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800">Product Preview</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Style #{existingStock?.styleNumbers?.[0]}
                    </p>
                  </div>
                  <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded-full font-medium">
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
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center min-h-[420px] gap-3 text-center px-6">
                <div className="bg-slate-100 p-5 rounded-2xl">
                  <svg
                    className="w-10 h-10 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-slate-600">Enter a fabric number</p>
                <p className="text-xs text-slate-400">Product preview will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
        toastClassName="text-sm"
      />
    </>
  );
};

export default Ship_Stock;
