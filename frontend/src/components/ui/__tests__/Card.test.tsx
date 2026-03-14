import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies hover styles when hover prop is true', () => {
    const { container } = render(<Card hover>Hoverable card</Card>);
    expect(container.firstChild).toHaveClass('hover:shadow-lg');
  });

  it('applies elevated background by default', () => {
    const { container } = render(<Card>Elevated card</Card>);
    expect(container.firstChild).toHaveClass('bg-surface-elevated');
  });

  it('renders with all sub-components', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>Card Content</CardContent>
      </Card>
    );

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Description')).toBeInTheDocument();
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });
});
