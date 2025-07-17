
/**
 * Re-export all extraction patterns from the patterns module
 * This file maintains backward compatibility while patterns are organized in separate modules
 */

export {
  extractVatNumber,
  extractClientName,
  extractIssuer,
  extractDate,
  extractInvoiceNumber,
  extractAmount,
  extractCurrency
} from './patterns';
