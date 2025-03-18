import React from 'react';
import { Link } from 'react-router-dom';
import { FaChartLine, FaBoxOpen, FaShippingFast, FaUsersCog, FaChartBar, FaMobileAlt } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const Home = () => {
    const { darkMode } = useTheme();
    
    return (
        <div className={`${darkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800 text-white' : 'bg-gradient-to-b from-gray-100 to-white text-gray-900'} min-h-screen`}>
            {/* Hero Section */}
            <section className="px-4 sm:px-8 md:px-16 lg:px-24 py-16 md:py-24">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <motion.div 
                            className="md:w-1/2 mb-10 md:mb-0"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
                                Grow your business with our inventory management system
                            </h1>
                            <p className={`text-lg sm:text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-8`}>
                                Increase your sales and keep track of every unit with our powerful stock management, 
                                order fulfillment, and inventory control software.
                            </p>
                            <motion.div 
                                className="flex flex-col sm:flex-row gap-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4, duration: 0.6 }}
                            >
                                <Link 
                                    to="/Signup" 
                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors duration-300 text-center"
                                >
                                    Get Started
                                </Link>
                                <Link 
                                    to="/Contact" 
                                    className={`px-8 py-3 border ${darkMode ? 'border-white hover:bg-white hover:text-gray-900' : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'} font-bold rounded-lg transition-colors duration-300 text-center`}
                                >
                                    Contact Us
                                </Link>
                            </motion.div>
                        </motion.div>
                        <motion.div 
                            className="md:w-1/2"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="relative">
                                <motion.div 
                                    className="bg-blue-600 rounded-lg shadow-xl p-2 transform rotate-3"
                                    whileHover={{ rotate: 0, scale: 1.02 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg overflow-hidden`}>
                                        <img 
                                            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" 
                                            alt="Inventory Management Dashboard" 
                                            className="w-full h-auto"
                                        />
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} py-16`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-8">
                    <motion.div 
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
                        <p className={`max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Our inventory management system offers everything you need to streamline your operations
                            and boost your business growth.
                        </p>
                    </motion.div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCardAnimated 
                            icon={<FaChartLine className="text-blue-500" size={28} />}
                            title="Real-time Analytics"
                            description="Get instant insights into your inventory performance with detailed analytics and reports."
                            darkMode={darkMode}
                            delay={0.1}
                        />
                        <FeatureCardAnimated 
                            icon={<FaBoxOpen className="text-blue-500" size={28} />}
                            title="Stock Management"
                            description="Track stock levels, set reorder points, and manage multiple warehouses with ease."
                            darkMode={darkMode}
                            delay={0.2}
                        />
                        <FeatureCardAnimated 
                            icon={<FaShippingFast className="text-blue-500" size={28} />}
                            title="Order Fulfillment"
                            description="Streamline your order processing and fulfillment for faster delivery times."
                            darkMode={darkMode}
                            delay={0.3}
                        />
                        <FeatureCardAnimated 
                            icon={<FaUsersCog className="text-blue-500" size={28} />}
                            title="User Management"
                            description="Control access levels and permissions for different team members."
                            darkMode={darkMode}
                            delay={0.4}
                        />
                        <FeatureCardAnimated 
                            icon={<FaChartBar className="text-blue-500" size={28} />}
                            title="Sales Forecasting"
                            description="Predict future sales trends and optimize your inventory accordingly."
                            darkMode={darkMode}
                            delay={0.5}
                        />
                        <FeatureCardAnimated 
                            icon={<FaMobileAlt className="text-blue-500" size={28} />}
                            title="Mobile Access"
                            description="Manage your inventory on the go with our responsive mobile interface."
                            darkMode={darkMode}
                            delay={0.6}
                        />
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className={`${darkMode ? 'bg-gray-900' : 'bg-white'} py-16`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-8">
                    <motion.div 
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Clients Say</h2>
                        <p className={`max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Don't just take our word for it. Here's what businesses like yours have to say about our inventory management system.
                        </p>
                    </motion.div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <TestimonialCardAnimated 
                            quote="This system has completely transformed how we manage our warehouse. We've reduced stockouts by 75% and improved order accuracy."
                            author="Sarah Johnson"
                            company="Retail Solutions Inc."
                            darkMode={darkMode}
                            delay={0.1}
                        />
                        <TestimonialCardAnimated 
                            quote="The analytics features alone have saved us thousands by optimizing our inventory levels. Highly recommended!"
                            author="Michael Chen"
                            company="Global Distributors"
                            darkMode={darkMode}
                            delay={0.3}
                        />
                        <TestimonialCardAnimated 
                            quote="Easy to use, powerful features, and excellent customer support. Everything we needed in an inventory system."
                            author="Jessica Williams"
                            company="Modern Supplies Co."
                            darkMode={darkMode}
                            delay={0.5}
                        />
                    </div>
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
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to optimize your inventory?</h2>
                        <p className="text-xl text-blue-100 mb-8">
                            Join thousands of businesses that have transformed their operations with our system.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <motion.div
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
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link 
                                    to="/Demo" 
                                    className="px-8 py-3 border border-white text-white hover:bg-blue-700 font-bold rounded-lg transition-colors duration-300"
                                >
                                    Schedule a Demo
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className={`${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'} py-8`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-8 text-center">
                    <p> 2023 Inventory Management System. All rights reserved.</p>
                </div>
            </footer>
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

// Animated Testimonial Card Component
const TestimonialCardAnimated = ({ quote, author, company, darkMode, delay }) => {
    return (
        <motion.div 
            className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} shadow-lg`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ scale: 1.03 }}
        >
            <p className={`mb-4 italic ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>"{quote}"</p>
            <div>
                <p className="font-bold">{author}</p>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>{company}</p>
            </div>
        </motion.div>
    );
};

export default Home;
