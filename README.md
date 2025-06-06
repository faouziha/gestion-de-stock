# Gestion de Stock - Inventory Management System

A comprehensive inventory and order management system built with modern web technologies. This application helps businesses manage their inventory, track orders, handle suppliers and clients, generate invoices, and monitor stock levels in real-time.

## Latest Updates (June 2025)

- **Fixed Brand Management**: Resolved issues with brand editing functionality
  - Fixed API endpoints to properly handle userId as query parameter
  - Corrected database column name mismatches between frontend and backend
  - Added improved error handling and detailed logging for troubleshooting
  - Ensured proper field mapping between UI components and database schema
- **Enhanced Multi-Product Orders**: Completely redesigned order system to display multiple products in a single order card for better organization and readability
- **Improved Order Management**: Added tax calculation (10%) for all orders with consistent display across all views
- **Responsive UI Enhancements**: All screens now fully responsive on mobile, tablet, and desktop devices
- **User-Specific Data**: Improved data isolation to ensure users only see suppliers and orders they created
- **Fixed Navigation**: Enhanced sidebar navigation with improved scrolling on mobile devices

![Inventory Management System](https://via.placeholder.com/800x400?text=Gestion+de+Stock)

## Overview

This application is designed to streamline inventory management processes for small to medium-sized businesses. It provides a user-friendly interface for tracking products, managing orders, handling supplier relationships, and generating professional invoices. With features like real-time stock tracking, order status management, and comprehensive search capabilities, this system helps businesses maintain efficient operations and make informed decisions.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Backend](#backend)
- [Frontend](#frontend)
- [Installation and Setup](#installation-and-setup)
- [Usage](#usage)

## Features

### User Authentication and Authorization
- **User Registration and Login**: Secure authentication system with email and password
- **Role-Based Access Control**: Different permission levels for administrators and regular users
  - Admins: Full access to all system features and user management
  - Regular Users: Access to their own data and operations
- **User Role Management**: 
  - Admin users can promote regular users to admin status through a convenient dropdown menu
  - To change a user's role: Navigate to User Management (admin-only section), select a user to view details, and use the role dropdown menu
  - Changes take effect immediately with real-time feedback and visual confirmation
  - Admin users automatically gain access to the Admin Panel option in the user dropdown menu in the navbar
- **User Profile Management**: Users can update their profile information and preferences
- **Secure Sessions**: JWT-based authentication with proper token management
- **Password Security**: Bcrypt hashing for secure password storage

### Brand Management
- **CRUD Operations**: Complete interface to create, read, update, and delete brands
- **Brand Details**: Store comprehensive information including:
  - Brand name and description
  - Logo image with automatic resizing and compression
  - Brand website URL and founding year
  - Brand color for UI customization
- **Brand-Product Association**: Link products to specific brands for better organization
- **Brand Filtering**: Filter products by brand in the product listing
- **User-Specific Brands**: Each user only sees brands they have created or have access to
- **Secure API Integration**: Properly authenticated API endpoints with user validation
- **Error Handling**: Comprehensive error handling with user-friendly messages

### Product Management
- **CRUD Operations**: Comprehensive interface to add, edit, view, and delete products
- **Product Details**: Store detailed information including:
  - Product name and description
  - Serial number and SKU
  - Price and cost information
  - Quantity and reorder levels
- **Product Categorization**: Organize products by categories for easier management
- **Image Management**: Upload and store product images with preview functionality
- **Stock Level Tracking**: Real-time monitoring of inventory levels with visual indicators
- **Advanced Search**: Find products quickly by:
  - Product name
  - Serial number
  - Description
  - Price range
- **Data Validation**: Form validation to ensure data integrity
- **User-Specific Products**: Each user only sees products they have created or have access to

### Order Management
- **Order Creation**: Intuitive interface for creating new orders with multiple products
- **Comprehensive Order Details**: Track important information including:
  - Order date and reference number
  - Customer information
  - Product details and quantities
  - Pricing and discounts
  - Shipping information
- **Status Workflow Management**: Track orders through their entire lifecycle:
  - Pending: Order created but not yet processed
  - Processing: Order is being prepared
  - Shipped: Order has been sent to the customer
  - Delivered: Order has been received by the customer
  - Cancelled: Order has been cancelled
- **Visual Status Indicators**: Color-coded badges for quick status identification
  - Pending: Yellow
  - Processing: Blue
  - Shipped: Purple
  - Delivered: Green
  - Cancelled: Red
- **Stock Validation**: Real-time validation to prevent ordering unavailable items
  - Automatic stock level checking during order creation
  - Warning messages when attempting to exceed available stock
  - Prevention of submitting orders that exceed available inventory
- **Professional Print Functionality**: Generate professional printable order documents
  - Clean, well-formatted order details
  - Customer information section
  - Itemized product table with quantities and prices
  - Color-coded status indicators
  - Total calculations and payment information
  - Print-friendly formatting for professional documentation
- **Multi-Product Orders**: Enhanced support for orders containing multiple products
  - Parent-child order relationship structure for database organization
  - Consolidated display of multiple products in a single order card
  - Ability to add, edit, and remove products within an order
  - Automatic total calculations with subtotal, tax (10%), and final amount
  - Stock validation for each product to prevent over-ordering
  - Detailed order view with product-specific information
- **Powerful Search Functionality**: Find orders quickly by:
  - Product name
  - Customer name
  - Order status
  - Order ID
  - Quantity
  - Date range
- **Order History**: Complete history of all order activities and status changes

### Supplier Management
- **Supplier Directory**: Comprehensive system to add, edit, view, and delete supplier information
- **Detailed Supplier Profiles**: Store complete supplier information including:
  - Company name and registration number
  - Contact person details
  - Multiple contact methods (phone, email, website)
  - Physical address and shipping information
  - Payment terms and account details
- **Supplier Order Management**: Complete system for tracking supplier orders
  - Order creation with product selection and quantity specification
  - Status tracking (Pending, Processing, Shipped, Delivered, Cancelled)
  - Expected delivery dates and notes
  - Color-coded status indicators for visual tracking
- **Order Documentation**: Professional print functionality for supplier orders
  - Well-formatted order details and supplier information
  - Product specifications with quantities and prices
  - Clean, professional layout for business documentation
  - Print-friendly design for record-keeping
- **User-Specific Suppliers**: Privacy and data separation where each user only sees suppliers they created
- **Contact Management**: Track all interactions with suppliers
- **Advanced Search Capabilities**: Find suppliers quickly by:
  - Company name
  - Contact person
  - Email address
  - Phone number
  - Physical address
- **Data Validation**: Form validation to ensure accurate supplier information
- **Supplier Performance Metrics**: Track reliability, delivery times, and quality

### Client Management
- **Client Directory**: Comprehensive system to add, edit, view, and delete client information
- **Detailed Client Profiles**: Store complete client information including:
  - Company/individual name
  - Contact information (phone, email, address)
  - Billing and shipping addresses
  - Payment terms and preferences
  - Purchase history
- **User-Specific Clients**: Privacy and data separation where each user only sees clients they created
- **Contact History**: Track all interactions and communications with clients
- **Advanced Search Capabilities**: Find clients quickly by name, contact information, or location
- **Data Validation**: Form validation to ensure accurate client information
- **Client Categorization**: Group clients by type, size, or importance

### Invoice Generation
- **Automated Invoice Creation**: Generate professional invoices directly from orders
- **Customizable Invoice Templates**: Professional, branded invoice layouts
- **Comprehensive Invoice Details**:
  - Invoice number and date
  - Customer billing and shipping information
  - Itemized product listings with quantities and prices
  - Subtotals, taxes, discounts, and final totals
  - Payment terms and due dates
- **Invoice Status Tracking**:
  - Draft: Created but not finalized
  - Sent: Delivered to customer
  - Paid: Payment received
  - Overdue: Payment past due date
  - Cancelled: Invoice cancelled
- **Enhanced Print Functionality**: Generate professional printable invoice documents
  - Clean, structured layout with company and customer information
  - Detailed invoice header with invoice number, date, and status
  - Itemized product/service table with quantities and prices
  - Clearly formatted totals section
  - Print-specific styling for professional output
  - Consistent experience with other printable documents
- **PDF Generation**: Create PDF versions of invoices for email or download
- **Order Linking**: Direct connection between invoices and their corresponding orders
- **Advanced Search Functionality**: Find invoices quickly by:
  - Invoice number
  - Customer name
  - Status
  - Total amount
  - Date range
- **Payment Tracking**: Record and track payments against invoices

### Dashboard and Analytics
- **Comprehensive Dashboard**: Visual overview of business performance
- **Key Performance Indicators (KPIs)**:
  - Total sales and revenue metrics
  - Inventory value and stock levels
  - Order fulfillment rates
  - Top-selling products
  - Low stock alerts
- **Interactive Data Visualization**:
  - Sales trends over time
  - Product performance charts
  - Order status distribution
  - Supplier performance metrics
- **Quick Access Navigation**: One-click access to all main features
- **Personalized Views**: Customizable dashboard based on user role and preferences
- **Notification Center**: Alerts for important events (low stock, new orders, etc.)
- **Consistent UI Elements**: Blue-themed action buttons across all components
- **Fully Responsive Design**: Optimized layout for all screen sizes from mobile to desktop
- **Dark/Light Mode Support**: Visual theme options for different working environments

## Technology Stack

### Backend
- **Node.js**: JavaScript runtime for server-side code execution
- **Express.js**: Web application framework for building robust APIs
  - RESTful API architecture
  - Middleware support for request processing
  - Route handling and controller organization
- **PostgreSQL**: Powerful relational database for data storage
  - Complex data relationships
  - Transaction support
  - Data integrity constraints
- **Security Implementations**:
  - **bcrypt**: Library for secure password hashing
  - **JWT (JSON Web Tokens)**: For secure authentication
  - **Helmet**: HTTP header security
- **Development Tools**:
  - **dotenv**: Environment variable management for configuration
  - **nodemon**: Automatic server restart during development
- **Middleware**:
  - **cors**: Cross-Origin Resource Sharing for API access
  - **multer**: File upload handling for product images
  - **body-parser**: Request body parsing
- **API Documentation**: Swagger/OpenAPI for API documentation

### Frontend
- **React**: JavaScript library for building dynamic user interfaces
  - Functional components with hooks
  - Context API for state management
  - Custom hooks for reusable logic
- **Build Tools**:
  - **Vite**: Next-generation frontend tooling for faster development and optimized builds
  - **ESLint**: Code quality and style enforcement
- **Routing and Navigation**:
  - **React Router v6**: Declarative routing with the latest features
  - Protected routes for authentication
  - Nested routes for complex UI
- **API Communication**:
  - **Axios**: Promise-based HTTP client for API requests
  - Request/response interceptors
  - Error handling
- **Styling and UI**:
  - **Tailwind CSS**: Utility-first CSS framework for rapid UI development
  - Responsive design principles
  - Custom theme configuration
  - Dark/light mode support
- **UI Components and Libraries**:
  - **React Icons**: Comprehensive icon library
  - **Framer Motion**: Animation library for smooth transitions
  - **React-to-Print**: Library for printing invoices and reports
  - **React Hook Form**: Form validation and handling
- **Performance Optimizations**:
  - Code splitting
  - Lazy loading
  - Memoization
  - Virtualized lists for large data sets

## Project Structure

```
├── Back-end/                # Backend code
│   ├── Server.js            # Main Express server file
│   ├── controllers/         # Route controllers for API endpoints
│   │   ├── authController.js    # Authentication logic
│   │   ├── productController.js # Product management
│   │   ├── orderController.js   # Order processing
│   │   ├── supplierController.js # Supplier management
│   │   ├── clientController.js  # Client management
│   │   └── invoiceController.js # Invoice generation
│   ├── middleware/         # Express middleware
│   │   ├── auth.js          # Authentication middleware
│   │   ├── errorHandler.js  # Error handling
│   │   └── upload.js        # File upload handling
│   ├── models/             # Database models and queries
│   ├── routes/             # API route definitions
│   ├── utils/              # Utility functions
│   ├── .env                # Environment variables
│   └── uploads/            # Directory for uploaded files
│
├── Front-end/              # Frontend code
│   └── vite-project/       # React application
│       ├── src/            # Source code
│       │   ├── Components/ # React components
│       │   │   ├── Dashboard components/ # Main feature components
│       │   │   │   ├── Product/     # Product management components
│       │   │   │   ├── Orders/      # Order management components
│       │   │   │   ├── Suppliers/   # Supplier management components
│       │   │   │   ├── Clients/     # Client management components
│       │   │   │   └── Factures/    # Invoice components
│       │   │   ├── Auth/        # Authentication components
│       │   │   ├── UI/          # Reusable UI components
│       │   │   └── Layout/      # Layout components
│       │   ├── context/     # Context providers
│       │   │   ├── AuthContext.jsx # Authentication state
│       │   │   └── ThemeContext.jsx # Theme management
│       │   ├── hooks/       # Custom React hooks
│       │   ├── utils/       # Utility functions
│       │   ├── config/      # Configuration files
│       │   ├── assets/      # Static assets
│       │   ├── App.jsx      # Main application component
│       │   └── main.jsx     # Entry point
│       ├── public/          # Public assets
│       ├── index.html       # HTML entry point
│       ├── vite.config.js   # Vite configuration
│       └── tailwind.config.js # Tailwind CSS configuration
│
├── package.json            # Project dependencies
├── README.md               # Project documentation
└── index.js                # Main entry point
```

## Backend Architecture

The backend is built with Node.js and Express, providing RESTful API endpoints for all application features. It connects to a PostgreSQL database for data persistence and implements various security measures to protect user data.

### Key Features:

- **Authentication System**:
  - Secure user authentication with bcrypt password hashing
  - JWT token generation and validation
  - Role-based permission system
  - Password reset functionality

- **Database Architecture**:
  - Pool-based PostgreSQL connection for better performance
  - Normalized database schema with proper relationships
  - Transaction support for data integrity
  - Efficient query optimization

- **API Design**:
  - RESTful endpoints following best practices
  - Consistent response formatting
  - Proper HTTP status code usage
  - Comprehensive error handling

- **Business Logic Implementation**:
  - Stock Management: Real-time tracking of inventory levels
  - Order Processing: Workflow management with status tracking
  - Invoice Generation: Automated creation from order data
  - Stock Validation: Prevention of over-ordering with inventory checks

- **File Management**:
  - Support for product image uploads
  - Secure file storage and retrieval
  - Image optimization for performance

- **Security Measures**:
  - Input sanitization and validation
  - SQL injection prevention
  - CORS configuration
  - Rate limiting for API endpoints

- **Performance Optimizations**:
  - Query caching where appropriate
  - Efficient database indexing
  - Pagination for large data sets

### API Endpoints:

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|-------------|
| `/auth/register` | POST | Register new user | Public |
| `/auth/login` | POST | User login | Public |
| `/produit` | GET | Get all products | Required |
| `/produit/:id` | GET | Get product by ID | Required |
| `/produit` | POST | Create new product | Required |
| `/produit/:id` | PUT | Update product | Required |
| `/produit/:id` | DELETE | Delete product | Required |
| `/commande` | GET | Get all orders | Required |
| `/commande/:id` | GET | Get order by ID | Required |
| `/commande` | POST | Create new order | Required |
| `/commande/:id` | PUT | Update order | Required |
| `/commande/:id` | DELETE | Delete order | Required |
| `/fournisseur` | GET | Get all suppliers | Required |
| `/fournisseur/:id` | GET | Get supplier by ID | Required |
| `/fournisseur` | POST | Create new supplier | Required |
| `/fournisseur/:id` | PUT | Update supplier | Required |
| `/fournisseur/:id` | DELETE | Delete supplier | Required |
| `/facture` | GET | Get all invoices | Required |
| `/facture/:id` | GET | Get invoice by ID | Required |
| `/facture` | POST | Create new invoice | Required |
| `/facture/:id` | PUT | Update invoice | Required |
| `/facture/:id` | DELETE | Delete invoice | Required |
| `/brands` | GET | Get all brands | Required |
| `/brands/:id` | GET | Get brand by ID | Required |
| `/brands` | POST | Create new brand | Required |
| `/brands/:id` | PUT | Update brand | Required |
| `/brands/:id` | DELETE | Delete brand | Required |

## Frontend Architecture

The frontend is built with React and Vite, providing a responsive, interactive, and user-friendly interface. It follows modern React practices with functional components, hooks, and context API for state management.

### Key Components and Features:

- **State Management**:
  - **Authentication Context**: Global state management for user authentication and permissions
  - **Theme Context**: Support for light/dark mode preferences with persistent settings
  - **Local Component State**: Efficient state management with useState and useReducer hooks
  - **Form State Management**: Controlled components with validation

- **Routing and Navigation**:
  - **Protected Routes**: Route protection based on authentication status and user roles
  - **Nested Routes**: Logical organization of application sections
  - **Navigation Guards**: Prevent unauthorized access to restricted areas
  - **Breadcrumb Navigation**: Clear indication of current location

- **Layout and UI Structure**:
  - **Dashboard Layout**: Consistent layout across all pages with:
    - Responsive sidebar navigation with collapsible sections
    - Fixed header with user profile and theme toggle
    - Main content area with proper padding and scrolling behavior
  - **Component Hierarchy**: Logical organization of components for maintainability
  - **Reusable UI Components**: Button, Card, Modal, Alert, and Form components

- **User Interface Features**:
  - **Responsive Design**: Mobile-first approach with Tailwind CSS
    - Adapts to all screen sizes from mobile to large desktop
    - Optimized layouts for different devices
  - **Search Components**: Real-time filtering across all major sections
    - Debounced input for performance
    - Highlighting of matching text
  - **Consistent UI Elements**: 
    - Unified blue color scheme for primary action buttons
    - Consistent form styling and validation feedback
    - Standardized card layouts for data display

- **Data Visualization**:
  - **Dashboard Charts**: Visual representation of key metrics
  - **Status Indicators**: Color-coded badges for status representation
  - **Progress Tracking**: Visual indicators for processes and workflows

- **User Experience Enhancements**:
  - **Loading States**: Clear indication when data is being fetched
  - **Error Handling**: User-friendly error messages and recovery options
  - **Success Feedback**: Confirmation messages for completed actions
  - **Form Validation**: Real-time validation with helpful error messages
  - **Keyboard Navigation**: Support for keyboard shortcuts and accessibility

- **Performance Optimizations**:
  - **Code Splitting**: Lazy loading of components for faster initial load
  - **Memoization**: Preventing unnecessary re-renders with useMemo and useCallback
  - **Virtualization**: Efficient rendering of large lists
  - **Image Optimization**: Proper sizing and loading of images

## Installation and Setup

### Prerequisites

- Node.js (v18.x or later)
- PostgreSQL database

### Backend Setup

1. Navigate to the project root directory:
   ```bash
   cd "path/to/PFE (gestion de stock)"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables by creating a `.env` file with the following variables:
   ```
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=stock_management
   DB_USER=postgres
   DB_PASSWORD=your_password

   # JWT Secret
   JWT_SECRET=your_jwt_secret_key

   # File Upload Configuration
   UPLOAD_DIR=./uploads
   ```

4. Start the server:
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the `Front-end/vite-project` directory:
   ```bash
   cd "Front-end/vite-project"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the API endpoint by creating or editing `.env.local` file:
   ```
   VITE_API_URL=http://localhost:3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   This will start the development server, typically at `http://localhost:5173`

5. For production build:
   ```bash
   npm run build
   ```
   
   To preview the production build:
   ```bash
   npm run preview
   ```

## Usage Guide

### Getting Started

1. **Account Setup**:
   - Register a new account with your email and password
   - Or login with existing credentials
   - Admin users can access additional features like user management
   - To promote a user to admin status:
     1. Login with an existing admin account
     2. Navigate to User Management in the sidebar
     3. Find the user you want to promote
     4. Click the "View" button next to their name
     5. In the user details modal, select "admin" from the role dropdown menu
     6. Click the save button next to the dropdown
     7. The role change takes effect immediately with a success message
     8. The user will now see the "Admin Panel" option in their user dropdown menu in the navbar

2. **Dashboard Navigation**:
   - Use the sidebar menu to access different modules
   - The dashboard provides an overview of key metrics and alerts
   - Toggle between light and dark mode using the theme switch

### Working with Products

1. **Adding Products**:
   - Navigate to Products > Add New Product
   - Fill in all required fields (name, description, price, quantity)
   - Upload a product image (optional)
   - Save the product to add it to inventory

2. **Managing Inventory**:
   - View all products in the Products list
   - Use the search bar to filter products by name or serial number
   - Edit product details or delete products as needed
   - Monitor stock levels with visual indicators

### Processing Orders

1. **Creating Orders**:
   - Navigate to Orders > Add New Order
   - Select products and specify quantities
   - The system will validate available stock in real-time
   - Add customer information and any special instructions
   - Submit the order to create it

2. **Managing Order Workflow**:
   - View all orders in the Orders list
   - Use the search functionality to find specific orders
   - Update order status as it progresses (Pending → Processing → Shipped → Delivered)
   - Cancel orders if necessary

### Supplier and Client Management

1. **Adding Suppliers/Clients**:
   - Navigate to the respective section (Suppliers/Clients)
   - Click on Add New button
   - Fill in contact details and other required information
   - Save to add to your directory

2. **Managing Relationships**:
   - Use the search functionality to quickly find contacts
   - Update information as needed
   - View history of interactions and orders

### Invoice Management

1. **Generating Invoices**:
   - Create invoices directly from orders
   - Or navigate to Invoices > Create New Invoice
   - Select the customer and add line items
   - Set payment terms and due dates

2. **Invoice Actions**:
   - View all invoices in the Invoices list
   - Search for invoices by number, customer, or amount
   - Print invoices using the blue print button
   - Track payment status and mark invoices as paid

### Tips for Efficient Use

- Use the search functionality across all sections to quickly find what you need
- Monitor the dashboard for low stock alerts and important notifications
- Regularly update order statuses to maintain accurate tracking
- Use the print function to generate professional invoices for customers
- Take advantage of the responsive design to access the system on any device

## Recent Updates

### Print Functionality Enhancement (May 2025)
- **Unified Print System**: Implemented consistent print functionality across client orders, supplier orders, and invoices
- **Improved Document Format**: Professional, clean layout for all business documents
- **Technical Implementation**: Replaced previous DOM-based printing with more reliable iframe-based solution
- **Print-Specific Styling**: Added dedicated print stylesheets that hide UI elements and optimize for printed output
- **Document Components**:
  - Organized header with document type and ID
  - Two-column layout for document and entity information
  - Color-coded status indicators
  - Detailed item tables with aligned columns
  - Professional footer with thank you message and generation date

### Multi-Product Order System Enhancements (April 2025)
- **Fixed Product Display**: Corrected issues where product prices weren't displaying when adding new products
- **Improved Edit Functionality**: Fixed issues with product selection and duplicate/blank product cards
- **Data Validation**: Added validation for child orders and proper data type handling
- **UI Consistency**: Implemented consistent styling across the application

### Supplier Order System Implementation (March 2025)
- **Complete CRUD Functionality**: Built comprehensive supplier order management system
- **User-Specific Data**: Implemented data privacy with user-specific filtering
- **Status Tracking**: Added color-coded status tracking (Pending, Processing, Shipped, Delivered, Cancelled)
- **Automatic Calculations**: Implemented auto-calculation of total amounts based on quantity and unit price
