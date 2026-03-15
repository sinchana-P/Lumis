'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateMemberMutation } from '@/store/api/membersApi';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { TimePicker } from '@/components/ui/TimePicker';
import { getPlaces, formatPlaceName, type PlaceResult } from '@/lib/places';

export default function AddMemberPage() {
  const router = useRouter();
  const [createMember, { isLoading: isSubmitting }] = useCreateMemberMutation();

  // Place autocomplete state
  const [showPlaceSuggestions, setShowPlaceSuggestions] = useState(false);
  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceResult[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const placeInputRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    nickname: '',
    relationType: '',
    relationTypeCustom: '',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const relationTypes = [
    { value: 'family', label: 'Family' },
    { value: 'friend', label: 'Friend' },
    { value: 'partner', label: 'Partner' },
    { value: 'mentor', label: 'Mentor' },
    { value: 'colleague', label: 'Colleague' },
  ];

  // Place search — debounced, using getPlaces utility
  const searchPlaces = useCallback(async (query: string) => {
    if (query.length < 2) { setShowPlaceSuggestions(false); setPlaceSuggestions([]); return; }
    setIsSearching(true);
    try {
      const results = await getPlaces(query);
      setPlaceSuggestions(results);
      setShowPlaceSuggestions(true);
      setActiveSuggestionIndex(-1);
    } catch {
      setShowPlaceSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handlePlaceInput = (value: string) => {
    setFormData(prev => ({ ...prev, placeOfBirth: value }));
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => searchPlaces(value), 300);
  };

  const selectPlace = (place: PlaceResult) => {
    setFormData(prev => ({ ...prev, placeOfBirth: formatPlaceName(place) }));
    setShowPlaceSuggestions(false);
    setActiveSuggestionIndex(-1);
  };

  // Close place dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (placeInputRef.current && !placeInputRef.current.contains(e.target as Node)) {
        setShowPlaceSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  // Photo upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select a valid image file'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be smaller than 5MB'); return; }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setError(null);
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'relationType' && value !== 'other') {
      setFormData(prev => ({ ...prev, relationTypeCustom: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    try {
      if (!formData.fullName.trim()) throw new Error('Please enter their name in the stars');
      if (!formData.relationType) throw new Error('Please choose their connection to you');
      if (formData.relationType === 'other' && !formData.relationTypeCustom.trim()) {
        throw new Error('Please specify the custom connection type');
      }
      await createMember({
        fullName: formData.fullName.trim(),
        nickname: formData.nickname.trim() || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        timeOfBirth: formData.timeOfBirth || undefined,
        placeOfBirth: formData.placeOfBirth.trim() || undefined,
        relationType: formData.relationType,
        relationTypeCustom: formData.relationTypeCustom.trim() || undefined,
      }).unwrap();
      setSuccessMessage(`${formData.fullName} has been added to your luminaries!`);
      setTimeout(() => router.push('/orbit'), 1500);
    } catch (err: any) {
      setError(err.data?.error?.message || err.message || 'Failed to add to luminaries. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="absolute top-8 right-8">
        <svg className="w-6 h-6 text-tertiary" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </div>

      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-xs uppercase tracking-wider text-tertiary mb-2">NEW LUMINARY</div>
          <h1 className="text-3xl font-serif text-primary mb-1 leading-tight">
            Who are we bringing into the light?
          </h1>
          <p className="text-sm text-secondary italic">
            Every soul adds a unique frequency to the luminaries.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-widest text-secondary">FULL NAME</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Enter their name in the stars..."
              className="w-full px-0 py-2 text-base font-serif bg-transparent border-0 border-b border-primary focus:border-accent-primary outline-none focus:outline-none focus:ring-0 text-primary placeholder:text-tertiary"
            />
          </div>

          {/* Nickname */}
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-widest text-secondary">
              NICKNAME <span className="text-tertiary">(OPTIONAL)</span>
            </label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => handleInputChange('nickname', e.target.value)}
              placeholder="What do you call them?"
              className="w-full px-0 py-2 text-base font-serif bg-transparent border-0 border-b border-primary focus:border-accent-primary outline-none focus:outline-none focus:ring-0 text-primary placeholder:text-tertiary"
            />
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-secondary">
              PHOTO <span className="text-tertiary">(OPTIONAL)</span>
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {photoPreview ? (
                  <div className="relative">
                    <img src={photoPreview} alt="Preview" className="w-14 h-14 rounded-full object-cover border-2 border-accent-primary shadow-md" />
                    <button type="button" onClick={removePhoto}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-error rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-full bg-surface border-2 border-dashed border-primary flex items-center justify-center">
                    <svg className="w-6 h-6 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-1.5 bg-surface hover:bg-secondary text-primary rounded-full text-xs font-medium transition-colors border border-primary">
                  {photoPreview ? 'Change Photo' : 'Upload Photo'}
                </button>
                <p className="text-xs text-tertiary mt-1">JPG, PNG or GIF • Max 5MB</p>
              </div>
            </div>
          </div>

          {/* Connection Type */}
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-secondary">CONNECTION</label>
            <div className="flex flex-wrap gap-2">
              {relationTypes.map((type) => (
                <button key={type.value} type="button"
                  onClick={() => handleInputChange('relationType', type.value)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    formData.relationType === type.value
                      ? 'bg-accent-primary text-white shadow-md'
                      : 'bg-surface text-secondary hover:bg-secondary'
                  }`}>
                  {type.label}
                </button>
              ))}
              <button type="button"
                onClick={() => handleInputChange('relationType', 'other')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  formData.relationType === 'other'
                    ? 'bg-accent-primary text-white shadow-md'
                    : 'bg-surface text-secondary hover:bg-secondary'
                }`}>
                + Other
              </button>
            </div>
            {formData.relationType === 'other' && (
              <input
                type="text"
                value={formData.relationTypeCustom}
                onChange={(e) => handleInputChange('relationTypeCustom', e.target.value)}
                placeholder="Describe their connection..."
                className="w-full px-0 py-2 text-sm bg-transparent border-0 border-b border-primary focus:border-accent-primary outline-none focus:outline-none focus:ring-0 text-primary placeholder:text-tertiary"
              />
            )}
          </div>

          {/* Birth Date + Time */}
          <div className="grid grid-cols-2 gap-4">
            <DatePicker
              label="BIRTH DATE"
              value={formData.dateOfBirth}
              onChange={(v) => setFormData(prev => ({ ...prev, dateOfBirth: v }))}
            />
            <TimePicker
              label="BIRTH TIME"
              value={formData.timeOfBirth}
              onChange={(v) => setFormData(prev => ({ ...prev, timeOfBirth: v }))}
            />
          </div>

          {/* Place of Birth */}
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-widest text-secondary">PLACE OF ARRIVAL</label>
            <div className="relative" ref={placeInputRef}>
              <input
                type="text"
                value={formData.placeOfBirth}
                onChange={(e) => handlePlaceInput(e.target.value)}
                onFocus={() => { if (formData.placeOfBirth.length >= 2) setShowPlaceSuggestions(true); }}
                onKeyDown={(e) => {
                  if (!showPlaceSuggestions || placeSuggestions.length === 0) return;
                  if (e.key === 'ArrowDown') { e.preventDefault(); setActiveSuggestionIndex(i => Math.min(i + 1, placeSuggestions.length - 1)); }
                  else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveSuggestionIndex(i => Math.max(i - 1, -1)); }
                  else if (e.key === 'Enter' && activeSuggestionIndex >= 0) { e.preventDefault(); selectPlace(placeSuggestions[activeSuggestionIndex]); }
                  else if (e.key === 'Escape') setShowPlaceSuggestions(false);
                }}
                placeholder="City, Country"
                className="w-full px-0 py-2 bg-transparent border-0 border-b border-primary focus:border-accent-primary outline-none focus:outline-none focus:ring-0 text-primary placeholder:text-tertiary pr-7"
                autoComplete="off"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={showPlaceSuggestions}
              />
              <div className="absolute right-0 top-2.5 text-tertiary pointer-events-none">
                {isSearching ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2C8.13,2 5,5.13 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9C19,5.13 15.87,2 12,2M12,11.5C10.62,11.5 9.5,10.38 9.5,9C9.5,7.62 10.62,6.5 12,6.5C13.38,6.5 14.5,7.62 14.5,9C14.5,10.38 13.38,11.5 12,11.5Z"/>
                  </svg>
                )}
              </div>

              {showPlaceSuggestions && placeSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-surface-elevated border border-primary rounded-lg shadow-lg z-50 overflow-hidden">
                  {placeSuggestions.map((place, index) => (
                    <button key={index} type="button"
                      onClick={() => selectPlace(place)}
                      onMouseEnter={() => setActiveSuggestionIndex(index)}
                      className={`w-full text-left px-3 py-2.5 transition-colors border-b border-primary last:border-b-0 focus:outline-none ${
                        activeSuggestionIndex === index ? 'bg-secondary' : 'hover:bg-secondary'
                      }`}>
                      <div className="flex items-center gap-2.5">
                        <svg className="w-3.5 h-3.5 text-accent-primary flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12,2C8.13,2 5,5.13 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9C19,5.13 15.87,2 12,2M12,11.5C10.62,11.5 9.5,10.38 9.5,9C9.5,7.62 10.62,6.5 12,6.5C13.38,6.5 14.5,7.62 14.5,9C14.5,10.38 13.38,11.5 12,11.5Z"/>
                        </svg>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-primary font-medium">{place.name}</span>
                          {(place.state || place.country) && (
                            <span className="text-xs text-tertiary ml-1.5">
                              {[place.state, place.country].filter(Boolean).join(', ')}
                            </span>
                          )}
                        </div>
                        {place.countryCode && (
                          <span className="text-[10px] text-tertiary font-mono flex-shrink-0">{place.countryCode}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {showPlaceSuggestions && !isSearching && placeSuggestions.length === 0 && formData.placeOfBirth.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-surface-elevated border border-primary rounded-lg shadow-lg z-50 px-4 py-4 text-center">
                  <p className="text-xs text-tertiary">No places found — try a city or town name</p>
                </div>
              )}
            </div>
            <p className="text-xs text-tertiary italic">Where the cosmos & earthly realms first met</p>
          </div>

          {/* Success / Error */}
          {successMessage && (
            <div className="text-center p-4 bg-accent-primary bg-opacity-10 rounded-xl">
              <p className="text-accent-primary font-medium">{successMessage}</p>
            </div>
          )}
          {error && (
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <button type="button" onClick={() => router.back()}
              className="text-secondary hover:text-primary transition-colors flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>CANCEL</span>
            </button>
            <Button type="submit" disabled={isSubmitting}
              className="px-8 py-3 bg-lumis-accent-primary hover:bg-lumis-accent-primary-hover text-white rounded-full font-medium transition-all shadow-lg hover:shadow-xl flex items-center space-x-2">
              <span>{isSubmitting ? 'Adding to Luminaries...' : 'Add to Luminaries'}</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </Button>
          </div>
        </form>

        <div className="text-center mt-6">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-xs text-tertiary">LUMIS</span>
            <svg className="w-3 h-3 text-tertiary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span className="text-xs text-tertiary">1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
