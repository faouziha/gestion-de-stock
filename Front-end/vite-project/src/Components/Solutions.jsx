import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { 
    FaStore, 
    FaWarehouse, 
    FaIndustry, 
    FaShoppingBag, 
    FaUtensils, 
    FaHospital, 
    FaGraduationCap, 
    FaTools, 
    FaUsers, 
    FaCheckCircle 
} from 'react-icons/fa';

const Solutions = () => {
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
                            Inventory Solutions for Every Industry
                        </h1>
                        <p className={`text-lg max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-8`}>
                            Our inventory management system adapts to your specific industry needs, 
                            providing tailored solutions to optimize your operations.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Industry Solutions Section */}
            <section className={`${darkMode ? 'bg-gray-800' : 'bg-white'} py-16`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-8">
                    <motion.div 
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl font-bold mb-4">Industry-Specific Solutions</h2>
                        <p className={`max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Discover how our inventory management system can be customized for your industry's unique requirements.
                        </p>
                    </motion.div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <IndustrySolutionCardAnimated 
                            icon={<FaStore className="text-blue-500" size={28} />}
                            title="Retail"
                            description="Manage multi-channel inventory, track sales trends, and optimize stock levels across physical and online stores."
                            features={[
                                "Point of sale integration",
                                "Multi-location inventory tracking",
                                "Seasonal inventory planning",
                                "Customer purchase history"
                            ]}
                            darkMode={darkMode}
                            delay={0.1}
                        />
                        <IndustrySolutionCardAnimated 
                            icon={<FaWarehouse className="text-blue-500" size={28} />}
                            title="Wholesale & Distribution"
                            description="Streamline your distribution operations with bulk order management and efficient warehouse organization."
                            features={[
                                "Bulk order processing",
                                "Warehouse management",
                                "Supplier relationship tools",
                                "Volume-based pricing"
                            ]}
                            darkMode={darkMode}
                            delay={0.2}
                        />
                        <IndustrySolutionCardAnimated 
                            icon={<FaIndustry className="text-blue-500" size={28} />}
                            title="Manufacturing"
                            description="Track raw materials, manage production processes, and monitor finished goods inventory."
                            features={[
                                "Bill of materials management",
                                "Production scheduling",
                                "Quality control tracking",
                                "Raw material forecasting"
                            ]}
                            darkMode={darkMode}
                            delay={0.3}
                        />
                        <IndustrySolutionCardAnimated 
                            icon={<FaShoppingBag className="text-blue-500" size={28} />}
                            title="E-commerce"
                            description="Synchronize inventory across multiple online sales channels and automate order fulfillment."
                            features={[
                                "Multi-channel integration",
                                "Automated order processing",
                                "Return management",
                                "Shipping label generation"
                            ]}
                            darkMode={darkMode}
                            delay={0.4}
                        />
                        <IndustrySolutionCardAnimated 
                            icon={<FaUtensils className="text-blue-500" size={28} />}
                            title="Food & Beverage"
                            description="Manage perishable inventory with expiration date tracking and FIFO (First In, First Out) management."
                            features={[
                                "Expiration date tracking",
                                "FIFO inventory management",
                                "Recipe and ingredient tracking",
                                "Temperature monitoring integration"
                            ]}
                            darkMode={darkMode}
                            delay={0.5}
                        />
                        <IndustrySolutionCardAnimated 
                            icon={<FaHospital className="text-blue-500" size={28} />}
                            title="Healthcare"
                            description="Ensure compliance with regulatory requirements while managing medical supplies and equipment."
                            features={[
                                "Lot and batch tracking",
                                "Compliance documentation",
                                "Equipment maintenance scheduling",
                                "Controlled substance tracking"
                            ]}
                            darkMode={darkMode}
                            delay={0.6}
                        />
                    </div>
                </div>
            </section>

            {/* Business Size Solutions */}
            <section className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-16`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-8">
                    <motion.div 
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl font-bold mb-4">Solutions for Every Business Size</h2>
                        <p className={`max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Whether you're a small business or a large enterprise, our system scales to meet your needs.
                        </p>
                    </motion.div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <BusinessSizeCardAnimated 
                            icon={<FaStore className="text-blue-500" size={28} />}
                            title="Small Business"
                            description="Affordable inventory management with essential features to help small businesses grow efficiently."
                            darkMode={darkMode}
                            features={[
                                "Easy setup and onboarding",
                                "Basic inventory tracking",
                                "Simple reporting",
                                "Cost-effective pricing"
                            ]}
                            delay={0.1}
                        />
                        <BusinessSizeCardAnimated 
                            icon={<FaUsers className="text-blue-500" size={28} />}
                            title="Mid-Market"
                            description="Advanced features for growing businesses with multiple locations or sales channels."
                            darkMode={darkMode}
                            features={[
                                "Multi-location support",
                                "Advanced reporting",
                                "Integration capabilities",
                                "Team collaboration tools"
                            ]}
                            delay={0.3}
                        />
                        <BusinessSizeCardAnimated 
                            icon={<FaIndustry className="text-blue-500" size={28} />}
                            title="Enterprise"
                            description="Comprehensive solutions for large organizations with complex inventory needs."
                            darkMode={darkMode}
                            features={[
                                "Custom implementation",
                                "Advanced security features",
                                "API access",
                                "Dedicated support team"
                            ]}
                            delay={0.5}
                        />
                    </div>
                </div>
            </section>

            {/* Case Studies */}
            <section className={`${darkMode ? 'bg-gray-800' : 'bg-white'} py-16`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-8">
                    <motion.div 
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl font-bold mb-4">Success Stories</h2>
                        <p className={`max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            See how businesses like yours have transformed their operations with our inventory management system.
                        </p>
                    </motion.div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <CaseStudyCardAnimated
                            industry="Retail"
                            company="Fashion Boutique Chain"
                            result="45% reduction in stockouts"
                            quote="We've been able to optimize our inventory across 12 locations and significantly improve our customer satisfaction."
                            darkMode={darkMode}
                            delay={0.1}
                        />
                        <CaseStudyCardAnimated
                            industry="Manufacturing"
                            company="Furniture Manufacturer"
                            result="30% decrease in raw material costs"
                            quote="The ability to track materials through the production process has eliminated waste and improved our margins."
                            darkMode={darkMode}
                            delay={0.3}
                        />
                        <CaseStudyCardAnimated
                            industry="E-commerce"
                            company="Online Electronics Store"
                            result="60% faster order fulfillment"
                            quote="Integrating with our online platforms has streamlined our entire operation and allowed us to scale rapidly."
                            darkMode={darkMode}
                            delay={0.5}
                        />
                        <CaseStudyCardAnimated
                            industry="Food & Beverage"
                            company="Restaurant Supply Company"
                            result="90% reduction in expired inventory"
                            quote="The expiration date tracking feature alone has saved us thousands in wasted inventory."
                            darkMode={darkMode}
                            delay={0.7}
                        />
                    </div>
                </div>
            </section>

            {/* Implementation Process */}
            <section className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-16`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-8">
                    <motion.div 
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl font-bold mb-4">Implementation Process</h2>
                        <p className={`max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Our streamlined implementation process ensures a smooth transition to your new inventory management system.
                        </p>
                    </motion.div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <ProcessCardAnimated
                            number="1"
                            title="Consultation"
                            description="We analyze your business needs and recommend the right solution."
                            darkMode={darkMode}
                            delay={0.1}
                        />
                        <ProcessCardAnimated
                            number="2"
                            title="Setup"
                            description="Our team configures the system to match your specific requirements."
                            darkMode={darkMode}
                            delay={0.3}
                        />
                        <ProcessCardAnimated
                            number="3"
                            title="Training"
                            description="Comprehensive training for your team to ensure smooth adoption."
                            darkMode={darkMode}
                            delay={0.5}
                        />
                        <ProcessCardAnimated
                            number="4"
                            title="Support"
                            description="Ongoing support and optimization to maximize your ROI."
                            darkMode={darkMode}
                            delay={0.7}
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
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to find your solution?</h2>
                        <p className="text-xl text-blue-100 mb-8">
                            Contact us today to discuss how our inventory management system can be tailored to your industry.
                        </p>
                        <motion.div 
                            className="inline-block"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link 
                                to="/Contact" 
                                className="px-8 py-3 bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-lg transition-colors duration-300"
                            >
                                Contact Us
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

// Animated Industry Solution Card Component
const IndustrySolutionCardAnimated = ({ icon, title, description, features, darkMode, delay }) => {
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
            <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{description}</p>
            <ul className="space-y-2">
                {features.map((feature, index) => (
                    <motion.li 
                        key={index} 
                        className="flex items-start"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: delay + (index * 0.1) }}
                    >
                        <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{feature}</span>
                    </motion.li>
                ))}
            </ul>
        </motion.div>
    );
};

