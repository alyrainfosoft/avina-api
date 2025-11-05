import { fieldStringChain } from "../common-validation-rules";

export const infoSectionRules = [
  fieldStringChain("Description", "description"),
  fieldStringChain("Info Key", "info_key"),
];
