import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card><p>Card content</p></Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Card className="custom-card"><p>Content</p></Card>);
    expect(screen.getByText('Content').closest('div')).toHaveClass('custom-card');
  });

  it('forwards ref', () => {
    const ref = { current: null };
    render(<Card ref={ref}><p>Content</p></Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('CardHeader', () => {
  it('renders children', () => {
    render(<CardHeader><h2>Title</h2></CardHeader>);
    expect(screen.getByText('Title')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<CardHeader className="header-custom"><p>Content</p></CardHeader>);
    expect(screen.getByText('Content').closest('div')).toHaveClass('header-custom');
  });
});

describe('CardTitle', () => {
  it('renders as h3', () => {
    render(<CardTitle>My Title</CardTitle>);
    const title = screen.getByText('My Title');
    expect(title.tagName).toBe('H3');
  });

  it('applies custom className', () => {
    render(<CardTitle className="title-custom">Title</CardTitle>);
    expect(screen.getByText('Title')).toHaveClass('title-custom');
  });
});

describe('CardDescription', () => {
  it('renders text', () => {
    render(<CardDescription>Description text</CardDescription>);
    expect(screen.getByText('Description text')).toBeInTheDocument();
  });
});

describe('CardContent', () => {
  it('renders children', () => {
    render(<CardContent><span>Content here</span></CardContent>);
    expect(screen.getByText('Content here')).toBeInTheDocument();
  });
});

describe('CardFooter', () => {
  it('renders children', () => {
    render(<CardFooter><button>Save</button></CardFooter>);
    expect(screen.getByText('Save')).toBeInTheDocument();
  });
});
