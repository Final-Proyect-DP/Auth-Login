const validateUpdateFields = (data) => {
  const requiredFields = [
    'username',
    'firstName',
    'lastName',
    'address',
    'phone',
    'semester',
    'parallel',
    'career',
    'description'
  ];

  const missingFields = requiredFields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
  }
  
  return true;
};

module.exports = {
  validateUpdateFields
};