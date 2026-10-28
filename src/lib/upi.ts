export interface UpiSettings {
  upi_id: string | null;
  payee_name: string | null;
}

/**
 * Builds a standard UPI payment URI (NPCI format).
 * Works with any UPI app: PhonePe, GPay, Paytm, BHIM, etc.
 */
export const buildUpiUri = (opts: {
  payeeVpa: string;
  payeeName?: string | null;
  amount?: number | null;
  note?: string;
}) => {
  const params = new URLSearchParams();
  params.set('pa', opts.payeeVpa);
  if (opts.payeeName) params.set('pn', opts.payeeName);
  if (opts.amount && opts.amount > 0) {
    params.set('am', opts.amount.toFixed(2));
  }
  params.set('cu', 'INR');
  if (opts.note) params.set('tn', opts.note);
  return `upi://pay?${params.toString()}`;
};

/** Deep links that open a specific UPI app with the same payment intent. */
export const upiAppLinks = (upiUri: string) => ({
  phonepe: upiUri.replace('upi://pay', 'phonepe://pay'),
  gpay: upiUri.replace('upi://pay', 'tez://upi/pay'),
  generic: upiUri,
});
