import { formatDate } from '../../../utils/date';
import type { IssueViewModel } from '../types';

interface IssueCardProps {
  issue: IssueViewModel;
}

export function IssueCard({ issue }: IssueCardProps) {
  return (
    <article className="issue-card">
      <div className="issue-card__heading">
        <span className={`issue-state issue-state--${issue.state}`}>
          {issue.state === 'open' ? 'Open' : 'Closed'}
        </span>
        <span className="issue-card__number">#{issue.number}</span>
      </div>
      <h3 className="issue-card__title">
        <a href={issue.githubUrl} target="_blank" rel="noopener noreferrer">
          {issue.title}
        </a>
      </h3>
      <p className="issue-card__metadata">
        {issue.author ? `Opened by ${issue.author.login}` : 'Author unavailable'}
        {' · '}Created {formatDate(issue.createdAt)}
        {' · '}Updated {formatDate(issue.updatedAt)}
      </p>
    </article>
  );
}
