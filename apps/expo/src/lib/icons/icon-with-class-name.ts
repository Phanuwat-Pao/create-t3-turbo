import type { LucideIcon } from "lucide-react-native";
import { withUniwind } from "uniwind";

/**
 * A Lucide icon that takes className. Uniwind returns a new component rather
 * than patching the icon, so export the result. The icon's colour is a prop,
 * not a style: set it with colorClassName and an accent- class.
 */
export function iconWithClassName(icon: LucideIcon) {
  return withUniwind(icon);
}
