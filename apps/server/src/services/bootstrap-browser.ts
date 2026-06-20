import { createBrowserPilot } from './browser-pilot';
import { setPilot } from './index';

export function bootstrapBrowserServices(): void {
  setPilot(createBrowserPilot());
}
