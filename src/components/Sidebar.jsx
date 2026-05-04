import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  FaBoxOpen,
  FaShippingFast,
  FaUpload,
  FaThList,
  FaWarehouse,
  FaExclamationTriangle,
  FaCubes,
  FaSignOutAlt,
  FaUser,
  FaBalanceScale,
  FaExchangeAlt,
  FaLayerGroup,
  FaChartLine,
  FaHistory,
  FaFileAlt,
  FaLink,
  FaTags,
  FaCalculator,
  FaDatabase,
  FaClipboardList,
  FaBell,
  FaBook,
  FaChevronDown,
  FaChevronRight,
  FaList,
} from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const Sidebar = ({ isAuthenticated, user, setUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const BASE_URL = 'https://raw-material-backend.onrender.com';

  // State to track which categories are expanded
  const [expandedCategories, setExpandedCategories] = useState({});

  // Initialize all categories as expanded on first render
  useEffect(() => {
    const initialExpandedState = {};
    if (user?.role === 'admin') {
      [
        'Dashboard',
        'Management',
        'Relations',
        'Transactions',
        'Bulk Operations',
        'Monitoring',
        'Resources',
      ].forEach((category) => {
        initialExpandedState[category] = true;
      });
    } else if (user?.role === 'super-admin') {
      [
        'Dashboard',
        'Management',
        'Relations',
        'Transactions',
        'Bulk Operations',
        'Monitoring',
        'Resources',
      ].forEach((category) => {
        initialExpandedState[category] = true;
      });
    } else {
      ['Dashboard', 'Management', 'Relations', 'Monitoring', 'Resources'].forEach((category) => {
        initialExpandedState[category] = true;
      });
    }
    setExpandedCategories(initialExpandedState);
  }, [user?.role]);

  if (!isAuthenticated) return null;

  // Define all links with appropriate icons
  const baseLinks = [
    { name: 'Store1', icon: <FaWarehouse />, path: '/', category: 'Dashboard' },
    { name: 'Store2', icon: <FaWarehouse />, path: '/stock2', category: 'Dashboard' },
    { name: 'Accessory Stock', icon: <FaTags />, path: '/accessory-stock', category: 'Dashboard' },
    {
      name: 'Style Management',
      icon: <FaLayerGroup />,
      path: '/style-number',
      category: 'Management',
    },
    { name: 'Fabric Relations', icon: <FaLink />, path: '/meter-and-kg', category: 'Relations' },
    { name: 'Low Stock Alert', icon: <FaBell />, path: '/low-stock', category: 'Monitoring' },
    // { name: 'Documentation', icon: <FaBook />, path: 'https://github.com/sachin-dev-at-qurvii/docs/blob/main/doc.md', category: 'Resources', external: true },
    {
      name: 'Documentation',
      icon: <FaBook />,
      path: '/docs',
      category: 'Resources',
      external: true,
    },
  ];

  const adminLinks = [
    { name: 'Store1', icon: <FaWarehouse />, path: '/', category: 'Dashboard' },
    { name: 'Store2', icon: <FaWarehouse />, path: '/stock2', category: 'Dashboard' },
    { name: 'Accessory Stock', icon: <FaTags />, path: '/accessory-stock', category: 'Dashboard' },
    {
      name: 'Latest Purchase',
      icon: <FaHistory />,
      path: '/latest-purchase',
      category: 'Dashboard',
    },
    {
      name: 'Fabric Averages',
      icon: <FaCalculator />,
      path: '/fabric-average',
      category: 'Dashboard',
    },
    {
      name: 'Style Management',
      icon: <FaLayerGroup />,
      path: '/style-number',
      category: 'Management',
    },
    { name: 'Fabric Relations', icon: <FaLink />, path: '/meter-and-kg', category: 'Relations' },
    {
      name: 'Add/Ship Fabric',
      icon: <FaShippingFast />,
      path: '/add-ship',
      category: 'Transactions',
    },
    {
      name: 'Accessory Update',
      icon: <FaBoxOpen />,
      path: '/accessory-update',
      category: 'Transactions',
    },
    {
      name: 'Upload Stock',
      icon: <FaDatabase />,
      path: '/upload-stock',
      category: 'Bulk Operations',
    },
    {
      name: 'Upload Averages',
      icon: <FaUpload />,
      path: '/upload-fabric-average',
      category: 'Bulk Operations',
    },
    {
      name: 'Upload Fabric',
      icon: <FaUpload />,
      path: '/upload-fabric',
      category: 'Bulk Operations',
    },
    {
      name: 'Upload Relations',
      icon: <FaUpload />,
      path: '/upload-mtr-kg',
      category: 'Bulk Operations',
    },
    {
      name: 'Upload Accessory',
      icon: <FaUpload />,
      path: '/accessory-upload',
      category: 'Bulk Operations',
    },
    { name: 'Low Stock Alert', icon: <FaBell />, path: '/low-stock', category: 'Monitoring' },
    {
      name: 'Production_Report',
      icon: <FaList />,
      path: '/production_report',
      category: 'Monitoring',
    },
    // { name: 'Documentation', icon: <FaBook />, path: 'https://github.com/sachin-dev-at-qurvii/docs/blob/main/doc.md', category: 'Resources', external: true },
    {
      name: 'Documentation',
      icon: <FaBook />,
      path: '/docs',
      category: 'Resources',
      external: true,
    },
  ];

  const superAdminLinks = [
    { name: 'Store1', icon: <FaWarehouse />, path: '/', category: 'Dashboard' },
    { name: 'Store2', icon: <FaWarehouse />, path: '/stock2', category: 'Dashboard' },
    { name: 'Accessory Stock', icon: <FaTags />, path: '/accessory-stock', category: 'Dashboard' },
    {
      name: 'Latest Purchase',
      icon: <FaHistory />,
      path: '/latest-purchase',
      category: 'Dashboard',
    },
    {
      name: 'Fabric Averages',
      icon: <FaCalculator />,
      path: '/fabric-average',
      category: 'Dashboard',
    },
    {
      name: 'Style Management',
      icon: <FaLayerGroup />,
      path: '/style-number',
      category: 'Management',
    },
    { name: 'Fabric Relations', icon: <FaLink />, path: '/meter-and-kg', category: 'Relations' },
    {
      name: 'Add/Ship Fabric',
      icon: <FaShippingFast />,
      path: '/add-ship',
      category: 'Transactions',
    },
    {
      name: 'Accessory Update',
      icon: <FaBoxOpen />,
      path: '/accessory-update',
      category: 'Transactions',
    },
    {
      name: 'Upload Stock',
      icon: <FaDatabase />,
      path: '/upload-stock',
      category: 'Bulk Operations',
    },
    {
      name: 'Upload Averages',
      icon: <FaUpload />,
      path: '/upload-fabric-average',
      category: 'Bulk Operations',
    },
    {
      name: 'Upload Fabric',
      icon: <FaUpload />,
      path: '/upload-fabric',
      category: 'Bulk Operations',
    },
    {
      name: 'Upload Relations',
      icon: <FaUpload />,
      path: '/upload-mtr-kg',
      category: 'Bulk Operations',
    },
    {
      name: 'Upload Accessory',
      icon: <FaUpload />,
      path: '/accessory-upload',
      category: 'Bulk Operations',
    },
    { name: 'Low Stock Alert', icon: <FaBell />, path: '/low-stock', category: 'Monitoring' },
    {
      name: 'Production_Report',
      icon: <FaList />,
      path: '/production_report',
      category: 'Monitoring',
    },
    // { name: 'Documentation', icon: <FaBook />, path: 'https://github.com/sachin-dev-at-qurvii/docs/blob/main/doc.md', category: 'Resources', external: true },
    {
      name: 'Documentation',
      icon: <FaBook />,
      path: '/docs',
      category: 'Resources',
      external: true,
    },
  ];

  // Determine which links to show based on role
  const roleBasedLinks =
    user?.role === 'admin'
      ? adminLinks
      : user?.role === 'super-admin'
        ? superAdminLinks
        : baseLinks;

  // Group links by category
  const groupedLinks = roleBasedLinks.reduce((acc, link) => {
    if (!acc[link.category]) acc[link.category] = [];
    acc[link.category].push(link);
    return acc;
  }, {});

  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Collapse all categories
  const collapseAll = () => {
    const collapsedState = {};
    Object.keys(groupedLinks).forEach((category) => {
      collapsedState[category] = false;
    });
    setExpandedCategories(collapsedState);
  };

  // Expand all categories
  const expandAll = () => {
    const expandedState = {};
    Object.keys(groupedLinks).forEach((category) => {
      expandedState[category] = true;
    });
    setExpandedCategories(expandedState);
  };

  useEffect(() => {
    collapseAll();
  }, []);

  return (
    <div className="w-64 h-screen fixed bg-gradient-to-b from-gray-950 to-gray-900 text-white shadow-2xl flex flex-col border-r border-gray-800 z-50">
      {/* Header */}
      <div className="px-6 py-6 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <FaWarehouse className="text-2xl text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">FabricPro</h2>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                  <FaUser className="text-sm text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
              </div>
              <div>
                <p className="font-medium text-white truncate">{user?.username || 'User'}</p>
                <p className="text-gray-400 text-xs truncate">
                  {user?.emailid || 'user@example.com'}
                </p>
                <p className="text-green-500 mt-1 font-bold text-xs truncate">
                  {user?.role || 'User'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Expand/Collapse Controls */}
        <div className="flex gap-2 mb-2">
          <button
            onClick={expandAll}
            className="flex-1 px-3 py-2 text-xs bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-gray-300"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="flex-1 px-3 py-2 text-xs bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-gray-300"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-1">
        {Object.entries(groupedLinks).map(([category, categoryLinks]) => (
          <div key={category} className="mb-2">
            {/* Category Header - Clickable Toggle */}
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-800/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="text-gray-500 group-hover:text-blue-400 transition-colors">
                  {expandedCategories[category] ? <FaChevronDown /> : <FaChevronRight />}
                </div>
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  {category}
                </h3>
              </div>
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                {categoryLinks.length}
              </span>
            </button>

            {/* Category Links - Animated Collapse/Expand */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedCategories[category] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="ml-8 space-y-1 py-2">
                {categoryLinks.map((link) => {
                  if (link.external) {
                    return (
                      <a
                        key={link.name}
                        href={link.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gray-800 hover:text-white text-gray-400"
                      >
                        <div className="text-lg text-gray-500 group-hover:text-blue-400 transition-colors">
                          {link.icon}
                        </div>
                        <span className="font-medium flex-1 text-sm">{link.name}</span>
                        <span className="text-xs text-gray-500">↗</span>
                      </a>
                    );
                  }

                  return (
                    <NavLink
                      key={link.name}
                      to={link.path}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border-l-4 border-blue-500 shadow-lg'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`
                      }
                    >
                      <div
                        className={`text-lg transition-colors ${
                          location.pathname === link.path
                            ? 'text-blue-400'
                            : 'text-gray-500 group-hover:text-blue-400'
                        }`}
                      >
                        {link.icon}
                      </div>
                      <span className="font-medium flex-1 text-sm">{link.name}</span>
                      {location.pathname === link.path && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </nav>
      <div className="px-6 py-6 border-t border-gray-800 bg-gray-900/50">
        <p className="text-gray-600 text-xs text-center mt-4 pt-4 ">
          © {new Date().getFullYear()} FabricPro Inventory System
        </p>
      </div>

      {/* Custom Scrollbar */}
      <style jsx="false">{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }

        /* Smooth transitions */
        .transition-max-height {
          transition: max-height 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
