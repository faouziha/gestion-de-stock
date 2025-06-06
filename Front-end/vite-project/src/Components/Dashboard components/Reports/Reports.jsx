import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChartBar, FaPlus, FaArrowLeft } from 'react-icons/fa';
// Using existing styles instead of Material UI components
import ReportGenerator from './ReportGenerator';
import ReportList from './ReportList';
import ReportView from './ReportView';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import config from '../../../config';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuth();
  const { darkMode } = useTheme();
  
  // Force re-render on theme change
  useEffect(() => {
    // This empty useEffect will trigger a re-render when darkMode changes
  }, [darkMode]);

  // Handle responsive detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.API_URL}/reports?userId=${parseInt(user.id)}`);
      if (response.data.success) {
        setReports(response.data.report);
      } else {
        console.error('Error fetching reports:', response.data.error);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [user.id]);

  const handleGenerateReport = async (reportData) => {
    try {
      setLoading(true);
      const response = await axios.post(`${config.API_URL}/reports`, {
        ...reportData,
        userId: parseInt(user.id),
      });

      if (response.data.success) {
        // Reset form and refresh reports
        setShowGenerator(false);
        fetchReports();
      } else {
        console.error('Error generating report:', response.data.error);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowGenerator(false); // Close generator if open
  };

  const handleBackToList = () => {
    setSelectedReport(null);
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 my-2 sm:my-4">
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-lg p-2 sm:p-4 md:p-6 flex flex-col w-full overflow-hidden`}>
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <div className="flex items-center space-x-2">
            {selectedReport ? (
              <>
                <button 
                  onClick={handleBackToList}
                  className="mr-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <FaArrowLeft className="text-lg sm:text-xl" />
                </button>
                <h1 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} truncate max-w-[180px] sm:max-w-none`}>{selectedReport.title}</h1>
              </>
            ) : (
              <>
                <FaChartBar className="text-blue-600 text-xl sm:text-2xl" />
                <h1 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Reports</h1>
              </>
            )}
          </div>
          
          {!selectedReport && (
            <button
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1 sm:py-2 rounded-lg ${showGenerator ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'} text-white transition-colors text-xs sm:text-sm`}
              onClick={() => setShowGenerator(!showGenerator)}
            >
              <FaPlus className="text-xs sm:text-sm" />
              <span>{showGenerator ? 'Cancel' : isMobile ? 'New' : 'Generate Report'}</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {selectedReport ? (
              <ReportView reportId={selectedReport.id} />
            ) : (
              <>
                {showGenerator && (
                  <ReportGenerator onSubmit={handleGenerateReport} onCancel={() => setShowGenerator(false)} />
                )}
                
                <div className={showGenerator ? 'mt-8' : ''}>
                  <ReportList reports={reports} onRefresh={fetchReports} onViewReport={handleViewReport} />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;
