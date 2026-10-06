import { formatDate } from '../../../utils/date';
import type { RepositoryViewModel } from '../types';

interface RepositoryMetadataProps {
  repository: RepositoryViewModel;
}

export function RepositoryMetadata({ repository }: RepositoryMetadataProps) {
  const metadata = [
    { label: 'Primary language', value: repository.language || 'Not specified' },
    { label: 'Created', value: formatDate(repository.createdAt) },
    { label: 'Last updated', value: formatDate(repository.updatedAt) },
    { label: 'Default branch', value: repository.defaultBranch },
  ];

  return (
    <section className="repository-metadata" aria-labelledby="repository-metadata-title">
      <h2 id="repository-metadata-title">About this repository</h2>
      <dl>
        {metadata.map((item) => (
          <div className="repository-metadata__item" key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
