export const isEmail = (value: string): boolean => {
  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

export const isMobileNumber = (value: string): boolean => {
  // Indian mobile numbers (10 digits, optional +91)
  const mobileRegex =
    /^(\+91)?[6-9]\d{9}$/;
  return mobileRegex.test(value);
};
