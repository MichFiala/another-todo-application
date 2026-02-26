import { AppShell, Burger, Button, Group } from "@mantine/core";
import { useAuthenticatedUser } from "./authHook";
import { LogOut } from "react-feather";

export function AppHeader() {
  const { user, accessToken, isAuthenticated, isLoading, logout } =
    useAuthenticatedUser();

  return (
    <>
      {isAuthenticated && !isLoading && (
        <AppShell.Header className="app-header">
          <Group w="100%" px="md" justify="flex-end">
            <Button
              variant="transparent"
              onClick={() =>
                logout({
                  logoutParams: { returnTo: window.location.origin },
                })
              }
              size={"xl"}
              c={"white"}
            >
              <LogOut />
            </Button>
          </Group>
        </AppShell.Header>
      )}
    </>
  );
}
