export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  req.validatedBody = result.data;
  next();
};
