import React, { useEffect, useState, useRef } from 'react'

import { CChartBar } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils';
import API from '../../services/apiService';
import AlertMessage from '../../components/shared/AlertMessage';

const StackedBarChart = () => {
  const chartRef = useRef(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ msg: '', status: 'success' });
  const [months, setMonths] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [yMax, setYMax] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null); // e.g. "Rent"
  const [combinedMode, setCombinedMode] = useState(false);
  const clickTimerRef = useRef(null);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await API.get(`/analytics/expense`);
          const parsedData = typeof response.data.data === 'string'
            ? JSON.parse(response.data.data)
            : response.data.data;

          if (!parsedData?.month?.length) {
            setMonths([]);
            setDatasets([]);
            return;
          }

          // --- months ---
          setMonths(parsedData.month);

          // --- categories (unique across all locations/months) ---
          const categories = new Set();
          let max = 0;
          Object.values(parsedData.expense).forEach(location => {

            Object.values(location.full).forEach(total => {
                if (total > max) max = total;
            });
            setYMax(Math.round(max * 1.1));

            Object.values(location.bifur).forEach(monthArr => {
              monthArr.forEach(item => {
                categories.add(Object.keys(item)[0]);
              });
            });
          });

          const categoryList = Array.from(categories);
          const dataset = [];

          // --- datasets ---
          Object.entries(parsedData.expense).forEach(([location, locData]) => {
            categoryList.forEach(category => {
              const data = parsedData.month.map(month => {
                const monthArr = locData.bifur[month] || [];
                const found = monthArr.find(item => item[category] !== undefined);
                return found ? parseInt(found[category]) : 0;
              });

              dataset.push({
                label: `${location} - ${category}`,
                data,
                stack: location,
              });
            });
          });

          setDatasets(dataset);
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

    // Helper: pull "Category" from "Location - Category"
    const parseCategory = (label) => {
      const parts = String(label).split(' - ');
      return parts[parts.length - 1];
    };

    // Helper: clone a dataset and nuke any hidden flag Chart may have injected
    const cloneDataset = (ds) => {
      const { hidden, ...rest } = ds || {};
      return { ...rest, hidden: false };
    };

    const getDisplayDatasets = () => {
      if (!datasets.length) return [];

      if (combinedMode) {
        // One total bar per month (sum across EVERYTHING)
        const totals = months.map((_, i) =>
           datasets.reduce((sum, ds) => sum + (Number(ds.data?.[i]) || 0), 0)
        );

        return [
          {
            label: "Total",
            data: totals,
            backgroundColor: "#42A5F5",
            stack: "combined"
          }
        ];
      }

      if (selectedCategory) {
        // Filter only datasets that contain the selected category
        return datasets.filter((ds) => parseCategory(ds.label) === selectedCategory)
                              .map(cloneDataset);
      }

      // Default → show all
      return datasets.map(cloneDataset);
    };

    // Dynamic Y max based on what’s actually displayed
    const getVisibleYMax = (labels, dsArr) => {
      if (!labels?.length || !dsArr?.length) return undefined;
      let max = 0;
      labels.forEach((_, idx) => {
        const perStackTotals = {};
        dsArr.forEach((ds) => {
          const stack = ds.stack || 'default';
          const v = Number(ds.data?.[idx]) || 0;
          perStackTotals[stack] = (perStackTotals[stack] || 0) + v;
        });
        Object.values(perStackTotals).forEach((t) => (max = Math.max(max, t)));
      });
      return max > 0 ? Math.round(max * 1.1) : undefined;
    };


    // Click handler: single click = filter by category, double click = combined mode
    const handleClick = (event, elements, chart) => {
      if (!elements.length) return;

      const clickedDatasetIndex = elements[0].datasetIndex;
      const clickedDs = chart.data.datasets[clickedDatasetIndex];
      const cat = parseCategory(clickedDs.label);

      if (clickTimerRef.current) {
        // Double click
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
        setCombinedMode((prev) => {
              if (prev) {
                // Leaving combined mode → restore original stacks
                return false;
              } else {
                // Entering combined mode → clear filter
                setSelectedCategory(null);
                return true;
              }
            });
      } else {
        // Single click (wait briefly to see if it becomes a double)
        clickTimerRef.current = setTimeout(() => {
          if (!combinedMode){
            clickTimerRef.current = null;
            setCombinedMode(false); // single-click exits combined mode
            setSelectedCategory((prev) => (prev === cat ? null : cat));
          }
        }, 250);
      }
    };

  // Compute visible datasets + yMax just-in-time
  const displayDatasets = getDisplayDatasets();
  const visibleYMax = getVisibleYMax(months, displayDatasets);


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

  const stackTotalPlugin = {
    id: 'stackTotalPlugin',
    afterDatasetsDraw(chart) {
      const { ctx, scales: { x, y } } = chart;

      chart.data.labels.forEach((label, dataIndex) => {
        // group totals by stack name
        const stackTotals = {};
        chart.data.datasets.forEach((dataset, datasetIndex) => {
          if (!chart.isDatasetVisible(datasetIndex)) return;
          const stack = dataset.stack || 'default';
          const value = dataset.data[dataIndex];
          if (typeof value === 'number') {
            stackTotals[stack] = (stackTotals[stack] || 0) + value;
          }
        });

        // draw totals above each stack
        Object.entries(stackTotals).forEach(([stackName, total]) => {
          if (total > 0) {
            // find the last visible dataset in this stack at this x index
            let lastMeta;
            chart.data.datasets.forEach((dataset, datasetIndex) => {
              if (dataset.stack === stackName && chart.isDatasetVisible(datasetIndex)) {
                lastMeta = chart.getDatasetMeta(datasetIndex);
              }
            });

            if (lastMeta) {
              const bar = lastMeta.data[dataIndex];
              if (bar) {
                const { x: xPos, y: yPos } = bar.tooltipPosition();
                ctx.save();
                ctx.fillStyle = 'black';
                ctx.font = 'bold 12px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(total, xPos, yPos - 10);
                ctx.restore();
              }
            }
          }
        });
      });
    },
  };


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
     key={`chart-${selectedCategory ?? 'all'}-${combinedMode ? 'combined' : 'normal'}`}
     customTooltips={false}
       data={{
         labels: months,
         datasets: displayDatasets,
       }}
       options={{
         responsive: true,
         interaction: {
           mode: 'nearest',
           intersect: true,
         },
         plugins: {
           tooltip: {
             enabled: true,
             callbacks: {
               label: function (context) {
                 let label = context.dataset.label || '';
                 if (label) label += ': ';
                 if (context.parsed.y !== null) {
                   label += context.parsed.y;
                 }
                 return label;
               },
             },
           },
           legend: {
             display: false,
             position: 'top',
           },
         },
         onClick: handleClick,
         scales: {
           x: {
             stacked: !combinedMode,
           },
           y: {
             stacked: !combinedMode, min: 0, max: visibleYMax ?? (yMax > 0 ? yMax : undefined)
           },
         },
       }}
       plugins={[stackTotalPlugin]}
     />
    </>
  )
}

export default StackedBarChart
