import { formatNumber } from '../../../utils/format';
import type { RepositoryViewModel } from '../types';

interface RepositoryStatsProps {
  repository: RepositoryViewModel;
}

export function RepositoryStats({ repository }: RepositoryStatsProps) {
  const stats = [
    { label: 'Stars', value: repository.stars },
    { label: 'Forks', value: repository.forks },
    { label: 'Watchers', value: repository.watchers },
    { label: 'Open issues', value: repository.openIssues },
  ];

  return (
    <section className="repository-stats" aria-label="Repository statistics">
      {stats.map((stat) => (
        <div className="repository-stat" key={stat.label}>
          <span className="repository-stat__value">{formatNumber(stat.value, true)}</span>
          <span className="repository-stat__label">{stat.label}</span>
        </div>
      ))}
    </section>
  );
}
