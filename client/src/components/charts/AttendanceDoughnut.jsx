import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export const AttendanceDoughnut = ({ present = 80, late = 5, absent = 15 }) => {
  const data = {
    labels: ['Present', 'Late', 'Absent'],
    datasets: [
      {
        data: [present, late, absent],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
    },
  };

  return (
    <div className="h-48 w-full flex items-center justify-center">
      <Doughnut data={data} options={options} />
    </div>
  );
};
