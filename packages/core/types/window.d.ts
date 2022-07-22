export {};

declare global {
  interface Window {
    BoltTrack: { 
      recordEvent: (event: string, properties?: any) => void;
    }
  }
}