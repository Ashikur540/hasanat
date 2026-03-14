import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LocationPermissionDialog } from './LocationPermissionDialog';

const mockI18n = {
  t: (key: string) => {
    const translations: Record<string, string> = {
      locationPromptTitle: 'Enable Location',
      locationPromptDesc: 'We need your location to show accurate prayer times',
      locationAllow: 'Allow',
      locationManualEntry: 'Enter Manually',
      locationLatitude: 'Latitude',
      locationLongitude: 'Longitude',
      locationSave: 'Save Location',
      locationCancel: 'Cancel',
    };
    return translations[key] || key;
  },
};

vi.mock('@/i18n/I18nProvider', () => ({
  useI18n: () => mockI18n,
}));

const mockSetCachedLocation = vi.fn();
vi.mock('@/hooks/useLocationService', () => ({
  useLocationService: () => ({
    setCachedLocation: mockSetCachedLocation,
  }),
}));

describe('LocationPermissionDialog', () => {
  beforeEach(() => {
    mockSetCachedLocation.mockClear();
  });

  it('should render dialog with title', () => {
    const onOpenChange = vi.fn();
    render(
      <LocationPermissionDialog open={true} onOpenChange={onOpenChange} />
    );
    expect(screen.getByText('Enable Location')).toBeInTheDocument();
  });

  it('should render geolocation and manual entry tabs', () => {
    const onOpenChange = vi.fn();
    render(
      <LocationPermissionDialog open={true} onOpenChange={onOpenChange} />
    );
    expect(screen.getAllByText('Allow').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Enter Manually').length).toBeGreaterThan(0);
  });

  it('should render Cancel buttons', () => {
    const onOpenChange = vi.fn();
    render(
      <LocationPermissionDialog open={true} onOpenChange={onOpenChange} />
    );

    expect(screen.getAllByText('Cancel').length).toBeGreaterThan(0);
  });

  it('should not show dialog when open prop is false', () => {
    const onOpenChange = vi.fn();
    render(
      <LocationPermissionDialog open={false} onOpenChange={onOpenChange} />
    );
    expect(screen.queryByText('Enable Location')).not.toBeInTheDocument();
  });

  it('should accept props for open and onOpenChange', () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <LocationPermissionDialog open={true} onOpenChange={onOpenChange} />
    );

    expect(screen.getByText('Enable Location')).toBeInTheDocument();

    rerender(
      <LocationPermissionDialog open={false} onOpenChange={onOpenChange} />
    );

    expect(screen.queryByText('Enable Location')).not.toBeInTheDocument();
  });

  it('should render with proper dialog structure', () => {
    const onOpenChange = vi.fn();
    render(
      <LocationPermissionDialog open={true} onOpenChange={onOpenChange} />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('should have DialogContent component rendered', () => {
    const onOpenChange = vi.fn();
    render(
      <LocationPermissionDialog open={true} onOpenChange={onOpenChange} />
    );

    expect(screen.getByText('Enable Location')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should render tab triggers', () => {
    const onOpenChange = vi.fn();
    render(
      <LocationPermissionDialog open={true} onOpenChange={onOpenChange} />
    );

    const tabTriggers = screen.getAllByRole('tab');
    expect(tabTriggers.length).toBeGreaterThanOrEqual(2);
  });
});







