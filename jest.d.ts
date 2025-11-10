import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveClass(...classNames: string[]): R
      toHaveAttribute(attr: string, value?: string): R
      toBeVisible(): R
      toBeDisabled(): R
      toBeEnabled(): R
      toBeChecked(): R
      toBeEmpty(): R
      toBeInvalid(): R
      toBeRequired(): R
      toHaveValue(value: string | string[] | number): R
      toHaveTextContent(text: string | RegExp): R
      toHaveStyle(css: string | Record<string, any>): R
    }
  }
}

export {}