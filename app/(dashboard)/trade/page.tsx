import { redirect } from 'next/navigation'

export default function TradePage() {
  // Redirect to a default trading symbol
  redirect('/trade/RELIANCE')
}
