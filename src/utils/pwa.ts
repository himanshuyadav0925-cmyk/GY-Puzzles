// PWA Install & Offline Management Utility for GY Puzzles

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

type InstallListener = (canInstall: boolean) => void;

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<InstallListener>();

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function canPromptInstall(): boolean {
  return deferredPrompt !== null && !isStandalone();
}

export function addInstallListener(listener: InstallListener): () => void {
  listeners.add(listener);
  listener(canPromptInstall());
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  const installable = canPromptInstall();
  listeners.forEach((listener) => listener(installable));
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    notifyListeners();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notifyListeners();
  });
}

export async function promptInstallApp(): Promise<boolean> {
  if (!deferredPrompt) return false;
  try {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    notifyListeners();
    return outcome === 'accepted';
  } catch {
    deferredPrompt = null;
    notifyListeners();
    return false;
  }
}
