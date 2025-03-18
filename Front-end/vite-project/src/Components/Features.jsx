import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
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
                    <motion.div 
                        className="text-center"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                            Powerful Features for Inventory Management
                        </h1>
                        <p className={`text-lg max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-8`}>
                            Our comprehensive inventory management system provides all the tools you need to streamline operations, 
                            reduce costs, and grow your business.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Main Features Section */}
            <section className={`${darkMode ? 'bg-gray-800' : 'bg-white'} py-16`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-8">
                    <motion.div 
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl font-bold mb-4">Core Features</h2>
                        <p className={`max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Designed to meet the needs of businesses of all sizes, our platform offers a comprehensive set of features.
                        </p>
                    </motion.div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCardAnimated 
                            icon={<FaBoxOpen className="text-blue-500" size={28} />}
                            title="Inventory Tracking"
                            description="Track stock levels in real-time across multiple locations. Set low stock alerts and automate reordering processes."
                            darkMode={darkMode}
                            delay={0.1}
                        />
                        <FeatureCardAnimated 
                            icon={<FaBarcode className="text-blue-500" size={28} />}
                            title="Barcode Scanning"
                            description="Quickly scan products for faster inventory counts, receiving, and order fulfillment with mobile barcode scanning."
                            darkMode={darkMode}
                            delay={0.2}
                        />
                        <FeatureCardAnimated 
                            icon={<FaShippingFast className="text-blue-500" size={28} />}
                            title="Order Management"
                            description="Streamline your order processing from creation to fulfillment. Track order status and manage customer information."
                            darkMode={darkMode}
                            delay={0.3}
                        />
                        <FeatureCardAnimated 
                            icon={<FaChartLine className="text-blue-500" size={28} />}
                            title="Analytics & Reporting"
                            description="Gain insights with customizable reports on sales, inventory turnover, product performance, and more."
                            darkMode={darkMode}
                            delay={0.4}
                        />
                        <FeatureCardAnimated 
                            icon={<FaExchangeAlt className="text-blue-500" size={28} />}
                            title="Supplier Management"
                            description="Maintain supplier information, track purchase orders, and manage vendor relationships all in one place."
                            darkMode={darkMode}
                            delay={0.5}
                        />
                        <FeatureCardAnimated 
                            icon={<FaUsersCog className="text-blue-500" size={28} />}
                            title="User Permissions"
                            description="Control access with role-based permissions. Ensure team members only access what they need."
                            darkMode={darkMode}
                            delay={0.6}
                        />
                    </div>
                </div>
            </section>

            {/* Advanced Features Section */}
            <section className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-16`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-8">
                    <motion.div 
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl font-bold mb-4">Advanced Features</h2>
                        <p className={`max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Take your inventory management to the next level with our advanced capabilities.
                        </p>
                    </motion.div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCardAnimated 
                            icon={<FaChartBar className="text-blue-500" size={28} />}
                            title="Forecasting"
                            description="Use historical data to predict future sales trends and optimize your inventory levels accordingly."
                            darkMode={darkMode}
                            delay={0.1}
                        />
                        <FeatureCardAnimated 
                            icon={<FaCloudDownloadAlt className="text-blue-500" size={28} />}
                            title="Cloud-Based Access"
                            description="Access your inventory data from anywhere, anytime with our secure cloud-based platform."
                            darkMode={darkMode}
                            delay={0.2}
                        />
                        <FeatureCardAnimated 
                            icon={<FaBell className="text-blue-500" size={28} />}
                            title="Automated Alerts"
                            description="Receive notifications for low stock, pending orders, price changes, and other important events."
                            darkMode={darkMode}
                            delay={0.3}
                        />
                        <FeatureCardAnimated 
                            icon={<FaMobileAlt className="text-blue-500" size={28} />}
                            title="Mobile Compatibility"
                            description="Manage your inventory on the go with our responsive mobile interface for smartphones and tablets."
                            darkMode={darkMode}
                            delay={0.4}
                        />
                        <FeatureCardAnimated 
                            icon={<FaLock className="text-blue-500" size={28} />}
                            title="Security Features"
                            description="Keep your data safe with advanced security measures including encryption, regular backups, and access controls."
                            darkMode={darkMode}
                            delay={0.5}
                        />
                        <FeatureCardAnimated 
                            icon={<FaFileAlt className="text-blue-500" size={28} />}
                            title="Custom Reports"
                            description="Create and schedule custom reports tailored to your specific business needs and KPIs."
                            darkMode={darkMode}
                            delay={0.6}
                        />
                    </div>
                </div>
            </section>

            {/* Comparison Table */}
            <section className={`${darkMode ? 'bg-gray-800' : 'bg-white'} py-16`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-8">
                    <motion.div 
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl font-bold mb-4">Feature Comparison</h2>
                        <p className={`max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            See how our different plans compare to find the right fit for your business.
                        </p>
                    </motion.div>
                    
                    <motion.div 
                        className="overflow-x-auto"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
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
                                <TableRowAnimated 
                                    feature="Inventory Tracking" 
                                    basic={true} 
                                    pro={true} 
                                    enterprise={true} 
                                    darkMode={darkMode} 
                                    delay={0.1}
                                />
                                <TableRowAnimated 
                                    feature="Order Management" 
                                    basic={true} 
                                    pro={true} 
                                    enterprise={true} 
                                    darkMode={darkMode} 
                                    delay={0.2}
                                />
                                <TableRowAnimated 
                                    feature="Barcode Scanning" 
                                    basic={true} 
                                    pro={true} 
                                    enterprise={true} 
                                    darkMode={darkMode} 
                                    delay={0.3}
                                />
                                <TableRowAnimated 
                                    feature="Multi-Location Support" 
                                    basic={false} 
                                    pro={true} 
                                    enterprise={true} 
                                    darkMode={darkMode} 
                                    delay={0.4}
                                />
                                <TableRowAnimated 
                                    feature="Advanced Analytics" 
                                    basic={false} 
                                    pro={true} 
                                    enterprise={true} 
                                    darkMode={darkMode} 
                                    delay={0.5}
                                />
                                <TableRowAnimated 
                                    feature="API Access" 
                                    basic={false} 
                                    pro={false} 
                                    enterprise={true} 
                                    darkMode={darkMode} 
                                    delay={0.6}
                                />
                                <TableRowAnimated 
                                    feature="Custom Integrations" 
                                    basic={false} 
                                    pro={false} 
                                    enterprise={true} 
                                    darkMode={darkMode} 
                                    delay={0.7}
                                />
                            </tbody>
                        </table>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-blue-600 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to explore our features?</h2>
                        <p className="text-xl text-blue-100 mb-8">
                            Start your free trial today and discover how our features can transform your business.
                        </p>
                        <motion.div 
                            className="inline-block"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link 
                                to="/Signup" 
                                className="px-8 py-3 bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-lg transition-colors duration-300"
                            >
                                Start Free Trial
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

// Animated Feature Card Component
const FeatureCardAnimated = ({ icon, title, description, darkMode, delay }) => {
    return (
        <motion.div 
            className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} shadow-lg transition-all duration-300`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ y: -5 }}
        >
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{description}</p>
        </motion.div>
    );
};

// Animated Table Row Component
const TableRowAnimated = ({ feature, basic, pro, enterprise, darkMode, delay }) => {
    return (
        <motion.tr 
            className={`${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay }}
        >
            <td className="p-4">{feature}</td>
            <td className="p-4 text-center">
                {basic ? 
                    <span className="text-green-500">✓</span> : 
                    <span className="text-red-500">✗</span>
                }
            </td>
            <td className="p-4 text-center">
                {pro ? 
                    <span className="text-green-500">✓</span> : 
                    <span className="text-red-500">✗</span>
                }
            </td>
            <td className="p-4 text-center">
                {enterprise ? 
                    <span className="text-green-500">✓</span> : 
                    <span className="text-red-500">✗</span>
                }
            </td>
        </motion.tr>
    );
};

export default Features;
