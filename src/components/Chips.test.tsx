import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PriorityChip, SiteChip, StatusChip } from './Chips';

describe('chips', () => {
  it('renders human readable status labels', () => {
    render(<StatusChip status="in_review" />);
    expect(screen.getByText('In review')).toBeInTheDocument();
  });

  it('renders the breaking priority', () => {
    render(<PriorityChip priority="breaking" />);
    expect(screen.getByText('Breaking')).toBeInTheDocument();
  });

  it('shortens site names on request', () => {
    render(
      <>
        <SiteChip siteId="herald" />
        <SiteChip siteId="herald" short />
      </>,
    );
    expect(screen.getByText('The Daily Herald')).toBeInTheDocument();
    expect(screen.getByText('Daily Herald')).toBeInTheDocument();
  });
});
