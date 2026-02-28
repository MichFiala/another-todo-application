import { useEffect } from "react";
import { SSE } from "sse.js";
import { useQueryClient } from "@tanstack/react-query";

export function TasksSSEListener({ accessToken }: { accessToken: string }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log("Refreshing listener");

    const source = new SSE(
      `${process.env.REACT_APP_API_BASE_URL}/tasks/invalidate`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        autoReconnect: true,
        reconnectDelay: 3000,
        maxRetries: 3,
        useLastEventId: true,
      },
    );

    source.addEventListener("open", (e: any) => {
      if (source.lastEventId) {
        console.log(`Reconnected, resuming from event ${source.lastEventId}`);
      } else {
        console.log(`Connection opened`);
      }
    });

    source.addEventListener("message", function (e: any) {
      const payload = JSON.parse(e.data);

      console.log(payload);

      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    });

    source.addEventListener("error", () => {
      if (source.maxRetries && source.retryCount >= source.maxRetries) {
        console.log("Max retries reached, connection permanently closed");
      } else if (source.autoReconnect) {
        console.log(
          `Connection lost, will retry in ${source.reconnectDelay}ms`,
        );
        console.log(
          `Attempt ${source.retryCount + 1}${source.maxRetries ? "/" + source.maxRetries : ""}`,
        );
      }
    });

    return () => {
      source.close();
    };
  }, [accessToken]);

  return <></>;
}
