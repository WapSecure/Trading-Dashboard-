import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from '../ErrorBoundary'

const ThrowError = ({ message = 'Test error' }: { message?: string }) => {
  throw new Error(message)
}

const originalError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalError
})

describe('ErrorBoundary', () => {
  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Normal content')).toBeInTheDocument()
  })

  it('should render fallback when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Component Error')).toBeInTheDocument()
    expect(screen.getByText(/We're having trouble loading this content/)).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error message')).toBeInTheDocument()
  })

  it('should recover from error when Try Again is clicked', () => {
    const GoodComponent = () => <div>Recovered content</div>
    
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    fireEvent.click(screen.getByText('Try Again'))

    rerender(
      <ErrorBoundary>
        <GoodComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Recovered content')).toBeInTheDocument()
  })

  it('should display component name when provided', () => {
    render(
      <ErrorBoundary componentName="Price Chart">
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Price Chart Error')).toBeInTheDocument()
  })

  it('should reload page when Reload Page is clicked', () => {
    const reloadMock = jest.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      configurable: true, // Add this
    })

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    fireEvent.click(screen.getByText('Reload Page'))
    expect(reloadMock).toHaveBeenCalledTimes(1)
  })
})