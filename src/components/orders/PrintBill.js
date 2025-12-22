import React, {useState, useEffect} from 'react';
import { useLocation } from 'react-router-dom';
import {CButton} from '@coreui/react';
import { numberToWords } from '../components/NumToWords';


const PrintBill = (props) => {
  const location = useLocation(); // Use useLocation hook to access location state
  //const orderData = location.state.orderData; // Retrieve orderData from location state
  const { printData } = props;
  const [clothDetails, setClothDetails] = useState([]);


  useEffect(() => {
    if (printData?.cloth_details) {
       setClothDetails(printData.cloth_details);
    }
  }, [printData?.cloth_details]);


  const handlePrint = () => {
    const printContents = document.getElementById('printContents');
    if (printContents) {

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Print</title></head><body>');
        printWindow.document.write(printContents.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
      } else {
        // Handle error if popup window is blocked
        console.error('Popup window is blocked');
      }

    } else {
      // Handle error if printContents div is not found
      console.error('printContents div not found');
    }
  };

  const hiddenStyle = {
    display: 'none'
  };

  return (
  <div>

    <div id="printContents" style={hiddenStyle}>
    {/* Render printData only if it's defined */}
                {printData && (
                  <>
                    {/* Render order details */}
      <table width="100%">
      <tr rowspan="2">
      <td colspan="2">Company Logo</td>
      <td colspan="6">
        <h1>Company Name</h1>
      </td>
      </tr>
      <tr>
        <td></td>
        <td></td>
        <td colspan="6">
          Company Address <br/>
        </td>
      </tr>
      <tr>
        <td colspan="8">
          <hr/>Tax Invoice GST #: 213232423, HSN #: 123242343<hr/>
        </td>
      </tr>
      <tr>
        <td colspan="2">
          Order #: {printData.order_id}
        </td>
        <td>
          Order Date: {printData.order_dt}
        </td>
        <td colspan="5">
        {printData.contact_person} - {printData.contact_number}<br/>
        </td>
      </tr>
      <tr>
        <td colspan="2">Invoice #: {printData.invoice_no}</td>
        <td colspan="2">
          Delivery Date: {printData.delivery_dt}
        </td>
        <td colspan="4">Shipping & Billing Address: {printData.address}</td>
      </tr>
      <tr>
        <td colspan="2">Invoice Date: 22-05-2024</td>
        <td colspan="2">
          Place of supply: Maharashtra
        </td>
        <td colspan="4"></td>
      </tr>
      <tr>
        <td colspan="2">Reverse Charge (Y/N) : N</td>
        <td colspan="2">
        </td>
        <td colspan="4"></td>
      </tr>
      <tr>
        <th width="2%">#</th>
        <th colspan="3">Service</th>
        <th>Qty</th>
        <th>Rate (&#8377;)</th>
        <th>Disc.</th>
        <th>Total (&#8377;)</th>
      </tr>
      {clothDetails.map((row, index) => (
      <tr>
        <td>{index + 1}</td>
        <td colspan="3">{row.category}</td>
        <td>{row.qty}</td>
        <td>{row.price}</td>
        <td></td>
        <td>{row.total}</td>
      </tr>
      ))}
      <tr>
        <td colspan="4"></td>
        <td>{printData.qty}</td>
        <td></td>
        <td>Sub-total</td>
        <td>&#8377;{printData.subTotal}</td>
      </tr>
      <tr>
        <td colspan="6"></td>
        <td>GST 18%</td>
        <td>&#8377;{printData.gst}</td>
      </tr>
      <tr>
        <td colspan="6"></td>
        <td>Total</td>
        <td>&#8377;{printData.total}</td>
      </tr>
      <tr>
        <td colspan="8"><hr/>
        Amount (&#8377;): {numberToWords(printData.total)} only.
        <hr/>
        </td>
      </tr>
      <tr>
        <td colspan="8">
        CGST 9% : &#8377;{printData.gst/2}, SGST 9% : &#8377;{printData.gst/2}<br/>
        </td>
      </tr>
      <tr>
        <td colspan="8">
        Terms & Details:<br/>
        1. Get complete protection against any damage/loss.<br/>
        2. Applicable only for app.
        </td>
      </tr>
      <tr>
        <td colspan="8"><br/><br/></td>
      </tr>
      <tr>
        <td colspan="6"></td>
        <td colspan="2">Signature of Supplier</td>
      </tr>
    </table>
    </>
              )}
    </div>

    <CButton color="success" onClick={handlePrint}>
      Print
    </CButton>
    </div>
  );
};

export default PrintBill;
