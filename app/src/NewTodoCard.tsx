import {
  Button,
  NumberInput,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import React from "react";
import { TodoTaskDto, TodoTaskDtoRecord } from "./api-client";
import { ArrowLeft, Check } from "react-feather";

export function NewTodoCard({
  item,
  index,
  onSave,
  cancel,
}: {
  item: TodoTaskDtoRecord | TodoTaskDto;
  index: number;
  onDoubleClick?: () => void;
  onMouseDown?: (event: React.MouseEvent) => void;
  onSave: (item: TodoTaskDto) => void;
  onRemove?: (item: TodoTaskDtoRecord) => void;
  cancel?: () => void;
}) {
  const [newItem, setNewItem] = React.useState<TodoTaskDto | null>(
    item as TodoTaskDto,
  );

  return (
    <Stack
      key={index}
      className="card"
      style={{
        zIndex: index,
        transform: `translateX(${(index % 3) * 4}px)`,
      }}
      align="stretch"
      gap="md"
    >
      {newItem && onSave && cancel && (
        <>
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
          <NumberInput
            placeholder="Odhadovaný čas (minuty)"
            value={newItem.estimatedTime}
            onChange={(value) =>
              setNewItem({ ...newItem, estimatedTime: value as number })
            }
          />
          <Button
            m={10}
            variant="light"
            size="lg"
            onClick={() => onSave(newItem)}
            c={"green"}
          >
            <Check />
          </Button>

          <Button m={10} variant="light" size="lg" onClick={cancel} c={"blue"}>
            <ArrowLeft />
          </Button>
        </>
      )}
    </Stack>
  );
}
