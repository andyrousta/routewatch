import { RouteInfo } from './routeExtractor';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SchemaRule {
  requireDescription?: boolean;
  requireParams?: boolean;
  requireResponseCodes?: boolean;
  allowedMethods?: string[];
}

const DEFAULT_RULES: SchemaRule = {
  requireDescription: false,
  requireParams: false,
  requireResponseCodes: false,
  allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
};

export function validateRoute(
  route: RouteInfo,
  rules: SchemaRule = DEFAULT_RULES
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!route.path || route.path.trim() === '') {
    errors.push('Route path must not be empty.');
  }

  if (!route.method || route.method.trim() === '') {
    errors.push('Route method must not be empty.');
  } else {
    const method = route.method.toUpperCase();
    const allowed = rules.allowedMethods ?? DEFAULT_RULES.allowedMethods!;
    if (!allowed.includes(method)) {
      errors.push(`Method "${method}" is not in the allowed list: ${allowed.join(', ')}.`);
    }
  }

  if (rules.requireDescription && (!route.description || route.description.trim() === '')) {
    errors.push(`Route ${route.method} ${route.path} is missing a description.`);
  }

  const paramMatches = route.path.match(/:([a-zA-Z0-9_]+)/g) ?? [];
  if (paramMatches.length > 0 && rules.requireParams) {
    warnings.push(
      `Route ${route.method} ${route.path} has path params but no param docs defined.`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateRoutes(
  routes: RouteInfo[],
  rules: SchemaRule = DEFAULT_RULES
): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  for (const route of routes) {
    const result = validateRoute(route, rules);
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}
