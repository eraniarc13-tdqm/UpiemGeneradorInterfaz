import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const LineChart = ({ label, dataValues, labels, color = '#75c0c0' }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
      x: { display: false }
    }
  };

  const data = {
    labels: labels && labels.length > 0 ? labels : new Array(dataValues.length).fill(''),
    datasets: [{
      label: label,
      data: dataValues,
      borderColor: color,
      backgroundColor: color + '33',
      fill: true,
      tension: 0.4,
      pointRadius: 0
    }]
  };

  return <Line options={options} data={data} />;
};

export default LineChart;