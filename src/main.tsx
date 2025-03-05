import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { PostHogProvider } from 'posthog-js/react'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { PostHogConfig } from 'posthog-js'

// Create a new router instance
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const options: Partial<PostHogConfig> = {
  api_host: import.meta.env.VITE_APP_PUBLIC_POSTHOG_HOST,
  person_profiles: 'always',
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <PostHogProvider
        apiKey={import.meta.env.VITE_APP_PUBLIC_POSTHOG_KEY}
        options={options}
      >
        <RouterProvider router={router} />
      </PostHogProvider>
    </StrictMode>
  )
}
