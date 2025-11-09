'use client';

import { cn } from "@/lib/utils";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

export interface Character {
  id?: string | number;
  emoji: string;
  name: string;
  online: boolean;
  backgroundColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  gradientColors?: string;
  avatar?: string;
}

export interface MessageDockProps {
  characters?: Character[];
  onMessageSend?: (message: string, character: Character, characterIndex: number) => void;
  onCharacterSelect?: (character: Character, characterIndex: number) => void;
  onDockToggle?: (isExpanded: boolean) => void;
  className?: string;
  expandedWidth?: number;
  position?: "bottom" | "top";
  showSparkleButton?: boolean;
  showMenuButton?: boolean;
  enableAnimations?: boolean;
  animationDuration?: number;
  placeholder?: (characterName: string) => string;
  theme?: "light" | "dark" | "auto";
  autoFocus?: boolean;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  closeOnSend?: boolean;
}

const defaultCharacters: Character[] = [
  { emoji: "✨", name: "Sparkle", online: false },
  {
    emoji: "🧙‍♂️",
    name: "Wizard",
    online: true,
    backgroundColor: "bg-emerald-200 dark:bg-emerald-300",
    gradientFrom: "from-emerald-200",
    gradientTo: "to-emerald-50",
    gradientColors: "#a7f3d0, #ecfdf5",
  },
  {
    emoji: "🦄",
    name: "Unicorn",
    online: true,
    backgroundColor: "bg-violet-200 dark:bg-violet-300",
    gradientFrom: "from-violet-200",
    gradientTo: "to-violet-50",
    gradientColors: "#c4b5fd, #f5f3ff",
  },
  {
    emoji: "🐵",
    name: "Monkey",
    online: true,
    backgroundColor: "bg-amber-200 dark:bg-amber-300",
    gradientFrom: "from-amber-200",
    gradientTo: "to-amber-50",
    gradientColors: "#fde68a, #fffbeb",
  },
  {
    emoji: "🤖",
    name: "Robot",
    online: false,
    backgroundColor: "bg-rose-200 dark:bg-rose-300",
    gradientFrom: "from-rose-200",
    gradientTo: "to-rose-50",
    gradientColors: "#fecaca, #fef2f2",
  },
];

const getGradientColors = (character: Character) => {
  return character.gradientColors || "#86efac, #dcfce7";
};

