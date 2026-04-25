export { extractRoutes } from './routeExtractor';
export { generateDoc, generateMarkdown } from './docGenerator';
export { startWatcher, stopWatcher } from './syncWatcher';
export { writeDocumentation, readDocumentation, writeIfChanged } from './outputWriter';
export { routewatch, stopRoutewatch } from './middlewareFactory';
export { validateRoute, validateRoutes } from './schemaValidator';
export { filterRoutes, groupRoutesByPrefix, deduplicateRoutes } from './routeFilter';
export { formatAsJson, formatAsMarkdown, formatAsSummary } from './routeFormatter';
export { compareRoutes, hasRouteChanges, formatDiffSummary } from './routeComparator';
export { setCachedRoutes, getCachedRoutes, isCacheStale, hasCacheChanged } from './routeCache';
export { configureLogger, log, logRoutesDetected } from './routeLogger';
export { exportRoutes, renderContent } from './routeExporter';
export { runHealthCheck } from './routeHealthCheck';
export { markDeprecated, isDeprecated, applyDeprecations } from './routeDeprecator';
export {
  extractVersionFromPath,
  groupRoutesByVersion,
  annotateVersions,
  getLatestVersion,
  filterByVersion,
} from './routeVersioner';
export type { VersionedRoute, VersionMap } from './routeVersioner';
export type { RouteInfo } from './types';
