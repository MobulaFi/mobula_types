import { z } from 'zod';

/**
 * Recursively strips Zod effects (transforms, defaults, refinements, preprocess)
 * from a schema, returning the underlying base type.
 *
 * Needed because OpenAPI generators cannot represent JS transforms/defaults.
 */
export function stripEffects(schema: z.ZodTypeAny): z.ZodTypeAny {
  if (schema instanceof z.ZodEffects) {
    return stripEffects(schema._def.schema);
  }
  if (schema instanceof z.ZodDefault) {
    return stripEffects(schema._def.innerType);
  }
  if (schema instanceof z.ZodOptional) {
    return stripEffects(schema._def.innerType).optional();
  }
  if (schema instanceof z.ZodNullable) {
    return stripEffects(schema._def.innerType).nullable();
  }
  return schema;
}

/**
 * Unwraps top-level effects (transform, refine) to get the underlying ZodObject.
 */
function unwrapToObject(schema: z.ZodTypeAny): z.ZodObject<z.ZodRawShape> {
  if (schema instanceof z.ZodObject) return schema;
  if (schema instanceof z.ZodEffects) return unwrapToObject(schema._def.schema);
  throw new Error(`createOpenAPIParams: expected ZodObject at base, got ${schema.constructor.name}`);
}

/**
 * Creates an OpenAPI-compatible schema from a runtime Zod object schema.
 *
 * 1. Unwraps top-level transforms/refinements
 * 2. Omits hidden fields (deprecated, internal)
 * 3. Strips per-field transforms/defaults
 * 4. Adds descriptions for documentation
 *
 * @example
 * ```ts
 * export const MySchemaOpenAPI = createOpenAPIParams(MyRuntimeSchema, {
 *   omit: ['blockchain', '_internalField'],
 *   describe: {
 *     wallet: 'Wallet address',
 *     blockchains: 'Comma-separated blockchain IDs',
 *   },
 * });
 * ```
 */
export function createOpenAPIParams(
  runtimeSchema: z.ZodTypeAny,
  options: {
    omit?: string[];
    describe?: Record<string, string>;
  },
): z.ZodObject<z.ZodRawShape> {
  const base = unwrapToObject(runtimeSchema);
  const shape = base.shape;
  const newShape: Record<string, z.ZodTypeAny> = {};
  const omitSet = new Set(options.omit ?? []);

  for (const [key, value] of Object.entries(shape)) {
    if (omitSet.has(key)) continue;

    let cleaned = stripEffects(value as z.ZodTypeAny);

    const desc = options.describe?.[key];
    if (desc) {
      cleaned = cleaned.describe(desc);
    }

    newShape[key] = cleaned;
  }

  return z.object(newShape);
}

/**
 * Utility type: Omit hidden fields from SDK input types.
 * Use this to hide deprecated/internal fields from TypeScript autocomplete.
 *
 * @example
 * ```ts
 * export type MyParams = SDKInput<typeof MySchema, 'blockchain' | '_internalFlag'>;
 * ```
 */
export type SDKInput<T extends z.ZodTypeAny, Hidden extends string> = Omit<z.input<T>, Hidden>;
