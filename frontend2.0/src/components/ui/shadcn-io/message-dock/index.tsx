'use client';

import { cn } from "@/lib/utils";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type TargetAndTransition,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/theme-provider";

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
  onMessageSend?: (
    message: string,
    character: Character,
    characterIndex: number
  ) => void;
  onCharacterSelect?: (character: Character, characterIndex: number) => void;
  onDockToggle?: (isExpanded: boolean) => void;
  onExpandClick?: () => void;
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

type MessageEntry = {
  text: string;
  timestamp: number;
  from: "user" | "character";
};

export function MessageDock({
  characters = defaultCharacters,
  onMessageSend,
  onCharacterSelect,
  onDockToggle,
  onExpandClick,
  className,
  expandedWidth = 448,
  position = "bottom",
  showSparkleButton = true,
  showMenuButton = true,
  enableAnimations = true,
  animationDuration = 1,
  placeholder = (name: string) => `Message ${name}...`,
  autoFocus = true,
  closeOnClickOutside = true,
  closeOnEscape = true,
  closeOnSend = false,
}: MessageDockProps) {
  const shouldReduceMotion = useReducedMotion();
  const { theme } = useTheme();
  const [expandedCharacter, setExpandedCharacter] = useState<number | null>(
    null
  );
  const [messageInput, setMessageInput] = useState("");
  const dockRef = useRef<HTMLDivElement>(null);
  const [collapsedWidth, setCollapsedWidth] = useState<number>(266);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [messageHistories, setMessageHistories] = useState<
    Record<number, MessageEntry[]>
  >({});
  const chatScrollRef = useRef<HTMLDivElement>(null);

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

  const hoverAnimation: TargetAndTransition = shouldReduceMotion
    ? { scale: 1.02 }
    : {
        scale: 1.05,
        y: -8,
        transition: {
          type: "spring" as const,
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

      setMessageHistories((prev) => {
        const existing = prev[expandedCharacter] ?? [];
        return {
          ...prev,
          [expandedCharacter]: [
            ...existing,
            { text: messageInput.trim(), timestamp: Date.now(), from: "user" },
          ],
        };
      });
      
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
  const activeMessages =
    expandedCharacter !== null
      ? messageHistories[expandedCharacter] ?? []
      : [];

  useEffect(() => {
    if (isExpanded && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [isExpanded, activeMessages.length, expandedCharacter]);

  const defaultPositionClasses =
    position === "top"
      ? "fixed top-6 right-6 z-50"
      : "fixed bottom-6 right-6 z-50";

  return (
    <motion.div
      ref={dockRef}
      className={cn(
        !className?.includes("relative") && !className?.includes("absolute")
          ? defaultPositionClasses
          : "",
        className
      )}
      initial={enableAnimations ? "hidden" : "visible"}
      animate="visible"
      variants={enableAnimations ? containerVariants : {}}
    >
      <motion.div
        className={cn(
          "overflow-hidden shadow-2xl backdrop-blur-md",
          isExpanded 
            ? "border-emerald-400/30 dark:border-emerald-400/20 border"
            : "border border-emerald-400/20 dark:border-emerald-400/10"
        )}
        style={{ 
          paddingLeft: 16, 
          paddingRight: 16,
          backgroundColor: theme === 'dark' 
            ? 'rgba(16, 185, 129, 0.05)' // emerald-500/5 for dark
            : 'rgba(16, 185, 129, 0.1)', // emerald-500/10 for light
        }}
        animate={{
          width: isExpanded ? expandedWidth : collapsedWidth,
          borderRadius: isExpanded ? 28 : 9999,
          paddingTop: isExpanded ? 12 : 8,
          paddingBottom: isExpanded ? 12 : 8,
        }}
        transition={
          enableAnimations
            ? {
          type: "spring", 
          stiffness: isExpanded ? 300 : 500, 
          damping: isExpanded ? 30 : 35, 
          mass: isExpanded ? 0.8 : 0.6,
          background: {
            duration: 0.2 * animationDuration,
                  ease: "easeInOut",
                },
          }
            : { duration: 0 }
        }
      >
        <div
          className={cn(
            "relative flex w-full items-center gap-2",
            isExpanded && "flex-col items-stretch gap-2"
          )}
      >
          <div className={cn(
            "flex w-full items-center gap-2",
            isExpanded && "gap-1.5"
          )}>
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
                  className={cn(
                    "flex items-center justify-center cursor-pointer",
                    isExpanded ? "h-8 w-8" : "h-12 w-12"
                  )}
                  style={{ backgroundColor: "transparent", border: "none" }}
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
              className="h-6 w-px bg-gray-300 -ml-2 mr-2"
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
                      "relative flex h-10 w-10 items-center justify-center rounded-full text-xl",
                    isSelected && isExpanded
                      ? "bg-white/90"
                      : character.backgroundColor
                  )}
                    style={{
                      border: "none",
                      backgroundColor:
                        isSelected && isExpanded
                          ? "rgba(255, 255, 255, 0.9)"
                          : character.backgroundColor?.includes("emerald")
                          ? "#a7f3d0"
                          : character.backgroundColor?.includes("violet")
                          ? "#c4b5fd"
                          : character.backgroundColor?.includes("amber")
                          ? "#fde68a"
                          : character.backgroundColor?.includes("rose")
                          ? "#fecaca"
                          : "transparent",
                    }}
                  onClick={() => handleCharacterClick(actualIndex)}
                  whileHover={!isExpanded ? hoverAnimation : { scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Message ${character.name}`}
                >
                  <span className="text-2xl">{character.emoji}</span>

                  {character.online && (
                    <motion.div
                        className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"
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

          <motion.div
              className="h-6 w-px bg-gray-300 -mr-2 ml-2"
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
              <div className="ml-auto flex items-center gap-1">
                <AnimatePresence mode="wait">
                  {!isExpanded ? (
                <motion.button
                  key="menu"
                      className={cn(
                        "flex items-center justify-center cursor-pointer",
                        isExpanded ? "h-8 w-8" : "h-12 w-12"
                      )}
                      style={{ backgroundColor: "transparent", border: "none" }}
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
                      key="expand"
                      onClick={onExpandClick}
                      className="flex h-8 w-8 items-center justify-center cursor-pointer"
                      style={{ backgroundColor: "transparent", border: "none" }}
                      whileHover={{
                        scale: 1.1,
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        },
                      }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Expand to full page"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-muted-foreground"
                      >
                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                      </svg>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                key="chat-panel"
                className="flex w-full flex-col gap-3 rounded-2xl border border-emerald-400/20 dark:border-emerald-400/10 bg-emerald-50/30 dark:bg-emerald-950/20 p-4 backdrop-blur-md"
                initial={{ opacity: 0, y: 16 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 320,
                    damping: 30,
                  },
                }}
                exit={{
                  opacity: 0,
                  y: 12,
                  transition: {
                    duration: 0.15,
                    ease: "easeInOut",
                  },
                }}
              >
                <div
                  ref={chatScrollRef}
                  className="flex-1 min-h-[180px] max-h-72 space-y-2 overflow-y-auto pr-1"
                >
                  {activeMessages.length === 0 ? (
                    <p className="text-xs text-muted-foreground/80">
                      Start the conversation with{" "}
                      {selectedCharacter?.name ?? "your friend"}.
                    </p>
                  ) : (
                    activeMessages.map((entry, idx) => (
                      <div
                        key={`${entry.timestamp}-${idx}`}
                        className={cn(
                          "flex",
                          entry.from === "user"
                            ? "justify-end"
                            : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[80%] rounded-2xl px-3 py-2 text-xs font-medium shadow-sm",
                            entry.from === "user"
                              ? "bg-emerald-500/70 dark:bg-emerald-600/60 text-white backdrop-blur-sm"
                              : "bg-white/40 dark:bg-white/10 text-foreground border border-emerald-200/30 dark:border-emerald-800/30 backdrop-blur-sm"
                          )}
                        >
                          {entry.text}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
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
                    className="flex-1 rounded-full border border-emerald-300/40 dark:border-emerald-700/40 bg-white/50 dark:bg-white/10 px-3 py-2 text-sm font-medium text-foreground placeholder-muted-foreground outline-none transition backdrop-blur-sm focus:border-emerald-400/60 dark:focus:border-emerald-500/60 focus:ring-0"
                    style={{ color: "hsl(var(--foreground))" }}
                    autoFocus={autoFocus}
                    initial={{ opacity: 0, x: 20 }}
                  animate={{ 
                    opacity: 1, 
                      x: 0,
                    transition: {
                        delay: 0.1,
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                      },
                  }}
                  exit={{ 
                    opacity: 0, 
                    transition: {
                      duration: 0.1,
                        ease: "easeOut",
                      },
                    }}
                  />
                  <motion.button
                    key="send"
                    onClick={handleSendMessage}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400/40 dark:border-emerald-600/40 bg-emerald-500/60 dark:bg-emerald-600/50 text-white backdrop-blur-sm transition-colors hover:bg-emerald-500/80 dark:hover:bg-emerald-600/70 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{
                      scale: 1.05,
                    }}
                    whileTap={{ scale: 0.92 }}
                    disabled={!messageInput.trim()}
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
                </div>
              </motion.div>
              )}
            </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}