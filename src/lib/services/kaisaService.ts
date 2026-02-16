import { kaisaConfigService } from "./kaisa/config";
import { kaisaAdminService } from "./kaisa/admin";
import { kaisaUserService } from "./kaisa/user";

// Facade to maintain backward compatibility
export const kaisaService = {
  ...kaisaConfigService,
  ...kaisaAdminService,
  ...kaisaUserService,
};
