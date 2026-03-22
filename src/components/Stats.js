import React from 'react';

const stats = [
  { id: 'projects', number: '100+', label: 'Projects Completed' },
  { id: 'clients', number: '92+', label: 'Happy Customers' },
  { id: 'team', number: '10+', label: 'Team Members' },
  { id: 'experience', number: '5+', label: 'Years of Experience' },
];

const Stats = () => {
  return (
    <section className="stats">
      <div className="stats-container">
        {stats.map((stat) => (
          <div key={stat.id} className="stat-item">
            <h3 className="stat-number">{stat.number}</h3>
            <p className="stat-label">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Stats;
