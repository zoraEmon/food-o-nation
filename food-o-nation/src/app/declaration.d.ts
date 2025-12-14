// declaration.d.ts

declare module '*.css' {
  // Define that the CSS module has no specific type export,
  // which satisfies the side-effect import
}

// You can add declarations for other file types here too, like PNG or SVG
declare module '*.png' {
  const content: string;
  export default content;
}