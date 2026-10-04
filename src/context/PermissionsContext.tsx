import React, { createContext, useContext, useState, useEffect } from 'react';
import { AndroidPermissionType } from '../types';
import { AndroidPermissionModal } from '../components/common/AndroidPermissionModal';

export type PermissionState = 'granted' | 'denied' | 'permanentlyDenied';

interface PermissionsContextType {
  permissions: Record<AndroidPermissionType, PermissionState>;
  requestPermission: (type: AndroidPermissionType) => Promise<boolean>;
  setPermissionStatus: (type: AndroidPermissionType, status: PermissionState) => void;
  resetPermissions: () => void;
  openAppSettings: () => void;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permissions, setPermissions] = useState<Record<AndroidPermissionType, PermissionState>>(() => {
    const saved = localStorage.getItem('relais237_android_permissions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      camera: 'granted',
      location: 'granted',
      contacts: 'granted',
      media: 'granted',
    };
  });

  const [activePrompt, setActivePrompt] = useState<AndroidPermissionType | null>(null);
  const [pendingResolver, setPendingResolver] = useState<((granted: boolean) => void) | null>(null);

  useEffect(() => {
    localStorage.setItem('relais237_android_permissions', JSON.stringify(permissions));
  }, [permissions]);

  const requestPermission = (type: AndroidPermissionType): Promise<boolean> => {
    if (permissions[type] === 'granted') {
      return Promise.resolve(true);
    }

    return new Promise((resolve) => {
      setPendingResolver(() => resolve);
      setActivePrompt(type);
    });
  };

  const handleGrant = (type: AndroidPermissionType) => {
    setPermissions((prev) => ({ ...prev, [type]: 'granted' }));
    setActivePrompt(null);
    if (pendingResolver) {
      pendingResolver(true);
      setPendingResolver(null);
    }
  };

  const handleDeny = (type: AndroidPermissionType) => {
    setPermissions((prev) => ({ ...prev, [type]: 'denied' }));
    setActivePrompt(null);
    if (pendingResolver) {
      pendingResolver(false);
      setPendingResolver(null);
    }
  };

  const setPermissionStatus = (type: AndroidPermissionType, status: PermissionState) => {
    setPermissions((prev) => ({ ...prev, [type]: status }));
  };

  const resetPermissions = () => {
    setPermissions({
      camera: 'denied',
      location: 'denied',
      contacts: 'denied',
      media: 'denied',
    });
  };

  const openAppSettings = () => {
    // Toggle all to granted as if user enabled them in Settings
    setPermissions({
      camera: 'granted',
      location: 'granted',
      contacts: 'granted',
      media: 'granted',
    });
    if (activePrompt) {
      handleGrant(activePrompt);
    }
  };

  return (
    <PermissionsContext.Provider
      value={{
        permissions,
        requestPermission,
        setPermissionStatus,
        resetPermissions,
        openAppSettings,
      }}
    >
      {children}

      <AndroidPermissionModal
        permissionType={activePrompt}
        isOpen={!!activePrompt}
        onGrant={handleGrant}
        onDeny={handleDeny}
        isPermanentlyDenied={activePrompt ? permissions[activePrompt] === 'permanentlyDenied' : false}
      />
    </PermissionsContext.Provider>
  );
};

export const usePermissions = (): PermissionsContextType => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};
