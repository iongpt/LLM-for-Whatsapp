declare module 'electron' {
  export const app: any;
  export const ipcMain: any;
  export const shell: any;
  export const dialog: any;
  export const nativeImage: any;
  
  export class BrowserWindow {
    constructor(options: any);
    loadURL(url: string, options?: any): Promise<void>;
    loadFile(filePath: string, options?: any): Promise<void>;
    on(event: string, listener: (...args: any[]) => void): this;
    webContents: any;
    setMenu(menu: any): void;
    maximize(): void;
    minimize(): void;
    close(): void;
    isMinimized(): boolean;
    isVisible(): boolean;
    isDestroyed(): boolean;
    show(): void;
    hide(): void;
    focus(): void;
    
    static getAllWindows(): BrowserWindow[];
  }
  
  export class Menu {
    static buildFromTemplate(template: any[]): Menu;
    static setApplicationMenu(menu: Menu | null): void;
    popup(options?: any): void;
  }
  
  export class Tray {
    constructor(image: any);
    on(event: string, listener: (...args: any[]) => void): this;
    setContextMenu(menu: Menu | null): void;
    setToolTip(tooltip: string): void;
    displayBalloon(options: any): void;
    destroy(): void;
  }
}