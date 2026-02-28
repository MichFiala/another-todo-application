import { useEffect, useState } from "react";
import "./App.css";
import {
  AppShell,
  Avatar,
  Badge,
  Button,
  ButtonGroup,
  Checkbox,
  Group,
  Loader,
  Paper,
  ScrollArea,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
  Typography,
} from "@mantine/core";
import { Card } from "./Card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TodoTaskDto, TodoTaskDtoRecord } from "../src/api-client/api";
import LoginButton from "./LoginButton";
import { useAuthenticatedUser } from "./authHook";
import useApi from "./apiT";
import { NewTodoCard } from "./NewTodoCard";
import { List, LogOut, PlusCircle, Shuffle } from "react-feather";
import { TasksSSEListener } from "./TasksSSEListener";
import { ToastContainer, toast } from "react-toastify";

export function useTasks(enabled = true) {
  const api = useApi();
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const response = await api.tasksGet();
      return response.data.sort((a, b) => {
        if (a.order > b.order) return -1;
        if (a.order < b.order) return 1;
        return 0;
      });
    },
    enabled,
  });
}

function App() {
  const queryClient = useQueryClient();
  const api = useApi();

  const [newTodoItem, setNewTodoItem] = useState<TodoTaskDto | null>(null);
  const [showTable, setShowTable] = useState<boolean>(() => {
    // getting stored value
    const saved = localStorage.getItem("showTable");

    if (!saved) return false;

    const initialValue = JSON.parse(saved);

    return initialValue || false;
  });

  useEffect(() => {
    localStorage.setItem("showTable", JSON.stringify(showTable));
  }, [showTable]);

  const {
    user,
    accessToken,
    isAuthenticated,
    isLoading: isLoadingAuth,
    logout,
  } = useAuthenticatedUser();

  const { data: tasks, isLoading } = useTasks(isAuthenticated && !!accessToken);

  const activeTasks = tasks?.filter((t) => t.state === "Active");

  useEffect(() => {
    if (
      tasks?.filter((t) => t.state === "Active") &&
      tasks?.filter((t) => t.state === "Active").length == 0
    ) {
      setNewTodoItem({
        name: "",
        description: "",
        estimatedTime: 0,
      });
    }
  }, [tasks]);

  const finishedTasks = tasks
    ?.filter((t) => t.state === "Finished")
    .sort((a, b) => {
      return a.finishedAt! < b.finishedAt! ? -1 : 1;
    });

  const mutation = useMutation({
    mutationFn: async (newTodo: TodoTaskDto) => {
      setNewTodoItem(null);
      const response = await api.tasksPost(newTodo);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Úkol přidán");
      return response;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (item: TodoTaskDtoRecord) => {
      setNewTodoItem(null);
      const response = await api.tasksIdDelete(item.id);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.info("Úkol smazán");
      return response;
    },
  });

  const updateStateMutation = useMutation({
    mutationFn: async ({ id, state }: { id: number; state: string }) => {
      const response = await api.tasksIdStatePut(id, state as any);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      if (state === "Finished") {
        toast.success("Úkol dokončen!");
      } else {
        toast.info("Úkol odložen");
      }
      return response;
    },
  });

  const shuffleMutation = useMutation({
    mutationFn: async () => {
      const response = await api.tasksShufflePut();
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Úkoly byli zamíchány");
      return response;
    },
  });

  return (
    <>
      {isLoadingAuth && (
        <Stack align="center" justify="center" h={"100vh"}>
          <Loader color="blue" />
        </Stack>
      )}
      {!isLoadingAuth && (
        <AppShell padding="md">
          {isAuthenticated && accessToken && (
            <TasksSSEListener accessToken={accessToken} />
          )}
          {!isAuthenticated && (
            <Group m={20} justify="space-between" className="card">
              <Group>
                <Avatar src={"/favicon.ico"} />
                <Typography fz={"h3"}>Welcome to Another Todo App!</Typography>
              </Group>
              <LoginButton />
            </Group>
          )}
          {isAuthenticated && (
            <AppShell.Main>
              <SimpleGrid cols={2}>
                <ButtonGroup>
                  <Tooltip label="Přidat úkol">
                    <Button
                      m={10}
                      size="md"
                      // variant="light"
                      onClick={() =>
                        setNewTodoItem({
                          name: "",
                          description: "",
                          estimatedTime: 0,
                        })
                      }
                      disabled={isLoading}
                    >
                      <PlusCircle />
                    </Button>
                  </Tooltip>
                  <Tooltip label="Zamíchat úkoly">
                    <Button
                      m={10}
                      size="md"
                      onClick={() => shuffleMutation.mutate()}
                      disabled={
                        !activeTasks || activeTasks.length <= 1 || isLoading
                      }
                    >
                      <Shuffle />
                    </Button>
                  </Tooltip>
                </ButtonGroup>
                <ButtonGroup>
                  <Tooltip label="Zobrazit hotové úkoly">
                    <Button
                      m={10}
                      variant="light"
                      c={"white"}
                      onClick={() => setShowTable(!showTable)}
                    >
                      <List />
                    </Button>
                  </Tooltip>
                  <Tooltip label="Odhlásit se">
                    <Button
                      m={10}
                      variant="light"
                      onClick={() =>
                        logout({
                          logoutParams: { returnTo: window.location.origin },
                        })
                      }
                      c={"white"}
                    >
                      <LogOut />
                    </Button>
                  </Tooltip>
                </ButtonGroup>
              </SimpleGrid>
              <SimpleGrid
                cols={{ base: 1, xs: 1, sm: 2, lg: 2, xl: 2 }}
              >
                {/* {isLoading && <Skeleton h={400}><Loader/></Skeleton>} */}
                  <Skeleton visible={isLoading} style={{ borderRadius: 12 }}>
                    <div className="card-stack">
                      {newTodoItem && (
                        <NewTodoCard
                          index={activeTasks?.length || 0}
                          item={newTodoItem}
                          onSave={(item) => {
                            mutation.mutate(item);
                          }}
                          canCancel={activeTasks && activeTasks!.length > 0}
                          cancel={() => setNewTodoItem(null)}
                        />
                      )}
                      {activeTasks?.map((item, i) => (
                        <Card
                          index={i}
                          item={item}
                          onFinish={() =>
                            updateStateMutation.mutate({
                              id: item.id,
                              state: "Finished",
                            })
                          }
                          canSnooze={activeTasks && activeTasks.length > 1}
                          onSnooze={() => {
                            updateStateMutation.mutate({
                              id: item.id,
                              state: "Active",
                            });
                          }}
                          onRemove={(item) => deleteMutation.mutate(item)}
                          key={i}
                        />
                      ))}
                    </div>
                  </Skeleton>
                {showTable && (
                  <Skeleton visible={isLoading} style={{ borderRadius: 12 }}>
                    <Paper
                      p="md"
                      radius="md"
                      style={{ backgroundColor: "#f7e7ce", color: "#344e41" }}
                    >
                      <Group justify="space-between" mb="sm">
                        <Title order={4} c="#344e41">
                          Dokončené úkoly - Dnes
                        </Title>
                        <Badge color="teal" variant="filled" radius="sm">
                          {finishedTasks?.length ?? 0}
                        </Badge>
                      </Group>
                      {finishedTasks?.length === 0 ? (
                        <Text c="dimmed" ta="center" py="xl">
                          Žádné dokončené úkoly
                        </Text>
                      ) : (
                        <ScrollArea>
                          <Table
                            striped
                            highlightOnHover
                            withTableBorder
                            withColumnBorders
                            styles={{
                              th: {
                                backgroundColor: "#84af9a",
                                color: "#f7e7ce",
                              },
                            }}
                          >
                            <Table.Thead>
                              <Table.Tr>
                                <Table.Th>Název</Table.Th>
                                <Table.Th>Popis</Table.Th>
                                {/* <Table.Th>Odhadovaný čas</Table.Th> */}
                                <Table.Th>Datum dokončení</Table.Th>
                              </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                              {finishedTasks?.map((element) => (
                                <Table.Tr key={`${element.name}-${element.id}`}>
                                  <Table.Td>{element.name}</Table.Td>
                                  <Table.Td>{element.description}</Table.Td>
                                  {/* <Table.Td>
                                  <Badge color="teal" variant="light">
                                    {element.estimatedTime} min
                                  </Badge>
                                </Table.Td> */}
                                  <Table.Td>
                                    {element.finishedAt
                                      ? `${new Date(
                                          element.finishedAt,
                                        ).toLocaleDateString()} - ${new Date(
                                          element.finishedAt,
                                        ).toLocaleTimeString()}`
                                      : "N/A"}
                                  </Table.Td>
                                </Table.Tr>
                              ))}
                            </Table.Tbody>
                          </Table>
                        </ScrollArea>
                      )}
                    </Paper>
                  </Skeleton>
                )}
              </SimpleGrid>
            </AppShell.Main>
          )}
          <ToastContainer
            position="bottom-center"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </AppShell>
      )}
    </>
  );
}

export default App;
