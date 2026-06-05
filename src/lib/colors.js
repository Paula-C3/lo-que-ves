export const AVATAR_COLORS = [
  '#FFD400',
  '#FF6B6B',
  '#4ECDC4',
  '#A29BFE',
  '#FD79A8',
  '#55EFC4',
  '#E17055',
  '#74B9FF',
]

export const BANNER_COLORS = [
  '#1A1A2E',
  '#16213E',
  '#1B262C',
  '#2D132C',
  '#1C3A2A',
  '#2C1810',
  '#1A1A1A',
  '#0F2027',
]

export function randomColor(palette) {
  return palette[Math.floor(Math.random() * palette.length)]
}
