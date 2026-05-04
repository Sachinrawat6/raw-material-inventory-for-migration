import React, { useState } from 'react'
import AddStock from '../components/AddStock';
import ShipStock from '../components/ShipStock';
import Ship_Stock from './Ship_Stock';
import AddStockToExistingStock from '../components/AddStockToExistingStock';

const Add_Ship = () => {
    const [action, setAction] = useState("");

    return (
        <div className='container mx-auto px-4 py-4 '>
            {/* Header Section */}
            <div className='mb-8'>
                <h1 className='text-2xl font-semibold text-gray-800 mb-2'>Stock Management</h1>
                <p className='text-gray-600'>Add new inventory or ship existing stock to customers</p>
            </div>

            {/* Operation Selection Card */}
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8'>
                <div className='mb-4'>
                    <label htmlFor='operation-select' className='block text-sm font-medium text-gray-700 mb-2'>
                        Select Operation Type
                    </label>
                    <select
                        id='operation-select'
                        className='w-full max-w-xs border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer hover:border-gray-400'
                        onChange={(e) => setAction(e.target.value)}
                        value={action}
                    >
                        <option value="">Choose an operation</option>
                        <option value="Add">Add Stock</option>
                        <option value="Ship">Ship Stock</option>
                        <option value="add_stock_qty">Stock keeping</option>
                    </select>
                </div>

                {/* Visual Indicator */}
                {action && (
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${action === "Add"
                        ? 'bg-green-100 text-green-800'
                        : action === "Ship" ? 'bg-blue-100 text-blue-800' : 'bg-yellow-500 text-white'
                        }`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${action === "Add" ? 'bg-green-500' : action === "Ship" ? 'bg-blue-500' : "bg-white"
                            }`}></span>
                        {action === "Add" ? 'Adding Stock' : action === "Ship" ? 'Shipping Stock' : "Updating Stock"}
                    </div>
                )}
            </div>

            {/* Dynamic Content Section */}
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
                {action === "Add" ? (
                    <AddStock />
                ) : action === "Ship" ? (
                    <Ship_Stock />
                ) : action === "add_stock_qty" ? (<AddStockToExistingStock />

                ) : (
                    // Empty State
                    <div className='text-center py-12'>
                        <div className='mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
                            <svg className='w-8 h-8 text-gray-400' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h3 className='text-lg font-medium text-gray-900 mb-2'>No Operation Selected</h3>
                        <p className='text-gray-500 max-w-md mx-auto'>
                            Please select an operation type above to start managing your inventory.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Add_Ship