// Animated Business Size Card Component
const BusinessSizeCardAnimated = ({ icon, title, description, features, darkMode, delay }) => {
    return (
        <motion.div 
            className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow-lg transition-all duration-300`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ scale: 1.03 }}
        >
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{description}</p>
            <ul className="space-y-2">
                {features.map((feature, index) => (
                    <motion.li 
                        key={index} 
                        className="flex items-start"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: delay + (index * 0.1) }}
                    >
                        <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{feature}</span>
                    </motion.li>
                ))}
            </ul>
        </motion.div>
    );
};

// Animated Case Study Card Component
const CaseStudyCardAnimated = ({ industry, company, result, quote, darkMode, delay }) => {
    return (
        <motion.div 
            className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ scale: 1.02 }}
        >
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 ${darkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-800'}`}>
                {industry}
            </div>
            <h3 className="text-xl font-bold mb-2">{company}</h3>
            <div className={`text-lg font-bold mb-3 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{result}</div>
            <p className={`italic ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>"{quote}"</p>
        </motion.div>
    );
};

// Animated Process Card Component
const ProcessCardAnimated = ({ number, title, description, darkMode, delay }) => {
    return (
        <motion.div 
            className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg text-center`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
        >
            <motion.div 
                className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4"
                whileHover={{ scale: 1.1, rotate: 5 }}
            >
                {number}
            </motion.div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{description}</p>
        </motion.div>
    );
};

export default Solutions;
