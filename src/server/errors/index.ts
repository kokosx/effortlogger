type ServiceError = null | {
  message: string;
};

export const composeServiceError = (error: ServiceError, message: string) => {
  if (error) {
    return error;
  }
  return {
    message,
  } as ServiceError;
};
