import { useEffect, useState } from 'react'

export const CURRENCIES = [
  { code: 'TRY', name: 'Turkey — Lira', flag: '🇹🇷', inflation: 65.0 },
  { code: 'UAH', name: 'Ukraine — Hryvnia', flag: '🇺🇦', inflation: 26.6 },
  { code: 'RON', name: 'Romania — Leu', flag: '🇷🇴', inflation: 10.4 },
  { code: 'ARS', name: 'Argentina — Peso', flag: '🇦🇷', inflation: 211.0 },
  { code: 'GEL', name: 'Georgia — Lari', flag: '🇬🇪', inflation: 9.5 },
  { code: 'NGN', name: 'Nigeria — Naira', flag: '🇳🇬', inflation: 28.9 },
  { code: 'AOA', name: 'Angola — Kwanza', flag: '🇦🇴', inflation: 20.0 },
  { code: 'ETB', name: 'Ethiopia — Birr', flag: '🇪🇹', inflation: 30.2 },
  { code: 'PKR', name: 'Pakistan — Rupee', flag: '🇵🇰', inflation: 29.0 },
  { code: 'EGP', name: 'Egypt — Pound', flag: '🇪🇬', inflation: 35.0 },
  { code: 'GHS', name: 'Ghana — Cedi', flag: '🇬🇭', inflation: 23.0 },
  { code: 'IDR', name: 'Indonesia — Rupiah', flag: '🇮🇩', inflation: 2.8 },
]

export function useCurrencyRate(currencyCode: string) {
  const [rate, setRate] = useState<number>(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRate() {
      try {
        const response = await fetch(
          `https://open.er-api.com/v6/latest/USD`
        )
        const data = await response.json()
        const fetchedRate = data.rates[currencyCode]
        if (fetchedRate) setRate(fetchedRate)
        setLoading(false)
      } catch (err) {
        setLoading(false)
      }
    }

    fetchRate()
  }, [currencyCode])

  return { rate, loading }
}