import React, { useEffect, useState, useRef } from 'react'

import { CChartLine } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils';
import API from '../../services/apiService';

const MainChart = () => {
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState({});

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await API.get(`/analytics/month`);
          const parsedData = JSON.parse(response.data.data);
          setChartData(parsedData);
        } catch (error) {
          console.error('Error fetching data:', error);
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
      <CChartLine
      customTooltips={false}
        ref={chartRef}
        style={{ height: '300px', marginTop: '40px' }}
        data={{
          labels: Object.keys(chartData).length > 0 ? chartData['month'] : [],
          datasets: [
            {
              label: 'Goregaon',
              backgroundColor: `rgba(${getStyle('--cui-info-rgb')}, .1)`,
              borderColor: getStyle('--cui-info'),
              pointHoverBackgroundColor: getStyle('--cui-info'),
              borderWidth: 2,
              data: Object.keys(chartData).length > 0 ? chartData['branch']['Goregaon']: [],
              fill: true,
            },
            {
              label: 'Versova',
              backgroundColor: `rgba(${getStyle('--cui-info-rgb')}, .1)`,
              borderColor: getStyle('--cui-success'),
              pointHoverBackgroundColor: getStyle('--cui-success'),
              borderWidth: 2,
              data: Object.keys(chartData).length > 0 ? chartData['branch']['Versova'] : [],
            },
            {
              label: 'Juhu',
              backgroundColor: `rgba(${getStyle('--cui-info-rgb')}, .1)`,
              borderColor: getStyle('--cui-red'),
              pointHoverBackgroundColor: getStyle('--cui-red'),
              borderWidth: 2,
              data: Object.keys(chartData).length > 0 ? chartData['branch']['Juhu'] : [],
            }
          ],
        }}
        options={{
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              grid: {
                color: getStyle('--cui-border-color-translucent'),
                drawOnChartArea: false,
              },
              ticks: {
                color: getStyle('--cui-body-color'),
              },
            },
            y: {
              beginAtZero: true,
              border: {
                color: getStyle('--cui-border-color-translucent'),
              },
              grid: {
                color: getStyle('--cui-border-color-translucent'),
              },
              max: 400000,
              ticks: {
                color: getStyle('--cui-body-color'),
                maxTicksLimit: 6,
                stepSize: Math.ceil(400000 / 6),
              },
            },
          },
          elements: {
            line: {
              tension: 0.1,
            },
            point: {
              radius: 5,
              hitRadius: 10,
              hoverRadius: 4,
              hoverBorderWidth: 3,
            },
          },
        }}
      />
    </>
  )
}

export default MainChart
