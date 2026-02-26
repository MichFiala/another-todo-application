import { Button, Stack, Typography } from "@mantine/core";
import React from "react";
import { TodoTaskDto, TodoTaskDtoRecord } from "./api-client";
import { Check, Pause, Trash } from "react-feather";
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from "framer-motion";

const THRESHOLD = 200;
const ANIMATION_THRESHOLD = 300;

const MotionStack = motion(Stack);

export function Card({
  item,
  index,
  onFinish,
  onSnooze,
  onRemove,
}: {
  item: TodoTaskDtoRecord;
  index: number;
  onFinish?: () => void;
  onSnooze?: () => void;
  onRemove?: (item: TodoTaskDtoRecord) => void;
  cancel?: () => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const controls = useAnimation();

  const handleDragEnd = (
    _: any,
    info: { offset: { x: number; y: number } },
  ) => {
    if (info.offset.x > THRESHOLD) {
      controls
        .start({ x: ANIMATION_THRESHOLD, opacity: 0 })
        .then(() => onFinish?.());
    } else if (info.offset.x < -THRESHOLD) {
      controls
        .start({ x: -ANIMATION_THRESHOLD, opacity: 0 })
        .then(() => onRemove?.(item as any));
    } else {
      controls.start({ x: 0, y: 0, rotate: 0 }); // snap zpět
    }
  };

  return (
    <MotionStack
      key={index}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      className="card"
      style={{
        zIndex: index,
        transform: `translateX(${(index % 3) * 4}px)`,
        x,
        rotate,
        cursor: "grab",
      }}
      animate={controls}
      onDragEnd={handleDragEnd}
      align="stretch"
      justify="space-between"
      gap="md"
    >
      <Typography className="card-header">{item.name}</Typography>
      <Typography className="card-body">{item.description}</Typography>
      <Button.Group orientation="vertical">
        {onFinish && (
          <Button
            m={10}
            variant="light"
            size="lg"
            onClick={onFinish}
            c={"green"}
          >
            <Check />
          </Button>
        )}

        {onSnooze && (
          <Button
            m={10}
            variant="light"
            size="lg"
            onClick={onSnooze}
            c={"blue"}
          >
            <Pause />
          </Button>
        )}

        {onRemove && (
          <Button
            m={10}
            size="md"
            variant="light"
            onClick={() => onRemove(item as TodoTaskDtoRecord)}
            c={"red"}
          >
            <Trash />
          </Button>
        )}
      </Button.Group>
    </MotionStack>
    // </motion.div>
  );
}
