import { render } from '@testing-library/react';

// Simple test to check if React is working
test('renders without crashing', () => {
  const div = document.createElement('div');
  const TestComponent = () => <div>Test Component</div>;
  render(<TestComponent />);
  // If we get here, the test passed
  expect(true).toBe(true);
});