export function MessageDock({
  characters = defaultCharacters,
  onMessageSend,
  onCharacterSelect,
  onDockToggle,
  className,
  expandedWidth = 448,
  position = "bottom",
  showSparkleButton = true,
  showMenuButton = true,
  enableAnimations = true,
  animationDuration = 1,
  placeholder = (name: string) => `Message ${name}...`,
  theme = "light",
  autoFocus = true,
  closeOnClickOutside = true,
  closeOnEscape = true,
  closeOnSend = true,
}: MessageDockProps) {
  const shouldReduceMotion = useReducedMotion();
  const [expandedCharacter, setExpandedCharacter] = useState<number | null>(
    null
  );
  const [messageInput, setMessageInput] = useState("");
  const dockRef = useRef<HTMLDivElement>(null);
  const [collapsedWidth, setCollapsedWidth] = useState<number>(266);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (dockRef.current && !hasInitialized) {
      const width = dockRef.current.offsetWidth;
      if (width > 0) {
        setCollapsedWidth(width);
        setHasInitialized(true);
      }
    }
  }, [hasInitialized]);

  useEffect(() => {
    if (!closeOnClickOutside) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dockRef.current && !dockRef.current.contains(event.target as Node)) {
        setExpandedCharacter(null);
        setMessageInput("");
        onDockToggle?.(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeOnClickOutside, onDockToggle]);

  const containerVariants = {
    hidden: {
      opacity: 0,
      y: 100,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
        mass: 0.8,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const hoverAnimation = shouldReduceMotion
    ? { scale: 1.02 }
    : {
        scale: 1.05,
        y: -8,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 25,
        },
      };

  const handleCharacterClick = (index: number) => {
    const character = characters[index];
    
    if (expandedCharacter === index) {
      setExpandedCharacter(null);
      setMessageInput("");
      onDockToggle?.(false);
    } else {
      setExpandedCharacter(index);
      onCharacterSelect?.(character, index);
      onDockToggle?.(true);
    }
  };

  const handleSendMessage = () => {
    if (messageInput.trim() && expandedCharacter !== null) {
      const character = characters[expandedCharacter];
      
      onMessageSend?.(messageInput, character, expandedCharacter);
      
      setMessageInput("");
      
      if (closeOnSend) {
        setExpandedCharacter(null);
        onDockToggle?.(false);
      }
    }
  };

  const selectedCharacter =
    expandedCharacter !== null ? characters[expandedCharacter] : null;
  const isExpanded = expandedCharacter !== null;

  const defaultPositionClasses = position === "top" 
    ? "fixed top-6 left-1/2 -translate-x-1/2 z-50"
    : "fixed bottom-6 left-1/2 -translate-x-1/2 z-50";

  return (
    <motion.div
      ref={dockRef}
      className={cn(
        // Only apply default positioning if not overridden by className
        !className?.includes('relative') && !className?.includes('absolute') ? defaultPositionClasses : '',
        className
      )}
      initial={enableAnimations ? "hidden" : "visible"}
      animate="visible"
      variants={enableAnimations ? containerVariants : {}}
    >
      <motion.div
        className="rounded-full px-4 py-2 shadow-2xl border border-border bg-background/95 backdrop-blur-md"
        animate={{
          width: isExpanded ? expandedWidth : collapsedWidth,
          background: isExpanded && selectedCharacter
            ? `linear-gradient(to right, ${getGradientColors(selectedCharacter)})`
            : "hsl(var(--background))",
        }}
        transition={enableAnimations ? { 
          type: "spring", 
          stiffness: isExpanded ? 300 : 500, 
          damping: isExpanded ? 30 : 35, 
          mass: isExpanded ? 0.8 : 0.6,
          background: {
            duration: 0.2 * animationDuration,
            ease: "easeInOut"
          }
        } : { duration: 0 }}
      >
        <div className="flex items-center gap-2 relative">
          {showSparkleButton && (
            <motion.div
            className="flex items-center justify-center"
            animate={{
              opacity: isExpanded ? 0 : 1,
              x: isExpanded ? -20 : 0,
              scale: isExpanded ? 0.8 : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
              delay: isExpanded ? 0 : 0,
            }}
          >
            <motion.button
              className="w-12 h-12 flex items-center justify-center cursor-pointer"
              style={{ backgroundColor: 'transparent', border: 'none' }}
              whileHover={
                !isExpanded
                  ? {
                      scale: 1.02,
                      y: -2,
                      transition: {
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      },
                    }
                  : undefined
              }
              whileTap={{ scale: 0.95 }}
              aria-label="Sparkle"
            >
              <span className="text-2xl">✨</span>
            </motion.button>
          </motion.div>
          )}

          <motion.div
            className="w-px h-6 bg-gray-300 mr-2 -ml-2"
            animate={{
              opacity: isExpanded ? 0 : 1,
              scaleY: isExpanded ? 0 : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              delay: isExpanded ? 0 : 0.3,
            }}
          />

          {characters.slice(1, -1).map((character, index) => {
            const actualIndex = index + 1;
            const isSelected = expandedCharacter === actualIndex;

            return (
              <motion.div
                key={character.name}
                className={cn(
                  "relative",
                  isSelected && isExpanded && "absolute left-1 top-1 z-20"
                )}
                style={{
                  width: isSelected && isExpanded ? 0 : "auto",
                  minWidth: isSelected && isExpanded ? 0 : "auto",
                  overflow: "visible",
                }}
                animate={{
                  opacity: isExpanded && !isSelected ? 0 : 1,
                  y: isExpanded && !isSelected ? 60 : 0,
                  scale: isExpanded && !isSelected ? 0.8 : 1,
                  x: isSelected && isExpanded ? 0 : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                  delay:
                    isExpanded && !isSelected
                      ? index * 0.05
                      : isExpanded
                      ? 0.1
                      : 0,
                }}
              >
                <motion.button
                  className={cn(
                    "relative w-10 h-10 rounded-full flex items-center justify-center text-xl cursor-pointer",
                    isSelected && isExpanded
                      ? "bg-white/90"
                      : character.backgroundColor
                  )}
                  style={{ 
                    border: 'none',
                    backgroundColor: isSelected && isExpanded 
                      ? 'rgba(255, 255, 255, 0.9)' 
                      : character.backgroundColor?.includes('emerald')
                        ? '#a7f3d0'
                        : character.backgroundColor?.includes('violet')
                        ? '#c4b5fd'
                        : character.backgroundColor?.includes('amber')
                        ? '#fde68a'
                        : character.backgroundColor?.includes('rose')
                        ? '#fecaca'
                        : 'transparent'
                  }}
                  onClick={() => handleCharacterClick(actualIndex)}
                  whileHover={!isExpanded ? hoverAnimation : { scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Message ${character.name}`}
                >
                  <span className="text-2xl">{character.emoji}</span>

                  {character.online && (
                    <motion.div
                      className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: isExpanded && !isSelected ? 0 : 1 }}
                      transition={{
                        delay: isExpanded
                          ? isSelected
                            ? 0.3
                            : 0
                          : (index + 1) * 0.1 + 0.5,
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </motion.button>
              </motion.div>
            );
          })}

          <AnimatePresence>
            {isExpanded && (
              <motion.input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                  if (e.key === "Escape" && closeOnEscape) {
                    setExpandedCharacter(null);
                    setMessageInput("");
                    onDockToggle?.(false);
                  }
                }}
                placeholder={placeholder(selectedCharacter?.name || "")}
                className="w-[300px] absolute left-14 right-0 bg-transparent border-none outline-none text-sm font-medium z-50 placeholder-muted-foreground"
                style={{ color: 'rgb(0, 0, 0)' }}
                autoFocus={autoFocus}
                initial={{ opacity: 0, x: 20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  transition: {
                    delay: 0.2,
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }
                }}
                exit={{ 
                  opacity: 0,
                  transition: {
                    duration: 0.1,
                    ease: "easeOut"
                  }
                }}
              />
            )}
          </AnimatePresence>

          <motion.div
            className="w-px h-6 bg-gray-300 ml-2 -mr-2"
            animate={{
              opacity: isExpanded ? 0 : 1,
              scaleY: isExpanded ? 0 : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              delay: isExpanded ? 0 : 0,
            }}
          />

          {showMenuButton && (
            <motion.div
              className={cn(
                "flex items-center justify-center z-20",
                isExpanded && "absolute right-0"
              )}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <AnimatePresence mode="wait">
                {!isExpanded ? (
                <motion.button
                  key="menu"
                  className="w-12 h-12 flex items-center justify-center cursor-pointer"
                  style={{ backgroundColor: 'transparent', border: 'none' }}
                  whileHover={{
                    scale: 1.02,
                    y: -2,
                    transition: {
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                    },
                  }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Menu"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-muted-foreground"
                  >
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </motion.button>
                ) : (
                <motion.button
                  key="send"
                  onClick={handleSendMessage}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-background/90 hover:!bg-background transition-colors disabled:opacity-50 cursor-pointer relative z-30 border border-border/50 [&:hover]:!bg-background [&:hover]:!border-[hsl(var(--border)/0.5)]"
                  style={{ 
                    border: '1px solid hsl(var(--border) / 0.5)',
                    borderRadius: '9999px',
                    padding: 0,
                    fontSize: 'inherit',
                    fontWeight: 'inherit',
                    fontFamily: 'inherit',
                    backgroundColor: 'hsl(var(--background) / 0.9)',
                    color: 'hsl(var(--foreground))'
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    backgroundColor: 'hsl(var(--background))'
                  }}
                  whileTap={{ scale: 0.9 }}
                  disabled={!messageInput.trim()}
                  initial={{ opacity: 0, scale: 0, rotate: -90 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    rotate: 0,
                    transition: {
                      delay: 0.25,
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }
                  }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0, 
                    rotate: 90,
                    transition: {
                      duration: 0.1,
                      ease: "easeIn"
                    }
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-muted-foreground"
                  >
                    <path d="m22 2-7 20-4-9-9-4z" />
                    <path d="M22 2 11 13" />
                  </svg>
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}