import {
  Component,
  createElement,
  isValidElement,
} from "react";
import { createContext } from "react";

export const ErrorBoundaryContext = createContext(null);

const initialState = {
  didCatch: false,
  error: null,
};

export class ErrorBoundary extends Component {
  state = initialState;

  static getDerivedStateFromError(error) {
    return { didCatch: true, error };
  }

  resetErrorBoundary = (...args) => {
    const { error } = this.state;

    if ((error !== null) && this.props.onReset) {
      this.props.onReset({
        args,
        reason: "imperative-api",
      });

      this.setState(initialState);
    }
  };

  componentDidCatch(error, info) {
    if (this.props.onError) this.props.onError(error, info);
  }

  componentDidUpdate(
    prevProps,
    prevState,
  ) {
    const { didCatch } = this.state;
    const { resetKeys } = this.props;

    // There's an edge case where if the thing that triggered the error happens to *also* be in the resetKeys array,
    // we'd end up resetting the error boundary immediately.
    // This would likely trigger a second error to be thrown.
    // So we make sure that we don't check the resetKeys on the first call of cDU after the error is set.

    if (
      didCatch &&
      prevState.error !== null &&
      hasArrayChanged(prevProps.resetKeys, resetKeys) && 
      this.props.onReset
    ) {
      this.props.onReset({
        next: resetKeys,
        prev: prevProps.resetKeys,
        reason: "keys",
      });

      this.setState(initialState);
    }
  }

  render() {
    const { children, fallbackRender, FallbackComponent, fallback } =
      this.props;
    const { didCatch, error } = this.state;

    let childToRender = children;

    if (didCatch) {
      const props = {
        error,
        resetErrorBoundary: this.resetErrorBoundary,
      };

      if (isValidElement(fallback)) {
        childToRender = fallback;
      } else if (typeof fallbackRender === "function") {
        childToRender = fallbackRender(props);
      } else if (FallbackComponent) {
        childToRender = createElement(FallbackComponent, props);
      } else {
        throw new Error(
          "react-error-boundary requires either a fallback, fallbackRender, or FallbackComponent prop"
        );
      }
    }

    return createElement(
      ErrorBoundaryContext.Provider,
      {
        value: {
          didCatch,
          error,
          resetErrorBoundary: this.resetErrorBoundary,
        },
      },
      childToRender
    );
  }
}

function hasArrayChanged(a = [], b = []) {
  return (
    a.length !== b.length || a.some((item, index) => !Object.is(item, b[index]))
  );
}