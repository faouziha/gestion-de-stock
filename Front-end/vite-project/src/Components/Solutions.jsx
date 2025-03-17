import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
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
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                            Inventory Solutions for Every Industry
                        </h1>
                        <p className={`text-lg max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-8`}>
                            Our inventory management system adapts to your specific industry needs, 
                            providing tailored solutions to optimize your operations.
                        </p>
                    </div>
                </div>
            </section>

            {/* Industry Solutions Section */}
            <section className={`${darkMode ? 'bg-gray-800' : 'bg-white'} py-16`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Industry-Specific Solutions</h2>
                        <p className={`max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Discover how our inventory management system can be customized for your industry's unique requirements.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <IndustrySolutionCard 
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
                        />
                        <IndustrySolutionCard 
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
                        />
                        <IndustrySolutionCard 
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
                        />
                        <IndustrySolutionCard 
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
                        />
                        <IndustrySolutionCard 
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
                        />
                        <IndustrySolutionCard 
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
                        />
                    </div>
                </div>
            </section>

            {/* Business Size Solutions */}
            <section className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-16`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Solutions for Every Business Size</h2>
                        <p className={`max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Whether you're a small business or a large enterprise, our system scales to meet your needs.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <BusinessSizeCard 
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
                        />
                        <BusinessSizeCard 
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
                        />
                        <BusinessSizeCard 
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
                        />
                    </div>
                </div>
            </section>

            {/* Case Studies */}
            <section className={`${darkMode ? 'bg-gray-800' : 'bg-white'} py-16`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Success Stories</h2>
                        <p className={`max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            See how businesses like yours have transformed their operations with our inventory management system.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <CaseStudyCard 
                            industry="Retail"
                            company="Global Fashion Outlet"
                            result="Reduced stockouts by 75% and improved inventory turnover by 35%"
                            quote="This system has completely transformed how we manage our multi-store inventory. We now have real-time visibility across all locations."
                            darkMode={darkMode}
                        />
                        <CaseStudyCard 
                            industry="Manufacturing"
                            company="Precision Parts Inc."
                            result="Cut production delays by 60% and reduced excess inventory by 40%"
                            quote="The ability to track raw materials and production schedules in one system has streamlined our entire manufacturing process."
                            darkMode={darkMode}
                        />
                        <CaseStudyCard 
                            industry="E-commerce"
                            company="Trendy Home Goods"
                            result="Increased order accuracy to 99.8% and reduced fulfillment time by 50%"
                            quote="Managing inventory across multiple sales channels used to be a nightmare. Now it's all synchronized automatically."
                            darkMode={darkMode}
                        />
                        <CaseStudyCard 
                            industry="Food Distribution"
                            company="Fresh Foods Distributors"
                            result="Reduced food waste by 65% with improved expiration date tracking"
                            quote="The expiration date tracking feature has been a game-changer for our perishable inventory management."
                            darkMode={darkMode}
                        />
                    </div>
                </div>
            </section>

            {/* Implementation Process */}
            <section className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-16`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Our Implementation Process</h2>
                        <p className={`max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            We ensure a smooth transition to our inventory management system with our proven implementation process.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <ProcessCard 
                            number="1"
                            title="Consultation"
                            description="We analyze your current processes and identify your specific inventory management needs."
                            darkMode={darkMode}
                        />
                        <ProcessCard 
                            number="2"
                            title="Customization"
                            description="We configure the system to match your business requirements and industry-specific needs."
                            darkMode={darkMode}
                        />
                        <ProcessCard 
                            number="3"
                            title="Training"
                            description="We provide comprehensive training for your team to ensure they can use the system effectively."
                            darkMode={darkMode}
                        />
                        <ProcessCard 
                            number="4"
                            title="Support"
                            description="Our dedicated support team is available to help you maximize the value of your inventory system."
                            darkMode={darkMode}
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-blue-600 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">Find the right solution for your business</h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Contact our solutions team to discuss your specific inventory management needs.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link 
                            to="/contact" 
                            className="px-8 py-3 bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-lg transition-colors duration-300"
                        >
                            Schedule a Consultation
                        </Link>
                        <Link 
                            to="/pricing" 
                            className="px-8 py-3 border border-white text-white hover:bg-blue-700 font-bold rounded-lg transition-colors duration-300"
                        >
                            View Pricing Plans
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

// Industry Solution Card Component
const IndustrySolutionCard = ({ icon, title, description, features, darkMode }) => {
    return (
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} shadow-lg transition-all duration-300 h-full`}>
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>{description}</p>
            <h4 className="font-semibold mb-2">Key Features:</h4>
            <ul className="space-y-1">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                        <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                        <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// Business Size Card Component
const BusinessSizeCard = ({ icon, title, description, features, darkMode }) => {
    return (
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-lg h-full`}>
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>{description}</p>
            <ul className="space-y-2">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                        <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                        <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// Case Study Card Component
const CaseStudyCard = ({ industry, company, result, quote, darkMode }) => {
    return (
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg border-l-4 border-blue-500`}>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3 ${darkMode ? 'bg-gray-600 text-gray-200' : 'bg-blue-100 text-blue-800'}`}>
                {industry}
            </div>
            <h3 className="text-xl font-bold mb-2">{company}</h3>
            <p className={`font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'} mb-3`}>{result}</p>
            <blockquote className={`italic ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                "{quote}"
            </blockquote>
        </div>
    );
};

// Process Card Component
const ProcessCard = ({ number, title, description, darkMode }) => {
    return (
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg text-center`}>
            <div className={`w-12 h-12 rounded-full ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-600'} flex items-center justify-center text-xl font-bold mx-auto mb-4`}>
                {number}
            </div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{description}</p>
        </div>
    );
};

export default Solutions;
