import React, { useState } from 'react';
import AddStock from '../components/AddStock';
import Ship_Stock from './Ship_Stock';
import AddStockToExistingStock from '../components/AddStockToExistingStock';
import StockKeepingWithStyleNumber from './StockKeepingWithStyleNumber';
import AddStockWithStyleNumber from './AddStockWithStyleNumber';

const OPERATIONS = [
  {
    value: 'Add',
    label: 'Add Stock',
    description: 'Receive new fabric inventory',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    color: 'emerald',
  },
  {
    value: 'add_stock_with_style_number',
    label: 'Add Stock With Style Number',
    description: 'Add fabric stock by searching style number',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
        />
      </svg>
    ),
    color: 'teal',
  },

  {
    value: 'Ship',
    label: 'Ship Stock',
    description: 'Dispatch stock to production or other locations',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12"
        />
      </svg>
    ),
    color: 'blue',
  },
  {
    value: 'add_stock_qty',
    label: 'Stock Keeping',
    description: 'Update existing stock quantities',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
    color: 'violet',
  },
  {
    value: 'add_stock_qty_with_style_number',
    label: 'Stock Keeping With Style Number',
    description: 'Update existing stock quantities',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
    color: 'orange',
  },
];

const colorMap = {
  emerald: {
    card: 'border-emerald-200 bg-emerald-50',
    icon: 'bg-emerald-100 text-emerald-600',
    iconActive: 'bg-emerald-600 text-white',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    ring: 'ring-emerald-500',
    title: 'text-emerald-700',
  },
  teal: {
    card: 'border-teal-200 bg-teal-50',
    icon: 'bg-teal-100 text-teal-600',
    iconActive: 'bg-teal-600 text-white',
    badge: 'bg-teal-100 text-teal-700 border-teal-200',
    dot: 'bg-teal-500',
    ring: 'ring-teal-500',
    title: 'text-teal-700',
  },
  blue: {
    card: 'border-blue-200 bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    iconActive: 'bg-blue-600 text-white',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    ring: 'ring-blue-500',
    title: 'text-blue-700',
  },
  violet: {
    card: 'border-violet-200 bg-violet-50',
    icon: 'bg-violet-100 text-violet-600',
    iconActive: 'bg-violet-600 text-white',
    badge: 'bg-violet-100 text-violet-700 border-violet-200',
    dot: 'bg-violet-500',
    ring: 'ring-violet-500',
    title: 'text-violet-700',
  },
  orange: {
    card: 'border-orange-200 bg-orange-50',
    icon: 'bg-orange-100 text-orange-600',
    iconActive: 'bg-orange-600 text-white',
    badge: 'bg-orange-100 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
    ring: 'ring-orange-500',
    title: 'text-orange-700',
  },
};

const Add_Ship = () => {
  const [action, setAction] = useState('');

  const activeOp = OPERATIONS.find((op) => op.value === action);
  const colors = activeOp ? colorMap[activeOp.color] : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
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
            <h1 className="text-lg font-bold text-slate-800">Stock Management</h1>
            <p className="text-xs text-slate-500">Add new inventory or ship existing stock</p>
          </div>

          {/* Active badge */}
          {activeOp && (
            <div
              className={`ml-auto flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${colors.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
              {activeOp.label}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Operation selector */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Select Operation
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {OPERATIONS.map((op) => {
              const c = colorMap[op.color];
              const isActive = action === op.value;
              return (
                <button
                  key={op.value}
                  type="button"
                  onClick={() => setAction(op.value)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-150 cursor-pointer
                    ${
                      isActive
                        ? `${c.card} border-current ${c.ring} ring-2 ring-offset-1`
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                >
                  <div
                    className={`p-2.5 rounded-xl flex-shrink-0 transition-colors ${isActive ? c.iconActive : c.icon}`}
                  >
                    {op.icon}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold ${isActive ? c.title : 'text-slate-700'}`}>
                      {op.label}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{op.description}</p>
                  </div>
                  {isActive && (
                    <div
                      className={`ml-auto flex-shrink-0 w-4 h-4 rounded-full ${c.dot} flex items-center justify-center`}
                    >
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content area */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          {action === 'Add' ? (
            <AddStock />
          ) : action === 'Ship' ? (
            <Ship_Stock />
          ) : action === 'add_stock_qty' ? (
            <AddStockToExistingStock />
          ) : action === 'add_stock_qty_with_style_number' ? (
            <StockKeepingWithStyleNumber />
          ) : action === 'add_stock_with_style_number' ? (
            <AddStockWithStyleNumber />
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="bg-slate-100 p-6 rounded-2xl mb-5">
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
              <h3 className="text-base font-semibold text-slate-700 mb-1">No operation selected</h3>
              <p className="text-sm text-slate-400 max-w-xs">
                Choose an operation above to start managing your inventory.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Add_Ship;
