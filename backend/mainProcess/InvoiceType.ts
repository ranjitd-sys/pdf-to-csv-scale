export type InvoiceData = {
  order_number?: string
  invoice_number?: string
  bill_to_name?: string
  bill_to_address?: string
  bill_to_state?: string
  bill_to_pincode?: string
  place_of_supply_code?: string
  place_of_supply_state?: string
}

export type Ship = {
  ship_name: string
  ship_address: string
  ship_city: string
  ship_state: string
  ship_pincode: string
} | null


export type Product = {
  product_sn: string
  product_name: string
  product_hsn: string
  product_qty: string
  product_gross: string
  product_discount: string
  product_taxable_value: string
} | null


export type Seller = {
  seller_name: string
  address: string
  city: string
  state: string
  pincode: string
  gstin: string | null
}


export type InvoiceDates = {
  order_date: string | undefined
  invoice_date: string | undefined
}