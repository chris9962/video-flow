import { mkdir, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import type { Workflow } from '@videoflow/shared';

// storage.ts nằm ở apps/server/src → lên 3 cấp là root repo
const defaultDir = path.join(import.meta.dirname, '..', '..', '..', 'data', 'workflows');

export class WorkflowStore {
  constructor(private readonly dir: string = defaultDir) {}

  private file(id: string): string {
    return path.join(this.dir, `${id}.json`);
  }

  async list(): Promise<Workflow[]> {
    await mkdir(this.dir, { recursive: true });
    const files = (await readdir(this.dir)).filter((f) => f.endsWith('.json'));
    return Promise.all(
      files.map(async (f) => JSON.parse(await readFile(path.join(this.dir, f), 'utf8')) as Workflow),
    );
  }

  async get(id: string): Promise<Workflow | null> {
    try {
      return JSON.parse(await readFile(this.file(id), 'utf8')) as Workflow;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw err;
    }
  }

  async save(workflow: Workflow): Promise<void> {
    await mkdir(this.dir, { recursive: true });
    await writeFile(this.file(workflow.id), JSON.stringify(workflow, null, 2));
  }

  async delete(id: string): Promise<void> {
    await rm(this.file(id), { force: true });
  }
}
