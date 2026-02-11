import { Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

export default function AuthRoutesLayout() {
  const { isLoaded } = useAuth();

  if (!isLoaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
