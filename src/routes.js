import React from 'react'

const Orders = React.lazy(() => import('./components/orders/Orders'))
const EditOrder = React.lazy(() => import('./components/orders/EditOrder'))
const ViewOrder = React.lazy(() => import('./components/orders/ViewOrder'))
const AddOrder = React.lazy(() => import('./components/orders/AddOrder'))
const DuplicateOrder = React.lazy(() => import('./components/orders/DuplicateOrder'))
const Riders = React.lazy(() => import('./components/riders/Riders'))
const AddRider = React.lazy(() => import('./components/riders/AddRider'))
const EditRider = React.lazy(() => import('./components/riders/EditRider'))
const Prices = React.lazy(() => import('./components/pricing/Prices'))
const AddPrice = React.lazy(() => import('./components/pricing/AddPrice'))
const EditPrice = React.lazy(() => import('./components/pricing/EditPrice'))
const Expenses = React.lazy(() => import('./components/expenses/Expenses'))
const AddExpense = React.lazy(() => import('./components/expenses/AddExpense'))
const EditExpense = React.lazy(() => import('./components/expenses/EditExpense'))
const Payers = React.lazy(() => import('./components/payers/Payers'))
const AddPayer = React.lazy(() => import('./components/payers/AddPayer'))
const EditPayer = React.lazy(() => import('./components/payers/EditPayer'))
const Category = React.lazy(() => import('./components/categories/Category'))
const AddCategory = React.lazy(() => import('./components/categories/AddCategory'))
const EditCategory = React.lazy(() => import('./components/categories/EditCategory'))
const Payments = React.lazy(() => import('./components/reports/Payments'))
const Sales = React.lazy(() => import('./components/reports/Sales'))
const Subscriptions = React.lazy(() => import('./components/subscriptions/Subscriptions'))
const AddSubscription = React.lazy(() => import('./components/subscriptions/AddSubscription'))
const EditSubscription = React.lazy(() => import('./components/subscriptions/EditSubscription'))
const CompanyDetails = React.lazy(() => import('./components/company_details/CompanyDetails'))
const EditCompanyDetails = React.lazy(() => import('./components/company_details/EditCompanyDetails'))
const AddCompanyDetails = React.lazy(() => import('./components/company_details/AddCompanyDetails'))
const Invoices = React.lazy(() => import('./components/invoices/Invoices'))
const PastInvoices = React.lazy(() => import('./components/invoices/PastInvoices'))
const EditInvoice = React.lazy(() => import('./components/invoices/EditInvoice'))
const EditInvoiceBulk = React.lazy(() => import('./components/invoices/EditInvoiceBulk'))
const ViewInvoiceBulk = React.lazy(() => import('./components/invoices/ViewInvoiceBulk'))
const ViewInvoice = React.lazy(() => import('./components/invoices/ViewInvoice'))
const Enquiries = React.lazy(() => import('./components/enquiry/Enquiries'))
const ViewEnquiry = React.lazy(() => import('./components/enquiry/ViewEnquiry'))
const Customers = React.lazy(() => import('./components/customer/Customers'))
const ViewCustomer = React.lazy(() => import('./components/customer/ViewCustomer'))

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard},
  { path: '/orders', name: 'Order', element: Orders},
  { path: '/orders/pastOrders', name: 'Completed Orders', element: Orders},
  { path: '/orders/editOrder', name: 'Edit Order', element: EditOrder},
  { path: '/orders/viewOrder', name: 'View Order', element: ViewOrder},
  { path: '/orders/addOrder', name: 'Add Order', element: AddOrder},
  { path: '/orders/duplicateOrder', name: 'New Order from Existing', element: DuplicateOrder},
  { path: '/riders', name: 'Riders', element: Riders},
  { path: '/riders/addRider', name: 'Add Rider', element: AddRider},
  { path: '/riders/editRider', name: 'Update Rider', element: EditRider},
  { path: '/prices', name: 'Price Details', element: Prices},
  { path: '/prices/addPrice', name: 'Add Price', element: AddPrice},
  { path: '/prices/editPrice', name: 'Update Price', element: EditPrice},
  { path: '/expenses', name: 'Expenses Details', element: Expenses},
  { path: '/addExpense', name: 'Add Expense', element: AddExpense},
  { path: '/editExpense', name: 'Update Expense', element: EditExpense},
  { path: '/payers', name: 'Payers Details', element: Payers},
  { path: '/payers/add', name: 'Add Payer', element: AddPayer},
  { path: '/payers/:id/edit', name: 'Update Payer', element: EditPayer},
  { path: '/category', name: 'Category Details', element: Category},
  { path: '/category/add', name: 'Add Category', element: AddCategory},
  { path: '/category/:id/edit', name: 'Update Category', element: EditCategory},
  { path: '/payments', name: 'Payment Report', element: Payments},
  { path: '/sales', name: 'Sales Report', element: Sales},
  { path: '/subscriptions', name: 'Subscriptions', element: Subscriptions},
  { path: '/addSubscription', name: 'Create Subscription', element: AddSubscription},
  { path: '/editSubscription', name: 'Update Subscription', element: EditSubscription},
  { path: '/companyDetails', name: 'Company Details', element: CompanyDetails},
  { path: '/companyDetails/editCompanyDetails', name: 'Update Company Details', element: EditCompanyDetails},
  { path: '/companyDetails/addCompanyDetails', name: 'Add Company Details', element: AddCompanyDetails},
  { path: '/invoices', name: 'Invoices', element: Invoices},
  { path: '/pastInvoices', name: 'Completed Invoices', element: PastInvoices},
  { path: '/editInvoice', name: 'Edit Invoice', element: EditInvoice},
  { path: '/editInvoiceBulk', name: 'Edit Invoice', element: EditInvoiceBulk},
  { path: '/viewInvoiceBulk', name: 'View Invoice', element: ViewInvoiceBulk},
  { path: '/viewInvoice', name: 'View Invoice', element: ViewInvoice},
  { path: '/enquiries', name: 'Enquiries', element: Enquiries},
  { path: '/enquiries/viewEnquiry', name: 'View Enquiry', element: ViewEnquiry},
  { path: '/customers', name: 'Customers', element: Customers},
  { path: '/viewCustomer', name: 'View Customer', element: ViewCustomer}
]

export default routes
