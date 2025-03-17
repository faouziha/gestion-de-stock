import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FaCheck, FaTimes, FaInfoCircle } from 'react-icons/fa';

const Pricing = () => {
    const { darkMode } = useTheme();
    const [annual, setAnnual] = useState(true);
    
    return (
        <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen pt-16`}>
            {/* Hero Section */}
            <section className="px-4 sm:px-8 md:px-16 lg:px-24 py-16 md:py-20">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                            Simple, Transparent Pricing
                        </h1>
                        <p className={`text-lg max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-8`}>
                            Choose the plan that's right for your business. All plans include a 14-day free trial.
                        </p>
                        
                        {/* Billing Toggle */}
                        <div className="flex items-center justify-center mb-12">
                            <span className={`${annual ? 'opacity-50' : 'opacity-100'} ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Monthly</span>
                            <button 
                                className={`relative mx-4 w-16 h-8 flex items-center ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full p-1 cursor-pointer`}
                                onClick={() => setAnnual(!annual)}
                            >
                                <div 
                                    className={`bg-blue-600 w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${annual ? 'translate-x-8' : ''}`}
                                ></div>
                            </button>
                            <span className={`${annual ? 'opacity-100' : 'opacity-50'} ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Annual <span className="text-green-500 font-semibold">(Save 20%)</span>
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Plans */}
            <section className="px-4 sm:px-8 md:px-16 lg:px-24 py-8 md:py-12">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Basic Plan */}
                        <PricingCard 
                            title="Basic"
                            description="Perfect for small businesses just getting started with inventory management."
                            price={annual ? 29 : 39}
                            period={annual ? "/month, billed annually" : "/month"}
                            features={[
                                "Up to 1,000 products",
                                "2 user accounts",
                                "Basic reporting",
                                "Email support",
                                "Mobile app access",
                                "Barcode scanning"
                            ]}
                            notIncluded={[
                                "Advanced analytics",
                                "API access",
                                "Custom fields",
                                "Priority support"
                            ]}
                            buttonText="Start Free Trial"
                            buttonLink="/signup"
                            darkMode={darkMode}
                            highlighted={false}
                        />
                        
                        {/* Professional Plan */}
                        <PricingCard 
                            title="Professional"
                            description="Ideal for growing businesses with multiple sales channels."
                            price={annual ? 79 : 99}
                            period={annual ? "/month, billed annually" : "/month"}
                            features={[
                                "Up to 10,000 products",
                                "10 user accounts",
                                "Advanced reporting",
                                "Email and chat support",
                                "Mobile app access",
                                "Barcode scanning",
                                "Multi-location support",
                                "Sales forecasting",
                                "Custom fields"
                            ]}
                            notIncluded={[
                                "API access",
                                "Priority support"
                            ]}
                            buttonText="Start Free Trial"
                            buttonLink="/signup"
                            darkMode={darkMode}
                            highlighted={true}
                        />
                        
                        {/* Enterprise Plan */}
                        <PricingCard 
                            title="Enterprise"
                            description="For large businesses with complex inventory management needs."
                            price={annual ? 199 : 249}
                            period={annual ? "/month, billed annually" : "/month"}
                            features={[
                                "Unlimited products",
                                "Unlimited user accounts",
                                "Advanced reporting",
                                "Priority support",
                                "Mobile app access",
                                "Barcode scanning",
                                "Multi-location support",
                                "Sales forecasting",
                                "Custom fields",
                                "API access",
                                "Dedicated account manager",
                                "Custom integrations"
                            ]}
                            notIncluded={[]}
                            buttonText="Contact Sales"
                            buttonLink="/contact"
                            darkMode={darkMode}
                            highlighted={false}
                        />
                    </div>
                </div>
            </section>

            {/* Feature Comparison */}
            <section className={`${darkMode ? 'bg-gray-800' : 'bg-white'} py-16`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Compare Plan Features</h2>
                        <p className={`max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            A detailed breakdown of what's included in each plan to help you make the right choice.
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
                                <FeatureRow 
                                    feature="Products" 
                                    basic="1,000" 
                                    pro="10,000" 
                                    enterprise="Unlimited" 
                                    darkMode={darkMode} 
                                />
                                <FeatureRow 
                                    feature="User Accounts" 
                                    basic="2" 
                                    pro="10" 
                                    enterprise="Unlimited" 
                                    darkMode={darkMode} 
                                />
                                <FeatureRow 
                                    feature="Locations" 
                                    basic="1" 
                                    pro="5" 
                                    enterprise="Unlimited" 
                                    darkMode={darkMode} 
                                />
                                <FeatureRow 
                                    feature="Basic Reporting" 
                                    basic={<FaCheck className="text-green-500 mx-auto" />} 
                                    pro={<FaCheck className="text-green-500 mx-auto" />} 
                                    enterprise={<FaCheck className="text-green-500 mx-auto" />} 
                                    darkMode={darkMode} 
                                />
                                <FeatureRow 
                                    feature="Advanced Analytics" 
                                    basic={<FaTimes className="text-red-500 mx-auto" />} 
                                    pro={<FaCheck className="text-green-500 mx-auto" />} 
                                    enterprise={<FaCheck className="text-green-500 mx-auto" />} 
                                    darkMode={darkMode} 
                                />
                                <FeatureRow 
                                    feature="Mobile App Access" 
                                    basic={<FaCheck className="text-green-500 mx-auto" />} 
                                    pro={<FaCheck className="text-green-500 mx-auto" />} 
                                    enterprise={<FaCheck className="text-green-500 mx-auto" />} 
                                    darkMode={darkMode} 
                                />
                                <FeatureRow 
                                    feature="Barcode Scanning" 
                                    basic={<FaCheck className="text-green-500 mx-auto" />} 
                                    pro={<FaCheck className="text-green-500 mx-auto" />} 
                                    enterprise={<FaCheck className="text-green-500 mx-auto" />} 
                                    darkMode={darkMode} 
                                />
                                <FeatureRow 
                                    feature="Multi-location Support" 
                                    basic={<FaTimes className="text-red-500 mx-auto" />} 
                                    pro={<FaCheck className="text-green-500 mx-auto" />} 
                                    enterprise={<FaCheck className="text-green-500 mx-auto" />} 
                                    darkMode={darkMode} 
                                />
                                <FeatureRow 
                                    feature="Sales Forecasting" 
                                    basic={<FaTimes className="text-red-500 mx-auto" />} 
                                    pro={<FaCheck className="text-green-500 mx-auto" />} 
                                    enterprise={<FaCheck className="text-green-500 mx-auto" />} 
                                    darkMode={darkMode} 
                                />
                                <FeatureRow 
                                    feature="Custom Fields" 
                                    basic={<FaTimes className="text-red-500 mx-auto" />} 
                                    pro={<FaCheck className="text-green-500 mx-auto" />} 
                                    enterprise={<FaCheck className="text-green-500 mx-auto" />} 
                                    darkMode={darkMode} 
                                />
                                <FeatureRow 
                                    feature="API Access" 
                                    basic={<FaTimes className="text-red-500 mx-auto" />} 
                                    pro={<FaTimes className="text-red-500 mx-auto" />} 
                                    enterprise={<FaCheck className="text-green-500 mx-auto" />} 
                                    darkMode={darkMode} 
                                />
                                <FeatureRow 
                                    feature="Dedicated Account Manager" 
                                    basic={<FaTimes className="text-red-500 mx-auto" />} 
                                    pro={<FaTimes className="text-red-500 mx-auto" />} 
                                    enterprise={<FaCheck className="text-green-500 mx-auto" />} 
                                    darkMode={darkMode} 
                                />
                                <FeatureRow 
                                    feature="Custom Integrations" 
                                    basic={<FaTimes className="text-red-500 mx-auto" />} 
                                    pro={<FaTimes className="text-red-500 mx-auto" />} 
                                    enterprise={<FaCheck className="text-green-500 mx-auto" />} 
                                    darkMode={darkMode} 
                                />
                                <FeatureRow 
                                    feature="Support" 
                                    basic="Email" 
                                    pro="Email & Chat" 
                                    enterprise="Priority" 
                                    darkMode={darkMode} 
                                />
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
                        <p className={`max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Have questions about our pricing? Find answers to common questions below.
                        </p>
                    </div>
                    
                    <div className="space-y-6">
                        <FaqItem 
                            question="Can I switch plans later?" 
                            answer="Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll be billed the prorated amount for the remainder of your billing cycle. When downgrading, the new rate will apply at the start of your next billing cycle."
                            darkMode={darkMode}
                        />
                        <FaqItem 
                            question="Is there a setup fee?" 
                            answer="No, there are no setup fees for any of our plans. You only pay the advertised monthly or annual subscription fee."
                            darkMode={darkMode}
                        />
                        <FaqItem 
                            question="What payment methods do you accept?" 
                            answer="We accept all major credit cards (Visa, Mastercard, American Express) and PayPal. For Enterprise plans, we can also arrange for bank transfers or other payment methods."
                            darkMode={darkMode}
                        />
                        <FaqItem 
                            question="Do you offer discounts for non-profits?" 
                            answer="Yes, we offer special pricing for non-profit organizations. Please contact our sales team for more information."
                            darkMode={darkMode}
                        />
                        <FaqItem 
                            question="What happens after my free trial?" 
                            answer="After your 14-day free trial, your account will automatically be billed for the plan you selected. You can cancel at any time during the trial period if you decide not to continue."
                            darkMode={darkMode}
                        />
                        <FaqItem 
                            question="Can I get a refund if I'm not satisfied?" 
                            answer="We offer a 30-day money-back guarantee for all new subscriptions. If you're not satisfied with our service within the first 30 days, contact our support team for a full refund."
                            darkMode={darkMode}
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-blue-600 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">Ready to get started?</h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Try our inventory management system free for 14 days, no credit card required.
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

            {/* Enterprise Section */}
            <section className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} py-16`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="md:w-1/2 mb-8 md:mb-0">
                            <h2 className="text-3xl font-bold mb-4">Need a custom solution?</h2>
                            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                                Our Enterprise plan can be customized to meet your specific business requirements. 
                                Contact our sales team to discuss your needs and get a personalized quote.
                            </p>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-start">
                                    <FaCheck className="text-green-500 mt-1 mr-2" />
                                    <span>Custom implementation and onboarding</span>
                                </li>
                                <li className="flex items-start">
                                    <FaCheck className="text-green-500 mt-1 mr-2" />
                                    <span>Integration with your existing systems</span>
                                </li>
                                <li className="flex items-start">
                                    <FaCheck className="text-green-500 mt-1 mr-2" />
                                    <span>Dedicated account manager</span>
                                </li>
                                <li className="flex items-start">
                                    <FaCheck className="text-green-500 mt-1 mr-2" />
                                    <span>Custom training for your team</span>
                                </li>
                            </ul>
                            <Link 
                                to="/contact" 
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors duration-300 inline-block"
                            >
                                Contact Enterprise Sales
                            </Link>
                        </div>
                        <div className="md:w-1/2 md:pl-12">
                            <div className={`rounded-lg overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-4">Request Enterprise Information</h3>
                                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                                        Fill out this form and our enterprise team will contact you within 24 hours.
                                    </p>
                                    <div className="space-y-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Company Name
                                            </label>
                                            <input 
                                                type="text" 
                                                className={`w-full px-3 py-2 border rounded-md ${
                                                    darkMode 
                                                        ? 'bg-gray-800 border-gray-600 text-white' 
                                                        : 'bg-white border-gray-300 text-gray-900'
                                                }`}
                                                placeholder="Your company name"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Your Name
                                            </label>
                                            <input 
                                                type="text" 
                                                className={`w-full px-3 py-2 border rounded-md ${
                                                    darkMode 
                                                        ? 'bg-gray-800 border-gray-600 text-white' 
                                                        : 'bg-white border-gray-300 text-gray-900'
                                                }`}
                                                placeholder="Full name"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Business Email
                                            </label>
                                            <input 
                                                type="email" 
                                                className={`w-full px-3 py-2 border rounded-md ${
                                                    darkMode 
                                                        ? 'bg-gray-800 border-gray-600 text-white' 
                                                        : 'bg-white border-gray-300 text-gray-900'
                                                }`}
                                                placeholder="email@company.com"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Phone Number
                                            </label>
                                            <input 
                                                type="tel" 
                                                className={`w-full px-3 py-2 border rounded-md ${
                                                    darkMode 
                                                        ? 'bg-gray-800 border-gray-600 text-white' 
                                                        : 'bg-white border-gray-300 text-gray-900'
                                                }`}
                                                placeholder="(123) 456-7890"
                                            />
                                        </div>
                                        <button 
                                            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-300"
                                        >
                                            Request Information
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

// Pricing Card Component
const PricingCard = ({ title, description, price, period, features, notIncluded, buttonText, buttonLink, darkMode, highlighted }) => {
    return (
        <div className={`rounded-lg overflow-hidden ${
            highlighted 
                ? 'ring-2 ring-blue-500 transform scale-105 shadow-xl' 
                : 'shadow-lg'
            } ${
                darkMode 
                    ? highlighted ? 'bg-gray-700' : 'bg-gray-800' 
                    : 'bg-white'
            } transition-all duration-300 flex flex-col h-full`}
        >
            {highlighted && (
                <div className="bg-blue-600 text-white text-center py-2 font-semibold">
                    Most Popular
                </div>
            )}
            <div className="p-6 flex-grow">
                <h3 className="text-2xl font-bold mb-2">{title}</h3>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>{description}</p>
                <div className="mb-6">
                    <span className="text-4xl font-bold">${price}</span>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{period}</span>
                </div>
                
                <h4 className="font-semibold mb-3">Includes:</h4>
                <ul className="space-y-2 mb-6">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                            <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
                
                {notIncluded.length > 0 && (
                    <>
                        <h4 className={`font-semibold mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Not included:</h4>
                        <ul className={`space-y-2 mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {notIncluded.map((feature, index) => (
                                <li key={index} className="flex items-start">
                                    <FaTimes className="text-red-500 mt-1 mr-2 flex-shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <Link 
                    to={buttonLink} 
                    className={`w-full block text-center py-3 px-4 rounded-lg font-medium transition-colors duration-300 ${
                        highlighted 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                            : darkMode 
                                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}
                >
                    {buttonText}
                </Link>
            </div>
        </div>
    );
};

// Feature Row Component
const FeatureRow = ({ feature, basic, pro, enterprise, darkMode }) => {
    return (
        <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <td className="p-4">{feature}</td>
            <td className="p-4 text-center">{basic}</td>
            <td className="p-4 text-center">{pro}</td>
            <td className="p-4 text-center">{enterprise}</td>
        </tr>
    );
};

// FAQ Item Component
const FaqItem = ({ question, answer, darkMode }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div className={`border rounded-lg overflow-hidden ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <button 
                className={`w-full text-left p-4 flex justify-between items-center focus:outline-none ${isOpen ? 'border-b' : ''} ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-semibold">{question}</span>
                <svg 
                    className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="p-4">
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{answer}</p>
                </div>
            )}
        </div>
    );
};

export default Pricing;
