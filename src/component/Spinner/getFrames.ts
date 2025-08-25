export function getFrames(this: any, style: string): string[] {
  const styles: Record<string, string[]> = {
    dots: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
    line: ['-', '\\', '|', '/'],
    circle: ['◜', '◠', '◝', '◞', '◡', '◟'],
    square: ['◰', '◳', '◲', '◱'],
    arrow: ['←', '↖', '↑', '↗', '→', '↘', '↓', '↙'],
    pulse: ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'],
  };
  
  return styles[style] ?? styles.dots;
}