'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

interface SiteSettings {
    siteName: string;
    siteDescription: string;
}

interface SiteSettingsContextType {
    settings: SiteSettings;
    refreshSettings: () => Promise<void>;
    isLoading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<SiteSettings>({
        siteName: 'WORD SQUARES',
        siteDescription: 'Daily Word Puzzle Game',
    });
    const [isLoading, setIsLoading] = useState(true);

    const refreshSettings = useCallback(async () => {
        try {
            const response = await api.getPublicSettings() as any;
            if (response.success && response.settings) {
                setSettings({
                    siteName: response.settings.siteName,
                    siteDescription: response.settings.siteDescription,
                });

                // Update document title dynamically
                if (typeof document !== 'undefined') {
                    const currentTitle = document.title;
                    if (currentTitle.includes(' - ')) {
                        const pageName = currentTitle.split(' - ')[1];
                        document.title = `${response.settings.siteName} - ${pageName}`;
                    } else {
                        document.title = `${response.settings.siteName} - Daily Word Puzzle Game`;
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch site settings:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshSettings();
    }, [refreshSettings]);

    return (
        <SiteSettingsContext.Provider value={{ settings, refreshSettings, isLoading }}>
            {children}
        </SiteSettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SiteSettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SiteSettingsProvider');
    }
    return context;
}
