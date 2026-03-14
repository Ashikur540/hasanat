import { useState } from 'react';
import { useI18n } from '@/i18n/I18nProvider';
import { useLocationService } from '@/hooks/useLocationService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MIN_LATITUDE = -90;
const MAX_LATITUDE = 90;
const MIN_LONGITUDE = -180;
const MAX_LONGITUDE = 180;

export interface LocationPermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LocationPermissionDialog({
  open,
  onOpenChange,
}: LocationPermissionDialogProps) {
  const { t } = useI18n();
  const { setCachedLocation } = useLocationService();

  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const validateCoordinates = (lat: string, lng: string): boolean => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      setError('Please enter valid numbers');
      return false;
    }

    if (latNum < MIN_LATITUDE || latNum > MAX_LATITUDE) {
      setError(`Latitude must be between ${MIN_LATITUDE} and ${MAX_LATITUDE}`);
      return false;
    }

    if (lngNum < MIN_LONGITUDE || lngNum > MAX_LONGITUDE) {
      setError(`Longitude must be between ${MIN_LONGITUDE} and ${MAX_LONGITUDE}`);
      return false;
    }

    return true;
  };

  const handleRetryGeolocation = () => {
    setIsRetrying(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setIsRetrying(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCachedLocation(latitude, longitude, false);
        setIsRetrying(false);
        onOpenChange(false);
      },
      (positionError) => {
        if (positionError.code === positionError.PERMISSION_DENIED) {
          setError('Location permission was denied. Please enter manually or check your browser settings.');
        } else {
          setError('Unable to get your location. Please try again or enter manually.');
        }
        setIsRetrying(false);
      },
      { timeout: 10000 },
    );
  };

  const handleSaveManualLocation = () => {
    setError(null);

    if (!latitude.trim() || !longitude.trim()) {
      setError('Please enter both latitude and longitude');
      return;
    }

    if (!validateCoordinates(latitude, longitude)) {
      return;
    }

    setCachedLocation(parseFloat(latitude), parseFloat(longitude), true);
    setLatitude('');
    setLongitude('');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLatitude('');
    setLongitude('');
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>{t('locationPromptTitle')}</DialogTitle>
          <DialogDescription>{t('locationPromptDesc')}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="geolocation" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="geolocation">
              {t('locationAllow')}
            </TabsTrigger>
            <TabsTrigger value="manual">
              {t('locationManualEntry')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="geolocation" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('locationPromptDesc')}
            </p>
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                {t('locationCancel')}
              </Button>
              <Button
                type="button"
                onClick={handleRetryGeolocation}
                disabled={isRetrying}
                loading={isRetrying}
              >
                {t('locationAllow')}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="space-y-3">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium mb-1">
                  {t('locationLatitude')}
                </label>
                <Input
                  id="latitude"
                  type="number"
                  placeholder={`-90 to 90`}
                  value={latitude}
                  onChange={(e) => {
                    setLatitude(e.target.value);
                    setError(null);
                  }}
                  step="0.0001"
                  min={MIN_LATITUDE}
                  max={MAX_LATITUDE}
                />
              </div>

              <div>
                <label htmlFor="longitude" className="block text-sm font-medium mb-1">
                  {t('locationLongitude')}
                </label>
                <Input
                  id="longitude"
                  type="number"
                  placeholder={`-180 to 180`}
                  value={longitude}
                  onChange={(e) => {
                    setLongitude(e.target.value);
                    setError(null);
                  }}
                  step="0.0001"
                  min={MIN_LONGITUDE}
                  max={MAX_LONGITUDE}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                {t('locationCancel')}
              </Button>
              <Button
                type="button"
                onClick={handleSaveManualLocation}
              >
                {t('locationSave')}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
