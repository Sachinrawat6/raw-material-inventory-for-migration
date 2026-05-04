import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../components/context/StockContextProvider';
import axios from 'axios';

const Ship_Stock = () => {
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState({});
  const [formData, setFormData] = useState({
    fabricNumber: '',
    ship_quantity: '',
    destination: '',
    current_destination: '',
  });

  const BASE_URL = 'https://raw-material-backend.onrender.com';
  // const BASE_URL = "http://localhost:5000"

  // _________________________________________________ input handle change  ________________________________________________________

  const { stock, fetchStock } = useGlobalContext();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // _________________________________________________end of input handle change  ________________________________________________________

  // _________________________________________________ start stock2 updating code   ________________________________________________________

  const updateStock2Inventory = async () => {
    const { fabricNumber } = formData;
    const matchedStyleNumbersAndFabricName = stock.find(
      (fab) => Number(fab.fabricNumber) === Number(fabricNumber)
    );
    try {
      const payload = {
        fabricNumber: matchedStyleNumbersAndFabricName?.fabricNumber || '',
        fabricName: matchedStyleNumbersAndFabricName?.fabricName || '',
        fabric_source: formData.current_destination,
        availableStock: Number(formData.ship_quantity),
        styleNumbers: matchedStyleNumbersAndFabricName.styleNumbers || [],
      };
      const response = await axios.post(`${BASE_URL}/api/v1/stock2/bulk`, { stocks: [payload] });
      console.log('payload ', payload);
      console.log('Stock2 updated', response);
      setFormData({ fabricNumber: '', fabricName: '', current_destination: '', destination: '' });
    } catch (error) {
      console.log(`Failed to update stock2 stock inventory error is :: ${error}`);
    }
  };

  console.log('stock', stock);
  // _________________________________________________ start Style id fetching for product image ________________________________________________________

  const handleFetchProduct = async () => {
    setLoading(true);
    try {
      const existingStock = stock.find(
        (item) => Number(item.fabricNumber) === Number(formData.fabricNumber)
      );
      if (!existingStock) return;
      console.log(existingStock);
      const response = await fetch(
        `https://inventorybackend-m1z8.onrender.com/api/product?style_code=${existingStock?.styleNumbers[0]}`
      );
      const data = await response.json();
      setProduct(data[0]);
    } catch (error) {
      console.log('Failed to fetch product details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchProduct();
  }, [formData.fabricNumber]);

  // _________________________________________________ end of style id fetching for product image _____________________________________________________

  // _________________________________________________ start stock updating ________________________________________________________

  let localStock = stock.map((s) => ({ ...s }));
  const handleStockUpdate = async (e) => {
    e.preventDefault();
    const existingStock = localStock.find(
      (item) => Number(item.fabricNumber) === Number(formData.fabricNumber)
    );

    if (!existingStock) {
      alert(`Stock not found for ${formData.fabricNumber}`);
      setFormData({ fabricNumber: '', ship_quantity: '', destination: '' });
      return;
    }
    const newStock = Math.max(
      0,
      Number(existingStock.availableStock || 0) - Number(formData.ship_quantity)
    );

    try {
      await axios.put(`${BASE_URL}/api/v1/stock/${existingStock._id}`, {
        availableStock: newStock,
      });

      // __________________________ add stock in store2 if destination is store2 ______________________________________
      if (
        !formData.destination === 'store2' ||
        !(Number(existingStock?.availableStock) >= Number(formData.ship_quantity))
      ) {
        alert('Stock is not sufficient for ship');
        return;
      } else {
        await updateStock2Inventory();
      }
      alert(`Stock Shipped from ${formData.fabricNumber}`);
      fetchStock();
      setFormData({
        fabricNumber: '',
        ship_quantity: '',
        destination: '',
        current_destination: '',
      });

      console.log(
        `Updated fabric ${formData.fabricNumber}: ${existingStock.availableStock} - ${formData.ship_quantity} = ${newStock}`
      );

      // Update local stock for next iteration
      existingStock.availableStock = newStock;
    } catch (error) {
      console.error(`Failed to update stock for fabric ${formData.fabricNumber}`, error);
    }
  };

  // _________________________________________________end of  stock updating ________________________________________________________
  const { fabricNumber, ship_quantity, current_destination, destination } = formData;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Left Column - Form */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h1 className="text-2xl font-bold text-gray-900">Stock Shipping</h1>
                <p className="text-sm text-gray-600 mt-1">Transfer inventory between locations</p>
              </div>

              <form onSubmit={handleStockUpdate} className="space-y-5">
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="fabricNumber"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Fabric Number
                    </label>
                    <input
                      type="number"
                      id="fabricNumber"
                      name="fabricNumber"
                      placeholder="Enter fabric number..."
                      value={fabricNumber}
                      required
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="ship_quantity"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Ship Quantity (METER)
                    </label>
                    <input
                      type="number"
                      id="ship_quantity"
                      name="ship_quantity"
                      placeholder="Enter ship quantity..."
                      value={ship_quantity}
                      required
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="current_destination"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Current Location
                      </label>
                      <select
                        id="current_destination"
                        onChange={handleChange}
                        required
                        value={current_destination}
                        name="current_destination"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      >
                        <option value="">Select Current Location</option>
                        <option value="store1">Store 1</option>
                        <option value="vendor">Vendor</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="destination"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Destination
                      </label>
                      <select
                        id="destination"
                        required
                        onChange={handleChange}
                        value={destination}
                        name="destination"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      >
                        <option value="">Select Destination</option>
                        <option value="store2">Store 2</option>
                        <option value="production">Production</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Ship Stock
                </button>
              </form>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-800 mb-1">Quick Tips</h3>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Enter valid fabric number to load product details</li>
                  <li>• Ensure sufficient stock before shipping</li>
                  <li>• Double-check destination locations</li>
                </ul>
              </div>
            </div>

            {/* Right Column - Product Preview */}
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-900">Product Preview</h2>
                <p className="text-sm text-gray-600 mt-1">Product details will appear here</p>
              </div>

              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 min-h-[500px] flex items-center justify-center">
                {loading ? (
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-center text-sm text-gray-600 font-medium">
                      Loading product details...
                    </p>
                  </div>
                ) : product?.style_id ? (
                  <div className="w-full h-full rounded-lg  shadow-md overflow-hidden">
                    <iframe
                      className="w-full h-[600px] rounded-lg -mt-40"
                      src={`https://www.myntra.com/dresses/qurvii/qurvii-flared-sleeves-sequinned-georgette-a-line-midi-dress/${product?.style_id}/buy`}
                      frameBorder="0"
                      title="Product Preview"
                    />
                  </div>
                ) : (
                  <div className="text-center text-gray-500 space-y-3">
                    <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-400"
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
                    <p className="font-medium text-gray-600">
                      Enter a fabric number to view product details
                    </p>
                    <p className="text-sm text-gray-500">Product preview will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ship_Stock;
