import React, {useEffect, useState} from 'react';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

const ExcelExport = (props) => {

  const { data, fileName, totalData, type } = props;
  const [ excel, setExcel] = useState([]);

    useEffect(() => {
        if (type == "Sales") {
            const newExcelData = data.map((row) => ({
                "Invoice Date": format(row.invoice_dt, 'dd-MM-yyyy'),
                "Invoice No": row.invoice_no,
                "Order Date": format(row.order_dt, 'dd-MM-yyyy'),
                "Order No": row.order_id ,
                "Name": row.contact_person,
                "Phone #": row.contact_number,
                "GST #": row.customerGST,
                "Basic": Math.round(row.base),
                "Discount": Math.round(row.discount),
                "Delivery": row.deliveryCharges,
                "Amount (A)": row.subTotal,
                "GST (B)": parseFloat(row.gst),
                "Total Amount (A+B)": parseFloat(row.total),
                "Category": row.type,
                "Payment Date": row.payment_date ? format(row.payment_date, 'dd-MM-yyyy') : '',
                "Payment Amount": parseFloat(row.payment_amount),
                "Pending": parseFloat(row.pending),
                "Short Fall": row.sf,
                "Mode": row.payment_mode
            }));
            const summaryRow = {
                        "Basic": totalData.baseAmount,
                        "Discount": totalData.discount,
                        "Amount (A)": totalData.subTotal,
                        "GST (B)": totalData.gst,
                        "Total Amount (A+B)": totalData.totalAmount,
                        "Payment Amount": totalData.totalPaymentAmount,
                        "Pending": totalData.pending,
                        "Short Fall": totalData.sf,
                    };

            setExcel([...newExcelData, summaryRow]);
        } else if (type == "Subscriptions") {
            const newExcelData = data.map((row) => ({
                "Process Type": row.process_type,
                "Customer": row.cust_id ,
                "Invoice No": row.invoice_id,
                "Plan": row.plan,
                "Balance": row.balance,
                "Start Date": format(row.sub_start, 'dd-MM-yyyy'),
                "End Date": format(row.sub_end, 'dd-MM-yyyy')
            }));
            setExcel(newExcelData);
        } else {
            const newExcelData = data.map((row) => ({

                "Order No": row.order_id ,
                "Invoice Date": row.i_dt,
                "Invoice No": row.i_no,
                "Amount (A)": parseFloat(row.subTotal),
                "GST (B)": parseFloat(row.gst),
                "Total Amount (A+B)": parseFloat(row.total),
                "From": row.customer_name,
                "Type": row.type,
                "Payment Date": row.p_dt,
                "Payment Amount": parseFloat(row.p_amount),
                "Mode": row.p_mode
            }));
            const summaryRow = {
                        "Amount (A)": totalData.subTotal,
                        "GST (B)": totalData.gst,
                        "Total Amount (A+B)": totalData.totalAmount,
                        "Payment Amount": totalData.totalPaymentAmount,
                    };

            setExcel([...newExcelData, summaryRow]);
        }
    }, [totalData]);

  // Function to handle export
  const handleExport = () => {
    // Create a new Excel workbook
    const workbook = XLSX.utils.book_new();

    // Convert data to Excel sheet
    const worksheet = XLSX.utils.json_to_sheet(excel);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Generate a binary string from the workbook
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Convert to Blob
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Save as Excel file

    if (navigator.msSaveBlob) {
      // For IE and Edge browsers
      navigator.msSaveBlob(blob, fileName);
    } else {
      // For other browsers
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };

  return (
    <div>
      <button onClick={handleExport}>Export to Excel</button>
    </div>
  );
};

export default ExcelExport;
