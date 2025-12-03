# Drag and Drop with @dnd-kit

## Installation
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

## Basic Sortable List

### Setup
```jsx
import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { SortableItem } from './SortableItem';

function SortableList() {
  const [items, setItems] = useState(['1', '2', '3']);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items}
        strategy={verticalListSortingStrategy}
      >
        {items.map(id => <SortableItem key={id} id={id} />)}
      </SortableContext>
    </DndContext>
  );
}
```

### Sortable Item Component
```jsx
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableItem({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}
```

## Touch Device Support

```jsx
import {
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

const sensors = useSensors(
  useSensor(MouseSensor, {
    // Require mouse to move 10px before activating
    activationConstraint: {
      distance: 10,
    },
  }),
  useSensor(TouchSensor, {
    // Press delay of 250ms, with tolerance of 5px
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  }),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
);
```

## Drag Overlay

For smoother dragging experience:

```jsx
import { DragOverlay } from '@dnd-kit/core';

function SortableList() {
  const [activeId, setActiveId] = useState(null);
  const [items, setItems] = useState(['1', '2', '3']);

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map(id => <SortableItem key={id} id={id} />)}
      </SortableContext>

      <DragOverlay>
        {activeId ? <Item id={activeId} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
```

## Event Handlers

```jsx
<DndContext
  onDragStart={(event) => {
    console.log('Drag started:', event.active.id);
  }}
  onDragMove={(event) => {
    // Fires continuously during drag
  }}
  onDragOver={(event) => {
    console.log('Over droppable:', event.over?.id);
  }}
  onDragEnd={(event) => {
    console.log('Dropped:', event.active.id, 'over', event.over?.id);
  }}
  onDragCancel={() => {
    console.log('Drag cancelled');
  }}
>
```

## Horizontal List

```jsx
import { horizontalListSortingStrategy } from '@dnd-kit/sortable';

<SortableContext
  items={items}
  strategy={horizontalListSortingStrategy}
>
  {items.map(id => <SortableItem key={id} id={id} />)}
</SortableContext>
```

## Multiple Containers (Kanban)

```jsx
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

function Kanban() {
  const [containers, setContainers] = useState({
    todo: ['task-1', 'task-2'],
    doing: ['task-3'],
    done: ['task-4'],
  });

  function findContainer(id) {
    if (id in containers) return id;
    return Object.keys(containers).find(key =>
      containers[key].includes(id)
    );
  }

  function handleDragOver(event) {
    const { active, over } = event;
    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over?.id);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    // Move item between containers
    setContainers(prev => {
      const activeItems = [...prev[activeContainer]];
      const overItems = [...prev[overContainer]];

      const activeIndex = activeItems.indexOf(active.id);
      activeItems.splice(activeIndex, 1);
      overItems.push(active.id);

      return {
        ...prev,
        [activeContainer]: activeItems,
        [overContainer]: overItems,
      };
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {/* Render containers */}
    </DndContext>
  );
}
```

## Accessibility Announcements

```jsx
const announcements = {
  onDragStart({ active }) {
    return `Picked up draggable item ${active.id}.`;
  },
  onDragOver({ active, over }) {
    if (over) {
      return `Draggable item ${active.id} was moved over droppable area ${over.id}.`;
    }
    return `Draggable item ${active.id} is no longer over a droppable area.`;
  },
  onDragEnd({ active, over }) {
    if (over) {
      return `Draggable item was dropped over droppable area ${over.id}`;
    }
    return `Draggable item ${active.id} was dropped.`;
  },
  onDragCancel({ active }) {
    return `Dragging was cancelled. Draggable item ${active.id} was dropped.`;
  },
};

<DndContext
  accessibility={{ announcements }}
>
```

## Styling During Drag

```jsx
export function SortableItem({ id }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isSorting,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        ${isDragging ? 'shadow-lg ring-2 ring-accent-coral' : ''}
        ${isSorting ? 'transition-transform' : ''}
      `}
      {...attributes}
      {...listeners}
    >
      {/* content */}
    </div>
  );
}
```

## Golf Okay Timeline Example

```jsx
function InteractiveTimeline({ days, onReorder, onEdit }) {
  const [items, setItems] = useState(days);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = items.findIndex(d => d.id === active.id);
      const newIndex = items.findIndex(d => d.id === over.id);
      const newOrder = arrayMove(items, oldIndex, newIndex);
      setItems(newOrder);
      onReorder?.(newOrder);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map(d => d.id)} strategy={verticalListSortingStrategy}>
        {items.map((day, index) => (
          <TimelineDay
            key={day.id}
            day={day}
            index={index}
            onEdit={onEdit}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}
```
