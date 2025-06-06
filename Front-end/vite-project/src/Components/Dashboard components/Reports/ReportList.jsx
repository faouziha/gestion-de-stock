import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FaEye, FaTrash, FaCalendarAlt } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import config from '../../../config';

const ReportList = ({ reports, onRefresh, onViewReport }) => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // We only need the selectedReport for delete operation
  const [selectedReport, setSelectedReport] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState('');
  
  // Force re-render on theme change
  useEffect(() => {
    // This empty useEffect will trigger a re-render when darkMode changes
  }, [darkMode]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const value = parseInt(event.target.value, 10);
    setRowsPerPage(value);
    setPage(0);
  };

  const handleViewReport = (report) => {
    // Call the parent component's handler to navigate to the report view
    onViewReport(report);
  };

  const handleDeleteClick = (report) => {
    setSelectedReport(report);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete(
        `${config.API_URL}/reports/${selectedReport.id}?userId=${user.id}`
      );

      if (response.data.success) {
        setDeleteDialogOpen(false);
        onRefresh();
      } else {
        setError(response.data.error || 'Failed to delete report');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      setError(error.response?.data?.error || 'An error occurred while deleting the report');
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString || 'N/A';
    }
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-blue-50 text-gray-800'}`}>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError('')}>
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
            </svg>
          </span>
        </div>
      )}
      
      {reports.length === 0 ? (
        <div className="text-center my-8">
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            No reports have been generated yet.
          </p>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2 text-sm`}>
            Use the "Generate Report" button to create your first report.
          </p>
        </div>
      ) : (
        <div className="w-full p-4 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 rounded-lg">
            {reports
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((report) => (
                <div key={report.id} className={`border ${darkMode ? 'border-gray-700' : 'border-blue-200'} rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow`}>
                  <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-blue-50 text-gray-800'} h-full flex flex-col`}>
                    <div className="p-4 flex-grow">
                      <h3 className={`text-base sm:text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'} truncate`}>
                        {report.title}
                      </h3>
                      
                      <div className="flex items-center text-sm mb-2">
                        <FaCalendarAlt className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mr-1`} />
                        <span className={`truncate ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{formatDate(report.date_created)}</span>
                      </div>

                      <div className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        <span className="block truncate">
                          {formatDate(report.date_range_start)} - {formatDate(report.date_range_end)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center mb-3">
                        <div className={`text-sm font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                          ${Number(report.total_revenue).toFixed(2)}
                        </div>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${darkMode ? 'bg-blue-800 text-blue-100' : 'bg-blue-100 text-blue-800'}`}>
                          {report.total_products_sold} Products
                        </span>
                      </div>
                    </div>
                    
                    <div className={`border-t ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-gray-50'} px-4 py-3 flex flex-col sm:flex-row gap-2`}>
                      <button
                        className={`w-full sm:flex-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded flex items-center justify-center text-xs sm:text-sm transition-colors ${darkMode ? 'bg-blue-900 text-blue-100 hover:bg-blue-800' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                        onClick={() => onViewReport(report)}
                      >
                        <FaEye className="mr-1" />
                        View
                      </button>
                      <button
                        className={`w-full sm:flex-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded flex items-center justify-center text-xs sm:text-sm transition-colors ${darkMode ? 'bg-red-900 text-red-100 hover:bg-red-800' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
                        onClick={() => handleDeleteClick(report)}
                      >
                        <FaTrash className="mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          
          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 px-2 sm:px-4 py-3 border-t sm:px-6 gap-2">
            <div className="flex items-center text-xs sm:text-sm w-full sm:w-auto justify-center sm:justify-start mb-2 sm:mb-0">
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <span className="hidden sm:inline">Showing </span>
                <span className="font-medium mx-1">{page * rowsPerPage + 1}</span>
                <span className="hidden sm:inline">to</span>
                <span className="sm:hidden">-</span>
                <span className="font-medium mx-1">
                  {Math.min((page + 1) * rowsPerPage, reports.length)}
                </span>
                <span className="hidden sm:inline">of</span>
                <span className="sm:hidden">/</span>
                <span className="font-medium mx-1">{reports.length}</span>
                <span className="hidden sm:inline">results</span>
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                className={`block w-16 sm:w-24 px-2 sm:px-3 py-1 text-xs sm:text-sm border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
                value={rowsPerPage}
                onChange={(e) => handleChangeRowsPerPage(e)}
              >
                {[5, 10, 25].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div className="flex items-center">
                <button
                  className={`px-2 py-1 border rounded-l-md hover:bg-opacity-80 disabled:opacity-50 ${darkMode ? 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  onClick={() => handleChangePage(null, page - 1)}
                  disabled={page === 0}
                >
                  Previous
                </button>
                <button
                  className={`px-2 py-1 border rounded-r-md hover:bg-opacity-80 disabled:opacity-50 ${darkMode ? 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  onClick={() => handleChangePage(null, page + 1)}
                  disabled={page >= Math.ceil(reports.length / rowsPerPage) - 1}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Confirm Deletion</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to delete the report "{selectedReport?.title}"? This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportList;
