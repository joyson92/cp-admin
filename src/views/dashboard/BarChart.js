import React, { useEffect, useState, useRef } from 'react'

import { CChartBar } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils';
import API from '../../services/apiService';
import AlertMessage from '../../components/shared/AlertMessage';

const BarChart = () => {
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ msg: '', status: 'success' });

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await API.get(`/analytics/month`);
          const parsedData = JSON.parse(response.data.data);
          setChartData(parsedData);
        } catch (error) {
          console.error('Error fetching data:', error);
          if (error.response?.status === 401) {
            setAlertMsg({ msg: 'Session expired. Please login again.', status: 'danger' });
          } else {
            setAlertMsg({ msg: 'Failed to load. Please try again later.', status: 'danger' });
          }

          setShowAlert(true);
        }
      };

      fetchData();
    }, []);

  useEffect(() => {
    document.documentElement.addEventListener('ColorSchemeChange', () => {
      if (chartRef.current) {
        setTimeout(() => {
          chartRef.current.options.scales.x.grid.borderColor = getStyle(
            '--cui-border-color-translucent',
          )
          chartRef.current.options.scales.x.grid.color = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.x.ticks.color = getStyle('--cui-body-color')
          chartRef.current.options.scales.y.grid.borderColor = getStyle(
            '--cui-border-color-translucent',
          )
          chartRef.current.options.scales.y.grid.color = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.y.ticks.color = getStyle('--cui-body-color')
          chartRef.current.update()
        })
      }
    })
  }, [chartRef])

  return (
    <>
      <AlertMessage
        show={showAlert}
        setShow={setShowAlert}
        message={alertMsg.msg}
        status={alertMsg.status}
        duration={5000}
      />
      <CChartBar
      customTooltips={false}
                    data={{
                      labels: Object.keys(chartData).length > 0 ? chartData['month'] : [],
                      datasets: [
                        {
                          label: 'Monthly Revenue',
                          backgroundColor: '#f87979',
                          data: Object.keys(chartData).length > 0 ? chartData['total'] : [],
                        },
                      ],
                    }}
                    labels="months"
                  />
    </>
  )
}

export default BarChart
