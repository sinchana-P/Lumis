import { render, screen } from '@testing-library/react';
import { FormField } from '../FormField';
import { Input } from '../Input';

describe('FormField', () => {
  it('renders label', () => {
    render(
      <FormField label="Email" name="email">
        <Input />
      </FormField>
    );
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('shows required indicator when required', () => {
    render(
      <FormField label="Email" name="email" required>
        <Input />
      </FormField>
    );
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('displays hint text', () => {
    render(
      <FormField label="Email" name="email" hint="Enter your email address">
        <Input />
      </FormField>
    );
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(
      <FormField label="Email" name="email" error="Email is required">
        <Input />
      </FormField>
    );
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('hides hint when error is present', () => {
    render(
      <FormField
        label="Email"
        name="email"
        hint="Enter your email"
        error="Email is required"
      >
        <Input />
      </FormField>
    );
    expect(screen.queryByText('Enter your email')).not.toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });
});
