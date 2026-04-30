import { RouteInfo } from './types';
import { getResponseAnnotations } from './routeResponseAnnotator';
import { getParamAnnotations } from './routeParamAnnotator';
import { getQueryParams } from './routeQueryAnnotator';
import { getBodyAnnotation } from './routeBodyAnnotator';
import { getSecuritySchemes } from './routeSecurityAnnotator';
import { getTagsForRoute } from './routeTagging';

export interface OpenApiDocument {
  openapi: string;
  info: { title: string; version: string; description?: string };
  paths: Record<string, Record<string, OpenApiOperation>>;
}

export interface OpenApiOperation {
  summary?: string;
  tags?: string[];
  parameters?: OpenApiParameter[];
  requestBody?: object;
  responses: Record<string, { description: string; content?: object }>;
  security?: object[];
  deprecated?: boolean;
}

export interface OpenApiParameter {
  name: string;
  in: 'path' | 'query' | 'header';
  required: boolean;
  schema: { type: string };
  description?: string;
}

export function buildOpenApiPaths(
  routes: RouteInfo[]
): Record<string, Record<string, OpenApiOperation>> {
  const paths: Record<string, Record<string, OpenApiOperation>> = {};

  for (const route of routes) {
    const openApiPath = route.path.replace(/:([\w]+)/g, '{$1}');
    if (!paths[openApiPath]) paths[openApiPath] = {};

    const method = route.method.toLowerCase();
    const key = `${route.method}:${route.path}`;

    const paramAnnotations = getParamAnnotations(route.method, route.path) ?? {};
    const queryAnnotations = getQueryParams(route.method, route.path) ?? {};
    const bodyAnnotation = getBodyAnnotation(route.method, route.path);
    const responseAnnotations = getResponseAnnotations(route.method, route.path) ?? {};
    const securitySchemes = getSecuritySchemes(route.method, route.path);
    const tags = getTagsForRoute(route.method, route.path);

    const pathParams: OpenApiParameter[] = Object.entries(paramAnnotations).map(
      ([name, meta]: [string, any]) => ({
        name,
        in: 'path',
        required: true,
        schema: { type: meta.type ?? 'string' },
        description: meta.description,
      })
    );

    const queryParams: OpenApiParameter[] = Object.entries(queryAnnotations).map(
      ([name, meta]: [string, any]) => ({
        name,
        in: 'query',
        required: meta.required ?? false,
        schema: { type: meta.type ?? 'string' },
        description: meta.description,
      })
    );

    const responses: Record<string, { description: string }> =
      Object.keys(responseAnnotations).length > 0
        ? Object.fromEntries(
            Object.entries(responseAnnotations).map(([code, desc]: [string, any]) => [
              code,
              { description: typeof desc === 'string' ? desc : desc.description ?? '' },
            ])
          )
        : { '200': { description: 'OK' } };

    const operation: OpenApiOperation = {
      tags: tags.length > 0 ? tags : undefined,
      parameters: [...pathParams, ...queryParams],
      responses,
      deprecated: route.deprecated ?? false,
    };

    if (bodyAnnotation) {
      operation.requestBody = {
        required: true,
        content: { 'application/json': { schema: bodyAnnotation } },
      };
    }

    if (securitySchemes && securitySchemes.length > 0) {
      operation.security = securitySchemes.map((s: string) => ({ [s]: [] }));
    }

    paths[openApiPath][method] = operation;
  }

  return paths;
}

export function generateOpenApiDocument(
  routes: RouteInfo[],
  info: { title: string; version: string; description?: string }
): OpenApiDocument {
  return {
    openapi: '3.0.3',
    info,
    paths: buildOpenApiPaths(routes),
  };
}
