import { Button, Stack, Textarea, TextInput } from "@mantine/core";
import React from "react";
import { TodoTaskDto, TodoTaskDtoRecord } from "./api-client";
import { ArrowLeft, Check } from "react-feather";

export function NewTodoCard({
  item,
  index,
  onSave,
  cancel,
  canCancel,
}: {
  item: TodoTaskDtoRecord | TodoTaskDto;
  index: number;
  onSave: (item: TodoTaskDto) => void;
  cancel?: () => void;
  canCancel?: boolean;
}) {
  const [newItem, setNewItem] = React.useState<TodoTaskDto | null>(
    item as TodoTaskDto,
  );

  return (
    <Stack
      key={index}
      className="card"
      style={{
        zIndex: 1000 + index,
        transform: `translateX(${(index > 3 ? 2 : index) * 7}px)`,
      }}
      align="stretch"
      gap="md"
      mr={30}
    >
      {newItem && onSave && cancel && (
        <Stack m={20}>
          <TextInput
            placeholder="Název úkolu"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          />
          <Textarea
            placeholder="Popis úkolu"
            value={newItem.description}
            onChange={(e) =>
              setNewItem({ ...newItem, description: e.target.value })
            }
          />
          {/* <NumberInput
            placeholder="Odhadovaný čas (minuty)"
            value={newItem.estimatedTime}
            onChange={(value) =>
              setNewItem({ ...newItem, estimatedTime: value as number })
            }
          /> */}
          <Button
            variant="light"
            size="lg"
            onClick={() => onSave(newItem)}
            c={"green"}
          >
            <Check />
          </Button>

          {canCancel && (
            <Button variant="light" size="lg" onClick={cancel} c={"blue"}>
              <ArrowLeft />
            </Button>
          )}
        </Stack>
      )}
    </Stack>
  );
}
