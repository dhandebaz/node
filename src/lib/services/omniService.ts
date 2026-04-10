import { omniConfigService } from "./omni/config";
import { omniAdminService } from "./omni/admin";
import { omniUserService } from "./omni/user";

// Unified Omni AI Orchestration Facade
export const omniService = {
  ...omniConfigService,
  ...omniAdminService,
  ...omniUserService,
};
