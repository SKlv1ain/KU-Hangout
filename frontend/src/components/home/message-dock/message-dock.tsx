'use client';

import { MessageDock, type Character } from '@/components/ui/shadcn-io/message-dock';

const customCharacters: Character[] = [
  { emoji: "✨", name: "Sparkle", online: false },
  {
    emoji: "🧙‍♂️",
    name: "Wizard",
    online: true,
    backgroundColor: "bg-emerald-200 dark:bg-emerald-300",
    gradientColors: "#a7f3d0, #ecfdf5",
  },
  {
    emoji: "🦄",
    name: "Unicorn",
    online: true,
    backgroundColor: "bg-violet-200 dark:bg-violet-300",
    gradientColors: "#c4b5fd, #f5f3ff",
  },
  {
    emoji: "🐵",
    name: "Monkey",
    online: true,
    backgroundColor: "bg-amber-200 dark:bg-amber-300",
    gradientColors: "#fde68a, #fffbeb",
  },
  {
    emoji: "🤖",
    name: "Robot",
    online: false,
    backgroundColor: "bg-rose-200 dark:bg-rose-300",
    gradientColors: "#fecaca, #fef2f2",
  },
];

export function MessageDockDemo() {
  const handleMessageSend = (message: string, character: Character, index: number) => {
    console.log("Message sent:", { message, character: character.name, index });
  };

  const handleCharacterSelect = (character: Character) => {
    console.log("Character selected:", character.name);
  };

  const handleDockToggle = (isExpanded: boolean) => {
    console.log("Dock expanded:", isExpanded);
  };

  return (
    <MessageDock 
      characters={customCharacters}
      onMessageSend={handleMessageSend}
      onCharacterSelect={handleCharacterSelect}
      onDockToggle={handleDockToggle}
      expandedWidth={400}
      placeholder={(name) => `Message ${name}...`}
      enableAnimations={true}
      closeOnSend={false}
      autoFocus={true}
    />
  );
}

