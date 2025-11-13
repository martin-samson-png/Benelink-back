import { Pool } from "mysql2/promise";

export class MissionsRepository {
  constructor(private readonly pool: Pool) {}
}
