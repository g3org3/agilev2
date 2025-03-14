import { startRegistration, startAuthentication } from '@simplewebauthn/browser'

const baseUrl = 'https://auth.jorgeadolfo.com'

export async function registerPasskey(email?: string) {
  if (!email) throw new Error('Email not found')

  const res = await fetch(
    `${baseUrl}/generate-options/registration?email=${email}`
  )
  const optionsJSON = await res.json()

  // console.log('generate-options', optionsJSON)
  const re = await startRegistration({ optionsJSON })

  // console.log('start-registration', re)
  const answ = await fetch(
    `${baseUrl}/verification/registration?email=${email}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(re),
    }
  ).then((r) => r.json())

  return answ.verified
}

export async function authenticateWithPasskey(email: string) {
  const optionsJSON = await fetch(
    `${baseUrl}/generate-options/authentication?email=${email}`
  ).then((r) => r.json())

  const re = await startAuthentication({
    optionsJSON,
    useBrowserAutofill: true,
  })

  console.log(re)

  const answ = await fetch(
    `${baseUrl}/verification/authentication?email=${email}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(re),
    }
  ).then((r) => r.json())

  if (!answ.verified) {
    throw new Error(JSON.stringify(answ))
  }

  return { email, re }
}
