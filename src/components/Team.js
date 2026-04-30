import React from 'react';

const defaultTeam = [
  { id: 1, name: 'Aryan Raj', role: 'Full Stack Developer', image: '/team/aryan.png' },
  { id: 2, name: 'Aman Raj', role: 'Website Designer & Digital Marketer', image: '/team/aman.png' },
  { id: 3, name: 'Sumit Pandey', role: 'Website Developer', image: '/team/sumit.png' },
  { id: 4, name: 'Shubham Bora', role: 'Senior SEO Executive', image: '/team/shubham.png' },
];

const Team = () => {
  const team = defaultTeam;

  return (
    <section className="team">
      <div className="team-container">
        <div className="team-header">
          <p className="team-label">TEAM</p>
          <h2 className="team-title">Our Team</h2>
        </div>

        <div className="team-grid">
          {team.map((member) => (
            <div key={member.id} className="team-card">
              <div className="team-image">
                <img 
                  src={member.image} 
                  alt={member.name}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect width="300" height="300" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="%23999"%3E' + member.name + '%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
              <div className="team-info">
                <h3 className="team-member-name">{member.name}</h3>
                <p className="team-member-role">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
