import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const PerformanceBar = ({ labels = ['DBMS', 'Algo', 'OS'], scores = [78, 85, 62] }) => {
  const data = {
    labels,
    datasets: [
      {
        label: 'Performance %',
        data: scores,
        backgroundColor: '#3B82F6',
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { min: 0, max: 100 },
    },
  };

  return (
    <div className="h-64 w-full">
      <Bar data={data} options={options} />
    </div>
  );
};
