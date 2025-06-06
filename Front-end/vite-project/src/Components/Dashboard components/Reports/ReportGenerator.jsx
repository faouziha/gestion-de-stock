import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

const ReportGenerator = ({ onSubmit, onCancel }) => {
  const { darkMode } = useTheme();
  const [title, setTitle] = useState(`Sales Report ${format(new Date(), 'yyyy-MM-dd')}`);
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(1))); // First day of current month
  const [endDate, setEndDate] = useState(new Date());
  const [error, setError] = useState('');

  // Force re-render on theme change
  useEffect(() => {
    // This empty useEffect will trigger a re-render when darkMode changes
  }, [darkMode]);

  const handleSubmit = () => {
    // Validate inputs
    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }

    if (startDate > endDate) {
      setError('Start date cannot be after end date.');
      return;
    }

    // Format dates for API
    const formattedStartDate = format(startDate, 'yyyy-MM-dd');
    const formattedEndDate = format(endDate, 'yyyy-MM-dd');

    // Submit the report data
    onSubmit({
      title,
      description,
      date_range_start: formattedStartDate,
      date_range_end: formattedEndDate
    });
  };

  return (
    <div className={`rounded-lg shadow p-4 sm:p-6 ${darkMode ? 'bg-gray-800 text-white' : 'bg-blue-50 text-gray-800'}`}>
      <h2 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Generate New Report</h2>
      <hr className={`mb-6 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`} />
      
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

      <form className="space-y-6" noValidate autoComplete="off">
        <div>
          <label htmlFor="title" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Report Title</label>
          <input
            id="title"
            type="text"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        
        <div>
          <label htmlFor="description" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Description (Optional)</label>
          <textarea
            id="description"
            rows="2"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              maxDate={new Date()}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>End Date</label>
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              maxDate={new Date()}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-6">
          <button 
            type="button" 
            className={`w-full sm:w-auto px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${darkMode ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className={`w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${darkMode ? 'bg-blue-700 hover:bg-blue-800 focus:ring-blue-600' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}`}
            onClick={handleSubmit}
          >
            Generate Report
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportGenerator;
