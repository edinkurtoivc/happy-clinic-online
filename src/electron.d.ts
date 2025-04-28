
interface Window {
  electron: {
    openDirectory: () => Promise<string | null>;
    getFolderInfo: (path: string) => Promise<{
      usedSpace: string;
      totalSpace: string;
      percentage: number;
    }>;
    isElectron: boolean;
  };
}
