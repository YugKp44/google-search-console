import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getAccessToken } from './authUtils';
import './DashBoard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [totalClicks, setTotalClicks] = useState(0);
  const [totalImpressions, setTotalImpressions] = useState(0);
  const [averageCTR, setAverageCTR] = useState(0);
  const [averagePosition, setAveragePosition] = useState(0);

  // States to control visibility of each graph
  const [showClicks, setShowClicks] = useState(true);
  const [showImpressions, setShowImpressions] = useState(true);
  const [showCTR, setShowCTR] = useState(true);
  const [showPosition, setShowPosition] = useState(true);

  const fetchData = async () => {
    try {
      const token = await getAccessToken();

      const response = await axios.post(
        'https://www.googleapis.com/webmasters/v3/sites/sc-domain:creatosaurus.io/searchAnalytics/query',
        {
          startDate: '2024-09-20', // Update date range here
          endDate: '2024-12-26',
          dimensions: ['date'], // Ensure the date dimension is used for the x-axis
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.rows?.length > 0) {
        const processedData = response.data.rows.map((row) => ({
          date: row.keys[0],
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          position: row.position,
        }));

        setData(processedData);

        // Calculate totals and averages
        setTotalClicks(processedData.reduce((sum, row) => sum + row.clicks, 0));
        setTotalImpressions(
          processedData.reduce((sum, row) => sum + row.impressions, 0)
        );
        setAverageCTR(
          (
            processedData.reduce((sum, row) => sum + row.ctr, 0) /
            processedData.length
          ).toFixed(2)
        );
        setAveragePosition(
          (
            processedData.reduce((sum, row) => sum + row.position, 0) /
            processedData.length
          ).toFixed(2)
        );
      } else {
        setError('No data available for the selected period.');
      }
    } catch (error) {
      setError(`Error: ${error.response?.data?.error?.message || error.message}`);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Chart Data with conditional datasets based on checkbox states
  const chartData = data
    ? {
        labels: data.map((row) => row.date),
        datasets: [
          showClicks && {
            label: 'Clicks',
            data: data.map((row) => row.clicks || 0),
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            yAxisID: 'yLeft',
            fill: false,
          },
          showImpressions && {
            label: 'Impressions',
            data: data.map((row) => row.impressions || 0),
            borderColor: 'rgba(153, 102, 255, 1)',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            yAxisID: 'yRight',
            fill: false,
          },
          showCTR && {
            label: 'Average CTR (%)',
            data: data.map((row) => (row.ctr * 100).toFixed(2)), // Convert CTR to percentage
            borderColor: 'rgba(255, 159, 64, 1)',
            backgroundColor: 'rgba(255, 159, 64, 0.2)',
            yAxisID: 'yCTR',
            fill: false,
          },
          showPosition && {
            label: 'Average Position',
            data: data.map((row) => row.position.toFixed(2)),
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            yAxisID: 'yPosition',
            fill: false,
          },
        ].filter(Boolean), // Remove any undefined datasets
      }
    : {
        labels: [],
        datasets: [],
      };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Search Console Data: Clicks, Impressions, CTR, and Position',
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex;
            return `Date: ${data[index].date}`;
          },
          label: (tooltipItem) => {
            const datasetLabel = tooltipItem.dataset.label;
            const index = tooltipItem.dataIndex;
            if (datasetLabel === 'Clicks') return `Clicks: ${data[index].clicks}`;
            if (datasetLabel === 'Impressions')
              return `Impressions: ${data[index].impressions}`;
            if (datasetLabel === 'Average CTR (%)')
              return `CTR: ${(data[index].ctr * 100).toFixed(2)}%`;
            if (datasetLabel === 'Average Position')
              return `Position: ${data[index].position.toFixed(2)}`;
            return '';
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Dates',
        },
      },
      yLeft: {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'Clicks',
        },
        ticks: {
          callback: (value) => `${value}`,
        },
      },
      yRight: {
        type: 'linear',
        position: 'right',
        title: {
          display: true,
          text: 'Impressions',
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: (value) => `${value}`,
        },
      },
      yCTR: {
        type: 'linear',
        position: 'left',
        offset: true, // Offset to avoid overlapping with yLeft
        title: {
          display: true,
          text: 'CTR (%)',
        },
        ticks: {
          callback: (value) => `${value}%`,
        },
      },
      yPosition: {
        type: 'linear',
        position: 'right',
        offset: true, // Offset to avoid overlapping with yRight
        title: {
          display: true,
          text: 'Position',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      {/* Total Metrics */}
      <div className="metrics-container">
        <div id="box1" className="metric-card">
          <h3>Total Clicks</h3>
          <p>{totalClicks}</p>
        </div>
        <div id="box2" className="metric-card">
          <h3>Total Impressions</h3>
          <p>{totalImpressions}</p>
        </div>
        <div id="box3" className="metric-card">
          <h3>Average CTR</h3>
          <p>{averageCTR}%</p>
        </div>
        <div id="box4" className="metric-card">
          <h3>Average Position</h3>
          <p>{averagePosition}</p>
        </div>
      </div>

      {/* Checkboxes for toggling visibility */}
      <div className="graph-toggle">
        <label>
          <input
            type="checkbox"
            checked={showClicks}
            onChange={() => setShowClicks((prev) => !prev)}
          />
          Show Clicks
        </label>
        <label>
          <input
            type="checkbox"
            checked={showImpressions}
            onChange={() => setShowImpressions((prev) => !prev)}
          />
          Show Impressions
        </label>
        <label>
          <input
            type="checkbox"
            checked={showCTR}
            onChange={() => setShowCTR((prev) => !prev)}
          />
          Show CTR
        </label>
        <label>
          <input
            type="checkbox"
            checked={showPosition}
            onChange={() => setShowPosition((prev) => !prev)}
          />
          Show Position
        </label>
      </div>

      {/* Line chart */}
      <div className="chart-container">
        {data && <Line data={chartData} options={options} />}
      </div>

      {/* Error Message */}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Dashboard;
