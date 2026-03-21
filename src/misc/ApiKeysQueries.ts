export const API_KEYS_QUERIES = {
  SELECT_BY_NAME_AND_OWNER: `
    SELECT key FROM misc.api_keys
    WHERE name = $1
    AND deleted_at IS NULL
    AND (
      ($2::text IS NULL AND organization_id IS NULL AND customer_id = $3)
      OR
      (organization_id = $2)
    )
    LIMIT 1
  `,
  INSERT: `
    INSERT INTO misc.api_keys
      (key, customer_id, organization_id, name, total_calls, metrics, ip_rps_limit, tag)
    VALUES
      ($1, $2, $3, $4, 0, $5, $6, $7)
  `,
} as const;
