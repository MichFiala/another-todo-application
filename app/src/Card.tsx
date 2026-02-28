import {
  Button,
  Group,
  SimpleGrid,
  Stack,
  Tooltip,
  Typography,
} from "@mantine/core";
import { TodoTaskDtoRecord } from "./api-client";
import {
  Check,
  CheckCircle,
  Clock,
  Pause,
  Trash,
  XCircle,
} from "react-feather";
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from "framer-motion";

const THRESHOLD = 150;
const ANIMATION_THRESHOLD = 300;

const MotionStack = motion.create(Stack);

export function Card({
  item,
  index,
  onFinish,
  canSnooze,
  onSnooze,
  onRemove,
}: {
  item: TodoTaskDtoRecord;
  index: number;
  onFinish?: () => void;
  canSnooze?: boolean;
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
      controls.start({ x: (index % 3) * 7, y: 0, rotate: 0 });
    }
  };

  return (
    <MotionStack
      key={`${item.name}-${item.order}`}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      className="card"
      style={{
        zIndex: 999 + index,
        cursor: "grab",
      }}
      initial={{ x: (index >= 3 ? 2 : index) * 7 }}
      animate={controls}
      onDragEnd={handleDragEnd}
      align="stretch"
      justify="space-between"
      gap="md"
      mr={30}
    >
      <Stack m={20} align="center">
        <Typography className="card-header">{item.name}</Typography>
        <Typography className="card-body">{item.description}</Typography>
      </Stack>
      <SimpleGrid cols={3}  w={"100%"} mb={20}>
        {/* <Button.Group orientation="horizontal" w={"100%"} > */}
        {onRemove && (
          <Tooltip label="Smazat úkol">
            <Button
              variant="transparent"
              size="xl"
              onClick={() => onRemove(item as TodoTaskDtoRecord)}
              c={"red"}
            >
              <XCircle />
            </Button>
          </Tooltip>
        )}
        {onSnooze && (
          <Tooltip label="Odložit úkol">
            <Button
              variant="transparent"
              onClick={onSnooze}
              c={"blue"}
              disabled={!canSnooze}
              size="xl"
            >
              <Clock />
            </Button>
          </Tooltip>
        )}
        {onFinish && (
          <Tooltip label="Dokončit úkol">
            <Button
              variant="transparent"
              onClick={onFinish}
              c={"green"}
              size="xl"
            >
              <CheckCircle />
            </Button>
          </Tooltip>
        )}
        {/* </Button.Group> */}
      </SimpleGrid>
    </MotionStack>
    // </motion.div>
  );
}
