import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => any
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = fn(req, res, next);

      // Handle async errors
      if (result instanceof Promise) {
        result.catch((error) => {
          handleError(res, error);
        });
      }
    } catch (error) {
      // Handle sync errors
      handleError(res, error);
    }
  };
};

const handleError = (res: Response, error: unknown) => {
  console.error('Caught Error:', error);

  // Normalize error
  let message = 'Something went wrong';
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  res.status(500).json({
    success: false,
    message,
  });
};
