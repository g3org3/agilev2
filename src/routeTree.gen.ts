/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as RoadmapImport } from './routes/roadmap'
import { Route as OverviewImport } from './routes/overview'
import { Route as InvestigationsImport } from './routes/investigations'
import { Route as IndexImport } from './routes/index'
import { Route as SprintIdDailyImport } from './routes/$sprintId/daily'
import { Route as SprintIdAdminImport } from './routes/$sprintId/admin'

// Create/Update Routes

const RoadmapRoute = RoadmapImport.update({
  id: '/roadmap',
  path: '/roadmap',
  getParentRoute: () => rootRoute,
} as any)

const OverviewRoute = OverviewImport.update({
  id: '/overview',
  path: '/overview',
  getParentRoute: () => rootRoute,
} as any)

const InvestigationsRoute = InvestigationsImport.update({
  id: '/investigations',
  path: '/investigations',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const SprintIdDailyRoute = SprintIdDailyImport.update({
  id: '/$sprintId/daily',
  path: '/$sprintId/daily',
  getParentRoute: () => rootRoute,
} as any)

const SprintIdAdminRoute = SprintIdAdminImport.update({
  id: '/$sprintId/admin',
  path: '/$sprintId/admin',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/investigations': {
      id: '/investigations'
      path: '/investigations'
      fullPath: '/investigations'
      preLoaderRoute: typeof InvestigationsImport
      parentRoute: typeof rootRoute
    }
    '/overview': {
      id: '/overview'
      path: '/overview'
      fullPath: '/overview'
      preLoaderRoute: typeof OverviewImport
      parentRoute: typeof rootRoute
    }
    '/roadmap': {
      id: '/roadmap'
      path: '/roadmap'
      fullPath: '/roadmap'
      preLoaderRoute: typeof RoadmapImport
      parentRoute: typeof rootRoute
    }
    '/$sprintId/admin': {
      id: '/$sprintId/admin'
      path: '/$sprintId/admin'
      fullPath: '/$sprintId/admin'
      preLoaderRoute: typeof SprintIdAdminImport
      parentRoute: typeof rootRoute
    }
    '/$sprintId/daily': {
      id: '/$sprintId/daily'
      path: '/$sprintId/daily'
      fullPath: '/$sprintId/daily'
      preLoaderRoute: typeof SprintIdDailyImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/investigations': typeof InvestigationsRoute
  '/overview': typeof OverviewRoute
  '/roadmap': typeof RoadmapRoute
  '/$sprintId/admin': typeof SprintIdAdminRoute
  '/$sprintId/daily': typeof SprintIdDailyRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/investigations': typeof InvestigationsRoute
  '/overview': typeof OverviewRoute
  '/roadmap': typeof RoadmapRoute
  '/$sprintId/admin': typeof SprintIdAdminRoute
  '/$sprintId/daily': typeof SprintIdDailyRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/investigations': typeof InvestigationsRoute
  '/overview': typeof OverviewRoute
  '/roadmap': typeof RoadmapRoute
  '/$sprintId/admin': typeof SprintIdAdminRoute
  '/$sprintId/daily': typeof SprintIdDailyRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/investigations'
    | '/overview'
    | '/roadmap'
    | '/$sprintId/admin'
    | '/$sprintId/daily'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/investigations'
    | '/overview'
    | '/roadmap'
    | '/$sprintId/admin'
    | '/$sprintId/daily'
  id:
    | '__root__'
    | '/'
    | '/investigations'
    | '/overview'
    | '/roadmap'
    | '/$sprintId/admin'
    | '/$sprintId/daily'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  InvestigationsRoute: typeof InvestigationsRoute
  OverviewRoute: typeof OverviewRoute
  RoadmapRoute: typeof RoadmapRoute
  SprintIdAdminRoute: typeof SprintIdAdminRoute
  SprintIdDailyRoute: typeof SprintIdDailyRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  InvestigationsRoute: InvestigationsRoute,
  OverviewRoute: OverviewRoute,
  RoadmapRoute: RoadmapRoute,
  SprintIdAdminRoute: SprintIdAdminRoute,
  SprintIdDailyRoute: SprintIdDailyRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/investigations",
        "/overview",
        "/roadmap",
        "/$sprintId/admin",
        "/$sprintId/daily"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/investigations": {
      "filePath": "investigations.tsx"
    },
    "/overview": {
      "filePath": "overview.tsx"
    },
    "/roadmap": {
      "filePath": "roadmap.tsx"
    },
    "/$sprintId/admin": {
      "filePath": "$sprintId/admin.tsx"
    },
    "/$sprintId/daily": {
      "filePath": "$sprintId/daily.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
