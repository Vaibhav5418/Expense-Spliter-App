import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Charts = ({ expenses }) => {
  // Group expenses by month
  const monthlyTotals = Array(12).fill(0); // Jan to Dec

  expenses.forEach((expense) => {
    const date = new Date(expense.date);
    const month = date.getMonth(); // 0–11
    monthlyTotals[month] += expense.amount;
  });

  const data = {
    labels: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ],
    datasets: [
      {
        label: '₹ Spent per Month',
        data: monthlyTotals,
        backgroundColor: '#3498db',
        borderRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (val) => `₹${val}`,
        },
      },
    },
  };

  return (
    <div style={{ margin: '40px auto', maxWidth: '800px' }}>
      <h3 style={{ textAlign: 'center' }}>Monthly Expense Analytics</h3>
      <Bar data={data} options={options} />
    </div>
  );
};

export default Charts;
