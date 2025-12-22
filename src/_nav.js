import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilChart,
  cilChartLine,
  cilSpeedometer,
  cilHistory,
  cilPeople,
  cilCreditCard,
  cilFile,
  cilDollar,
  cilBuilding,
  cilBike,
  cilCheckCircle,
  cilPlus,
  cilSpeech,
  cilCalendar
} from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'

export const _nav = (loggedInUser) => {
return [
  {
     component: CNavItem,
     name: 'Dashboard',
     to: '/dashboard',
     icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
     badge: { color: 'info', text: 'NEW' },
  },
  {
    component: CNavTitle,
    name: 'Orders',
  },
  {
    component: CNavItem,
    name: 'Orders',
    to: '/orders',
    icon: <CIcon icon={cilChart} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Create Order',
    to: '/orders/addOrder',
    icon: <CIcon icon={cilPlus} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Completed Orders',
    to: '/orders/pastOrders',
    icon: <CIcon icon={cilCheckCircle} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Invoice'
  },
  {
    component: CNavItem,
    name: 'Invoices',
    to: '/invoices',
    icon: <CIcon icon={cilFile} customClassName="nav-icon" />
  },
  {
    component: CNavItem,
    name: 'Completed Invoices',
    to: '/pastInvoices',
    icon: <CIcon icon={cilHistory} customClassName="nav-icon" />
  },
  ...(loggedInUser === '_sa1' || loggedInUser === '_a1' ? [
  {
    component: CNavTitle,
    name: 'Plans & Pricing',
  },
  {
    component: CNavItem,
    name: 'Subscriptions',
    to: '/subscriptions',
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
  },
  {
      component: CNavItem,
      name: 'Packages',
      to: '/subscriptions',
      icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
    },
  {
      component: CNavTitle,
      name: 'Marketing'
  },
  {
    component: CNavItem,
    name: 'Enquiries',
    to: '/enquiries',
    icon: <CIcon icon={cilSpeech} customClassName="nav-icon" />
  },
  {
    component: CNavItem,
    name: 'Customers',
    to: '/customers',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />
  },
  {
      component: CNavTitle,
      name: 'Reports',
  },
  {
       component: CNavItem,
       name: 'Sales',
       to: '/sales',
       icon: <CIcon icon={cilChartLine} customClassName="nav-icon" />,
    },
  {
     component: CNavItem,
     name: 'Payment',
     to: '/payments',
     icon: <CIcon icon={cilCreditCard} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'User Details',
  },
   {
        component: CNavItem,
        name: 'Rider Details',
        to: '/riders',
        icon: <CIcon icon={cilBike} customClassName="nav-icon" />,
   },
  ]
: []),

...(loggedInUser === '_sa1' || loggedInUser === '_a1' ? [
   {
       component: CNavItem,
       name: 'Pricing Details',
       to: '/prices',
       icon: <CIcon icon={cilDollar} customClassName="nav-icon" />,
   },
   {
       component: CNavItem,
       name: 'Company Details',
       to: '/companyDetails',
       icon: <CIcon icon={cilBuilding} customClassName="nav-icon" />,
   }
  ]
: []),

...(loggedInUser === '_sa1' ? [
  {
    component: CNavTitle,
    name: 'Operations',
  },
   {
       component: CNavItem,
       name: 'Expenses',
       to: '/expenses',
       icon: <CIcon icon={cilDollar} customClassName="nav-icon" />,
   }
  ]
: [])

]
}


