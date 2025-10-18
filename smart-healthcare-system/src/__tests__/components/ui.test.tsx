/**
 * Unit Tests for React Components
 * Tests UI components and user interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
  }),
  usePathname: () => '/',
}));

describe('Component Tests', () => {
  describe('Login Form Validation', () => {
    it('should display error when email is empty', () => {
      const validateForm = (email: string, password: string) => {
        const errors: string[] = [];
        if (!email) errors.push('Email is required');
        if (!password) errors.push('Password is required');
        return errors;
      };

      const errors = validateForm('', 'password123');
      expect(errors).toContain('Email is required');
    });

    it('should display error when password is empty', () => {
      const validateForm = (email: string, password: string) => {
        const errors: string[] = [];
        if (!email) errors.push('Email is required');
        if (!password) errors.push('Password is required');
        return errors;
      };

      const errors = validateForm('test@test.com', '');
      expect(errors).toContain('Password is required');
    });

    it('should pass validation with valid credentials', () => {
      const validateForm = (email: string, password: string) => {
        const errors: string[] = [];
        if (!email) errors.push('Email is required');
        if (!password) errors.push('Password is required');
        return errors;
      };

      const errors = validateForm('test@test.com', 'password123');
      expect(errors.length).toBe(0);
    });
  });

  describe('Statistics Card Component', () => {
    const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon?: string }) => (
      <div className="stat-card" data-testid="stat-card">
        {icon && <span className="icon">{icon}</span>}
        <h3>{title}</h3>
        <p className="value">{value}</p>
      </div>
    );

    it('should render title and value correctly', () => {
      render(<StatCard title="Total Patients" value={150} />);
      
      expect(screen.getByText('Total Patients')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
    });

    it('should render icon when provided', () => {
      render(<StatCard title="Total Revenue" value="Rs. 4,890" icon="💰" />);
      
      expect(screen.getByText('💰')).toBeInTheDocument();
    });

    it('should handle string and number values', () => {
      const { rerender } = render(<StatCard title="Count" value={100} />);
      expect(screen.getByText('100')).toBeInTheDocument();

      rerender(<StatCard title="Count" value="100 patients" />);
      expect(screen.getByText('100 patients')).toBeInTheDocument();
    });
  });

  describe('Filter Component', () => {
    const FilterBar = ({ onFilter }: { onFilter: (filters: any) => void }) => {
      const [reportType, setReportType] = React.useState('patient-visits');
      const [department, setDepartment] = React.useState('');

      const handleSubmit = () => {
        onFilter({ reportType, department });
      };

      return (
        <div data-testid="filter-bar">
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)}
            data-testid="report-type-select"
          >
            <option value="patient-visits">Patient Visits</option>
            <option value="financial-summary">Financial Summary</option>
          </select>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="Department"
            data-testid="department-input"
          />
          <button onClick={handleSubmit} data-testid="filter-button">
            Filter
          </button>
        </div>
      );
    };

    it('should call onFilter with selected values', () => {
      const mockFilter = jest.fn();
      render(<FilterBar onFilter={mockFilter} />);

      const select = screen.getByTestId('report-type-select');
      const input = screen.getByTestId('department-input');
      const button = screen.getByTestId('filter-button');

      fireEvent.change(select, { target: { value: 'financial-summary' } });
      fireEvent.change(input, { target: { value: 'Cardiology' } });
      fireEvent.click(button);

      expect(mockFilter).toHaveBeenCalledWith({
        reportType: 'financial-summary',
        department: 'Cardiology',
      });
    });
  });

  describe('Table Component', () => {
    const DataTable = ({ data }: { data: any[] }) => (
      <table data-testid="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={2}>No data available</td>
            </tr>
          ) : (
            data.map((item, idx) => (
              <tr key={idx}>
                <td>{item.name}</td>
                <td>{item.email}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    );

    it('should render empty state when no data', () => {
      render(<DataTable data={[]} />);
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('should render data rows when data exists', () => {
      const testData = [
        { name: 'John Doe', email: 'john@test.com' },
        { name: 'Jane Smith', email: 'jane@test.com' },
      ];

      render(<DataTable data={testData} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@test.com')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('jane@test.com')).toBeInTheDocument();
    });
  });

  describe('Button Component', () => {
    const Button = ({ 
      children, 
      onClick, 
      disabled = false,
      variant = 'primary'
    }: { 
      children: React.ReactNode; 
      onClick: () => void;
      disabled?: boolean;
      variant?: string;
    }) => (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`btn btn-${variant}`}
        data-testid="custom-button"
      >
        {children}
      </button>
    );

    it('should call onClick when clicked', () => {
      const mockClick = jest.fn();
      render(<Button onClick={mockClick}>Click Me</Button>);

      const button = screen.getByTestId('custom-button');
      fireEvent.click(button);

      expect(mockClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const mockClick = jest.fn();
      render(<Button onClick={mockClick} disabled>Click Me</Button>);

      const button = screen.getByTestId('custom-button');
      fireEvent.click(button);

      expect(mockClick).not.toHaveBeenCalled();
    });

    it('should apply correct variant class', () => {
      render(<Button onClick={() => {}} variant="secondary">Click Me</Button>);

      const button = screen.getByTestId('custom-button');
      expect(button.className).toContain('btn-secondary');
    });
  });
});
