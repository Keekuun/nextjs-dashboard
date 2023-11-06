import useSWR from 'swr'
import { useRouter } from 'next/navigation'
const API_HOST = process.env.NEXT_PUBLIC_API_HOST
export function useFetch(...args: any[]) {
  const [url, ...rest] = args
  console.log('rest', rest)
  return fetch(API_HOST + url, {
    method: 'POST',
    headers: {
      Token: '383194ce-6265-4302-ac0e-9fb4e4c064691'
    }
  }).then((res) => res.json()).then(resp => {
    const {code, msg, data} = resp
    console.log('resp', resp)
    if(code === 0) {
      // router.push('/')
      window.location.href = '/dashboard/customers'
      return null
    }
    return data
  })
}
