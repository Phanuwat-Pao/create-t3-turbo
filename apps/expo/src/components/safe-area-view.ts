import { SafeAreaView as SafeAreaContextView } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

/**
 * react-native-safe-area-context's SafeAreaView with className. Uniwind styles
 * only react-native's own components, so without this wrapper a screen's
 * "flex-1 bg-background" would be dropped.
 */
export const SafeAreaView = withUniwind(SafeAreaContextView);
