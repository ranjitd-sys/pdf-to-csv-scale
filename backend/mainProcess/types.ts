export type CreditNoteMeta = {
  order_number?: string
  order_date?: string
  credit_note_no?: string
  credit_note_date?: string
  invoice_no?: string
  invoice_date?: string
}

export type Seller = {
  seller_name: string
  seller_city: string
  seller_state: string
  seller_pincode: string
  seller_gstin: string
}|null;


export type BillTo = {
  Bill_name: string | null
  place_of_supply_code: string | null
  place_of_supply_state: string | null
}

export type ShipTo = {
  name: string | undefined
  address: string
  city: string
  state: string
  pincode: string | undefined
  
} | null