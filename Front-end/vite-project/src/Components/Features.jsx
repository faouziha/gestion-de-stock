import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
    FaChartLine, 
    FaBoxOpen, 
    FaShippingFast, 
    FaUsersCog, 
    FaChartBar, 
    FaMobileAlt, 
    FaBarcode, 
    FaExchangeAlt, 
    FaCloudDownloadAlt, 
    FaBell, 
    FaLock, 
    FaFileAlt 
} from 'react-icons/fa';

const Features = () => {
    const { darkMode } = useTheme();
    
    return (
        <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen pt-16`}>
            {/* Hero Section */}
            <section className="px-4 sm:px-8 md:px-16 lg:px-24 py-16 md:py-20">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                            Powerful Features for Inventory Management
                        </h1>
                        <p className={`text-lg max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-8`}>
                            Our comprehensive inventory management system provides all the tools you need to streamline operations, 
                            reduce costs, and grow your business.
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Features Section */}
            <section className={`${darkMode ? 'bg-gray-800' : 'bg-white'} py-16`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Core Features</h2>
                        <p className={`max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Designed to meet the needs of businesses of all sizes, our platform offers a comprehensive set of features.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon={<FaBoxOpen className="text-blue-500" size={28} />}
                            title="Inventory Tracking"
                            description="Track stock levels in real-time across multiple locations. Set low stock alerts and automate reordering processes."
                            darkMode={darkMode}
                        />
                        <FeatureCard 
                            icon={<FaBarcode className="text-blue-500" size={28} />}
                            title="Barcode Scanning"
                            description="Quickly scan products for faster inventory counts, receiving, and order fulfillment with mobile barcode scanning."
                            darkMode={darkMode}
                        />
                        <FeatureCard 
                            icon={<FaShippingFast className="text-blue-500" size={28} />}
                            title="Order Management"
                            description="Streamline your order processing from creation to fulfillment. Track order status and manage customer information."
                            darkMode={darkMode}
                        />
                        <FeatureCard 
                            icon={<FaChartLine className="text-blue-500" size={28} />}
                            title="Analytics & Reporting"
                            description="Gain insights with customizable reports on sales, inventory turnover, product performance, and more."
                            darkMode={darkMode}
                        />
                        <FeatureCard 
                            icon={<FaExchangeAlt className="text-blue-500" size={28} />}
                            title="Supplier Management"
                            description="Maintain supplier information, track purchase orders, and manage vendor relationships all in one place."
                            darkMode={darkMode}
                        />
                        <FeatureCard 
                            icon={<FaUsersCog className="text-blue-500" size={28} />}
                            title="User Permissions"
                            description="Control access with role-based permissions. Ensure team members only access what they need."
                            darkMode={darkMode}
                        />
                    </div>
                </div>
            </section>

            {/* Advanced Features Section */}
            <section className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-16`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Advanced Features</h2>
                        <p className={`max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Take your inventory management to the next level with our advanced capabilities.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon={<FaChartBar className="text-blue-500" size={28} />}
                            title="Forecasting"
                            description="Use historical data to predict future sales trends and optimize your inventory levels accordingly."
                            darkMode={darkMode}
                        />
                        <FeatureCard 
                            icon={<FaCloudDownloadAlt className="text-blue-500" size={28} />}
                            title="Cloud-Based Access"
                            description="Access your inventory data from anywhere, anytime with our secure cloud-based platform."
                            darkMode={darkMode}
                        />
                        <FeatureCard 
                            icon={<FaBell className="text-blue-500" size={28} />}
                            title="Automated Alerts"
                            description="Receive notifications for low stock, pending orders, price changes, and other important events."
                            darkMode={darkMode}
                        />
                        <FeatureCard 
                            icon={<FaMobileAlt className="text-blue-500" size={28} />}
                            title="Mobile Compatibility"
                            description="Manage your inventory on the go with our responsive mobile interface for smartphones and tablets."
                            darkMode={darkMode}
                        />
                        <FeatureCard 
                            icon={<FaLock className="text-blue-500" size={28} />}
                            title="Security Features"
                            description="Keep your data safe with advanced security measures including encryption, regular backups, and access controls."
                            darkMode={darkMode}
                        />
                        <FeatureCard 
                            icon={<FaFileAlt className="text-blue-500" size={28} />}
                            title="Custom Reports"
                            description="Create and schedule custom reports tailored to your specific business needs and KPIs."
                            darkMode={darkMode}
                        />
                    </div>
                </div>
            </section>

            {/* Comparison Table */}
            <section className={`${darkMode ? 'bg-gray-800' : 'bg-white'} py-16`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Feature Comparison</h2>
                        <p className={`max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            See how our different plans compare to find the right fit for your business.
                        </p>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className={`w-full border-collapse ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <thead>
                                <tr className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    <th className="p-4 text-left">Feature</th>
                                    <th className="p-4 text-center">Basic</th>
                                    <th className="p-4 text-center">Professional</th>
                                    <th className="p-4 text-center">Enterprise</th>
                                </tr>
                            </thead>
                            <tbody>
                                <TableRow 
                                    feature="Inventory Tracking" 
                                    basic={true} 
                                    pro={true} 
                                    enterprise={true} 
                                    darkMode={darkMode} 
                                />
                                <TableRow 
                                    feature="Order Management" 
                                    basic={true} 
                                    pro={true} 
                                    enterprise={true} 
                                    darkMode={darkMode} 
                                />
                                <TableRow 
                                    feature="Barcode Scanning" 
                                    basic={true} 
                                    pro={true} 
                                    enterprise={true} 
                                    darkMode={darkMode} 
                                />
                                <TableRow 
                                    feature="Supplier Management" 
                                    basic={true} 
                                    pro={true} 
                                    enterprise={true} 
                                    darkMode={darkMode} 
                                />
                                <TableRow 
                                    feature="Basic Reports" 
                                    basic={true} 
                                    pro={true} 
                                    enterprise={true} 
                                    darkMode={darkMode} 
                                />
                                <TableRow 
                                    feature="Advanced Analytics" 
                                    basic={false} 
                                    pro={true} 
                                    enterprise={true} 
                                    darkMode={darkMode} 
                                />
                                <TableRow 
                                    feature="Forecasting" 
                                    basic={false} 
                                    pro={true} 
                                    enterprise={true} 
                                    darkMode={darkMode} 
                                />
                                <TableRow 
                                    feature="Custom Reports" 
                                    basic={false} 
                                    pro={false} 
                                    enterprise={true} 
                                    darkMode={darkMode} 
                                />
                                <TableRow 
                                    feature="API Access" 
                                    basic={false} 
                                    pro={false} 
                                    enterprise={true} 
                                    darkMode={darkMode} 
                                />
                                <TableRow 
                                    feature="Priority Support" 
                                    basic={false} 
                                    pro={false} 
                                    enterprise={true} 
                                    darkMode={darkMode} 
                                />
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="text-center mt-8">
                        <Link 
                            to="/pricing" 
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors duration-300 inline-block"
                        >
                            View Pricing Plans
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-blue-600 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">Ready to transform your inventory management?</h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join thousands of businesses that have optimized their operations with our system.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link 
                            to="/signup" 
                            className="px-8 py-3 bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-lg transition-colors duration-300"
                        >
                            Start Free Trial
                        </Link>
                        <Link 
                            to="/contact" 
                            className="px-8 py-3 border border-white text-white hover:bg-blue-700 font-bold rounded-lg transition-colors duration-300"
                        >
                            Contact Sales
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description, darkMode }) => {
    return (
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} shadow-lg transition-all duration-300 h-full`}>
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{description}</p>
        </div>
    );
};

// Table Row Component
const TableRow = ({ feature, basic, pro, enterprise, darkMode }) => {
    return (
        <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <td className="p-4">{feature}</td>
            <td className="p-4 text-center">
                {basic ? (
                    <span className="text-green-500">✓</span>
                ) : (
                    <span className="text-red-500">✕</span>
                )}
            </td>
            <td className="p-4 text-center">
                {pro ? (
                    <span className="text-green-500">✓</span>
                ) : (
                    <span className="text-red-500">✕</span>
                )}
            </td>
            <td className="p-4 text-center">
                {enterprise ? (
                    <span className="text-green-500">✓</span>
                ) : (
                    <span className="text-red-500">✕</span>
                )}
            </td>
        </tr>
    );
};

export default Features;
