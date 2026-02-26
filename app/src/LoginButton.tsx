import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@mantine/core";
import { User } from "react-feather";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();
  return (
    <Button onClick={() => loginWithRedirect()} variant="gradient">
      Log in <User />
    </Button>
  );
};

export default LoginButton;
