export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

export const isExpired = (dateString: string) => {
  const today = new Date();
  const expiryDate = new Date(dateString);
  return expiryDate < today;
};

export const isExpiringSoon = (dataVencimento: string) => {
  const today = new Date();
  const expiry = new Date(dataVencimento);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 30 && diffDays >= 0;
};

export const isNearExpiry = (dateString: string) => {
  const today = new Date();
  const expiryDate = new Date(dateString);
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 30 && diffDays >= 0;
};