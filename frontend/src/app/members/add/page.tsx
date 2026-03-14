'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateMemberMutation } from '@/store/api/membersApi';
import { Button } from '@/components/ui/Button';
// Using Nominatim API for comprehensive global place search

/**
 * Add Member Page - Lumis Style
 * 
 * "Who are we bringing into the light?"
 */
export default function AddMemberPage() {
  const router = useRouter();
  const [createMember, { isLoading: isSubmitting }] = useCreateMemberMutation();
  const [showPlaceSuggestions, setShowPlaceSuggestions] = useState(false);
  const [placeSuggestions, setPlaceSuggestions] = useState<any[]>([]);
  
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState({ day: '', month: '', year: '' });
  const [selectedTime, setSelectedTime] = useState({ hour: '', minute: '', period: 'AM' });
  
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);
  const placeInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  
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
    { value: 'ancestor', label: 'Ancestor' },
  ];

  // Debounced search function for Nominatim API
  const searchPlaces = useCallback(async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setShowPlaceSuggestions(false);
      return;
    }
    
    try {
      const encodedTerm = encodeURIComponent(searchTerm);
      
      // Call Nominatim API for place search with better parameters
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodedTerm}&format=json&limit=15&addressdetails=1&extratags=1&countrycodes=&accept-language=en`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch places');
      }
      
      const results = await response.json();
      console.log('Raw Nominatim results:', results);
      
      // Filter and format results to prioritize cities, towns, and villages
      const filteredResults = results.filter((place: any) => {
        const placeType = place.type || '';
        const category = place.category || '';
        const placeClass = place.class || '';
        
        // Prioritize populated places and administrative boundaries
        return category === 'place' || 
               placeClass === 'place' ||
               placeType.includes('city') || 
               placeType.includes('town') || 
               placeType.includes('village') ||
               placeType.includes('municipality') ||
               placeType.includes('hamlet') ||
               placeType.includes('suburb') ||
               category === 'boundary' ||
               placeClass === 'boundary';
      });
      
      // Sort by relevance and importance
      const sortedResults = filteredResults.sort((a: any, b: any) => {
        const aImportance = parseFloat(a.importance || '0');
        const bImportance = parseFloat(b.importance || '0');
        const aName = (a.name || '').toLowerCase();
        const bName = (b.name || '').toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        // Exact name matches first
        if (aName === searchLower && bName !== searchLower) return -1;
        if (aName !== searchLower && bName === searchLower) return 1;
        
        // Names that start with search term
        if (aName.startsWith(searchLower) && !bName.startsWith(searchLower)) return -1;
        if (!aName.startsWith(searchLower) && bName.startsWith(searchLower)) return 1;
        
        // Then by importance (higher first)
        return bImportance - aImportance;
      });

      console.log('Filtered and sorted results for:', searchTerm, sortedResults);
      setPlaceSuggestions(sortedResults.slice(0, 10));
      setShowPlaceSuggestions(true);
    } catch (error) {
      console.error('Error searching places:', error);
      setShowPlaceSuggestions(false);
    }
  }, []);

  // Handle place input and show suggestions using Nominatim API
  const handlePlaceInput = (value: string) => {
    setFormData(prev => ({ ...prev, placeOfBirth: value }));
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce the search
    searchTimeoutRef.current = setTimeout(() => {
      searchPlaces(value);
    }, 300);
  };

  // Format place display name as "City, State, Country"
  const formatPlaceName = (place: any) => {
    const address = place.address || {};
    const parts = [];
    
    // Add city/village/town name - try multiple fields
    const placeName = address.city || 
                     address.town || 
                     address.village || 
                     address.municipality || 
                     address.hamlet ||
                     address.suburb ||
                     place.name || 
                     place.display_name?.split(',')[0]?.trim();
    
    if (placeName) {
      parts.push(placeName);
    }
    
    // Add state/province/region
    const state = address.state || 
                  address.province || 
                  address.region ||
                  address['ISO3166-2-lvl4'];
    
    if (state && state !== placeName) {
      parts.push(state);
    }
    
    // Add country
    if (address.country && address.country !== placeName) {
      parts.push(address.country);
    }
    
    return parts.join(', ');
  };

  // Handle clicking outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (placeInputRef.current && !placeInputRef.current.contains(event.target as Node)) {
        setShowPlaceSuggestions(false);
      }
      
      // Close date/time pickers when clicking outside
      const target = event.target as Node;
      const datePickerElement = document.querySelector('[data-date-picker]');
      const timePickerElement = document.querySelector('[data-time-picker]');
      
      if (datePickerElement && !datePickerElement.contains(target)) {
        setShowDatePicker(false);
        setShowMonthDropdown(false);
        setShowYearDropdown(false);
      }
      
      if (timePickerElement && !timePickerElement.contains(target)) {
        setShowTimePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Cleanup search timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Custom date picker functions
  const handleDateSelect = (day: string, month: string, year: string) => {
    setSelectedDate({ day, month, year });
    const dateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    setFormData(prev => ({ ...prev, dateOfBirth: dateString }));
    setShowDatePicker(false);
  };

  const handleTimeSelect = (hour: string, minute: string, period: string) => {
    setSelectedTime({ hour, minute, period });
    let hour24 = parseInt(hour);
    if (period === 'PM' && hour24 !== 12) hour24 += 12;
    if (period === 'AM' && hour24 === 12) hour24 = 0;
    const timeString = `${hour24.toString().padStart(2, '0')}:${minute.padStart(2, '0')}`;
    setFormData(prev => ({ ...prev, timeOfBirth: timeString }));
    setShowTimePicker(false);
  };

  const formatDisplayDate = () => {
    if (!formData.dateOfBirth) return '';
    const date = new Date(formData.dateOfBirth);
    return date.toLocaleDateString('en-US', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatDisplayTime = () => {
    if (!formData.timeOfBirth) return '';
    const [hour, minute] = formData.timeOfBirth.split(':');
    const hour12 = parseInt(hour) === 0 ? 12 : parseInt(hour) > 12 ? parseInt(hour) - 12 : parseInt(hour);
    const period = parseInt(hour) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minute} ${period}`;
  };

  // Generate calendar days for any month/year
  const generateCalendarDays = () => {
    const currentMonth = calendarDate.getMonth();
    const currentYear = calendarDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return { days, currentMonth, currentYear };
  };

  // Navigate calendar months
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCalendarDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Navigate calendar years
  const navigateYear = (direction: 'prev' | 'next') => {
    setCalendarDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setFullYear(prev.getFullYear() - 1);
      } else {
        newDate.setFullYear(prev.getFullYear() + 1);
      }
      return newDate;
    });
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  // Handle photo upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be smaller than 5MB');
        return;
      }
      
      setPhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear custom relation type if not "other"
    if (field === 'relationType' && value !== 'other') {
      setFormData(prev => ({
        ...prev,
        relationTypeCustom: ''
      }));
    }
  };

  const handleDateClick = () => {
    setShowDatePicker(!showDatePicker);
    setShowTimePicker(false);
  };

  const handleTimeClick = () => {
    setShowTimePicker(!showTimePicker);
    setShowDatePicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      // Validation
      if (!formData.fullName.trim()) {
        throw new Error('Please enter their name in the stars');
      }
      
      if (!formData.relationType) {
        throw new Error('Please choose their connection to you');
      }
      
      if (formData.relationType === 'other' && !formData.relationTypeCustom.trim()) {
        throw new Error('Please specify the custom connection type');
      }

      // Create member via API
      await createMember({
        fullName: formData.fullName.trim(),
        nickname: formData.nickname.trim() || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        timeOfBirth: formData.timeOfBirth || undefined,
        placeOfBirth: formData.placeOfBirth.trim() || undefined,
        relationType: formData.relationType,
        relationTypeCustom: formData.relationTypeCustom.trim() || undefined,
      }).unwrap();

      setSuccessMessage(`${formData.fullName} has been added to your constellation!`);
      
      // Redirect to members list after a short delay
      setTimeout(() => {
        router.push('/members');
      }, 1500);
      
    } catch (err: any) {
      console.error('Error creating member:', err);
      setError(err.data?.error?.message || err.message || 'Failed to add to constellation. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute top-8 right-8">
        <svg className="w-6 h-6 text-tertiary" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </div>
      
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-xs uppercase tracking-wider text-tertiary mb-4">
            NEW LUMINARY
          </div>
          
          <h1 className="text-4xl font-serif text-primary mb-6 leading-tight">
            Who are we bringing into the light?
          </h1>
          
          <p className="text-secondary italic">
            Every soul adds a unique frequency to the constellation.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Full Name */}
          <div className="space-y-3">
            <label className="block text-xs uppercase tracking-wider text-secondary">
              FULL NAME
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Enter their name in the stars..."
              className="w-full px-0 py-4 text-lg font-serif bg-transparent border-0 border-b-2 border-primary focus:border-accent-primary focus:outline-none text-primary placeholder:text-tertiary"
            />
          </div>

          {/* Nickname */}
          <div className="space-y-3">
            <label className="block text-xs uppercase tracking-wider text-secondary">
              NICKNAME <span className="text-tertiary">(OPTIONAL)</span>
            </label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => handleInputChange('nickname', e.target.value)}
              placeholder="What do you call them?"
              className="w-full px-0 py-4 text-lg font-serif bg-transparent border-0 border-b-2 border-primary focus:border-accent-primary focus:outline-none text-primary placeholder:text-tertiary"
            />
          </div>

          {/* Photo Upload */}
          <div className="space-y-4">
            <label className="block text-xs uppercase tracking-wider text-secondary">
              PHOTO <span className="text-tertiary">(OPTIONAL)</span>
            </label>
            
            <div className="flex items-center space-x-6">
              {/* Photo Preview */}
              <div className="flex-shrink-0">
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-20 h-20 rounded-full object-cover border-4 border-accent-primary shadow-md"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-error rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-surface border-2 border-dashed border-primary flex items-center justify-center">
                    <svg className="w-8 h-8 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Upload Button */}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-surface hover:bg-secondary text-primary rounded-full text-sm font-medium transition-colors border border-primary"
                >
                  {photoPreview ? 'Change Photo' : 'Upload Photo'}
                </button>
                <p className="text-xs text-tertiary mt-2">
                  JPG, PNG or GIF • Max 5MB • Photo upload coming soon
                </p>
              </div>
            </div>
          </div>

          {/* Connection Type */}
          <div className="space-y-4">
            <label className="block text-xs uppercase tracking-wider text-secondary">
              CONNECTION
            </label>
            
            <div className="flex flex-wrap gap-3">
              {relationTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleInputChange('relationType', type.value)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                    formData.relationType === type.value
                      ? 'bg-accent-primary text-white shadow-md'
                      : 'bg-surface text-secondary hover:bg-secondary'
                  }`}
                >
                  {type.label}
                </button>
              ))}
              
              <button
                type="button"
                onClick={() => handleInputChange('relationType', 'other')}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                  formData.relationType === 'other'
                    ? 'bg-accent-primary text-white shadow-md'
                    : 'bg-surface text-secondary hover:bg-secondary'
                }`}
              >
                + Other
              </button>
            </div>

            {formData.relationType === 'other' && (
              <input
                type="text"
                value={formData.relationTypeCustom}
                onChange={(e) => handleInputChange('relationTypeCustom', e.target.value)}
                placeholder="Describe their connection..."
                className="w-full px-0 py-3 bg-transparent border-0 border-b border-primary focus:border-accent-primary focus:outline-none text-primary placeholder:text-tertiary"
              />
            )}
          </div>

          {/* Birth Information */}
          <div className="grid grid-cols-2 gap-6">
            {/* Custom Date Picker */}
            <div className="space-y-3 relative" data-date-picker>
              <label className="block text-xs uppercase tracking-wider text-secondary">
                BIRTH DATE
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formatDisplayDate()}
                  onClick={handleDateClick}
                  readOnly
                  placeholder="dd/mm/yyyy"
                  className="w-full px-0 py-4 bg-transparent border-0 border-b-2 border-primary focus:border-accent-primary focus:outline-none text-primary cursor-pointer placeholder:text-tertiary"
                />
                <div className="absolute right-0 top-4 text-tertiary">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                  </svg>
                </div>
              </div>
              
              {/* Custom Date Picker Dropdown */}
              {showDatePicker && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface-elevated border border-primary rounded-lg shadow-xl z-50 p-6">
                  {/* Custom Month/Year Dropdowns */}
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    {/* Month Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setShowMonthDropdown(!showMonthDropdown);
                          setShowYearDropdown(false);
                        }}
                        className="px-4 py-3 bg-surface-elevated border-2 border-primary rounded-lg text-primary font-serif text-base focus:outline-none focus:border-accent-primary transition-all duration-200 hover:border-accent-primary cursor-pointer min-w-[120px] flex items-center justify-between"
                      >
                        <span>{months[generateCalendarDays().currentMonth]}</span>
                        <svg className="w-4 h-4 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {showMonthDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-surface-elevated border border-primary rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                          {months.map((month, index) => (
                            <button
                              key={month}
                              type="button"
                              onClick={() => {
                                const newDate = new Date(calendarDate);
                                newDate.setMonth(index);
                                setCalendarDate(newDate);
                                setShowMonthDropdown(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-primary font-serif hover:bg-accent-primary hover:text-white transition-colors ${
                                index === generateCalendarDays().currentMonth ? 'bg-accent-primary text-white' : ''
                              }`}
                            >
                              {month}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Year Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setShowYearDropdown(!showYearDropdown);
                          setShowMonthDropdown(false);
                        }}
                        className="px-4 py-3 bg-surface-elevated border-2 border-primary rounded-lg text-primary font-serif text-base focus:outline-none focus:border-accent-primary transition-all duration-200 hover:border-accent-primary cursor-pointer min-w-[100px] flex items-center justify-between"
                      >
                        <span>{generateCalendarDays().currentYear}</span>
                        <svg className="w-4 h-4 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {showYearDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-surface-elevated border border-primary rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                          {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                            <button
                              key={year}
                              type="button"
                              onClick={() => {
                                const newDate = new Date(calendarDate);
                                newDate.setFullYear(year);
                                setCalendarDate(newDate);
                                setShowYearDropdown(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-primary font-serif hover:bg-accent-primary hover:text-white transition-colors ${
                                year === generateCalendarDays().currentYear ? 'bg-accent-primary text-white' : ''
                              }`}
                            >
                              {year}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                      <div key={day} className="text-center text-xs font-medium text-tertiary p-2">
                        {day}
                      </div>
                    ))}
                    
                    {generateCalendarDays().days.map((day, index) => {
                      const isToday = day === new Date().getDate() && 
                        generateCalendarDays().currentMonth === new Date().getMonth() &&
                        generateCalendarDays().currentYear === new Date().getFullYear();
                      
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => day && handleDateSelect(
                            day.toString(), 
                            (generateCalendarDays().currentMonth + 1).toString(), 
                            generateCalendarDays().currentYear.toString()
                          )}
                          disabled={!day}
                          className={`p-2 text-sm rounded-md transition-colors ${
                            day 
                              ? 'text-primary hover:bg-accent-primary hover:text-white' 
                              : 'text-transparent'
                          } ${
                            isToday ? 'bg-accent-primary text-white' : ''
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, dateOfBirth: '' }));
                        setShowDatePicker(false);
                      }}
                      className="text-accent-primary text-sm font-medium hover:text-accent-primary-hover transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const today = new Date();
                        setCalendarDate(today);
                        handleDateSelect(
                          today.getDate().toString(),
                          (today.getMonth() + 1).toString(),
                          today.getFullYear().toString()
                        );
                      }}
                      className="text-accent-primary text-sm font-medium hover:text-accent-primary-hover transition-colors"
                    >
                      Today
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Time Picker */}
            <div className="space-y-3 relative" data-time-picker>
              <label className="block text-xs uppercase tracking-wider text-secondary">
                BIRTH TIME
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formatDisplayTime()}
                  onClick={handleTimeClick}
                  readOnly
                  placeholder="--:-- --"
                  className="w-full px-0 py-4 bg-transparent border-0 border-b-2 border-primary focus:border-accent-primary focus:outline-none text-primary cursor-pointer placeholder:text-tertiary"
                />
                <div className="absolute right-0 top-4 text-tertiary">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z"/>
                  </svg>
                </div>
              </div>
              
              {/* Custom Time Picker Dropdown */}
              {showTimePicker && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface-elevated border border-primary rounded-lg shadow-xl z-50 p-6">
                  <div className="grid grid-cols-3 gap-4">
                    {/* Hours */}
                    <div>
                      <div className="text-center text-sm font-medium text-secondary mb-3">Hour</div>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {hours.map(hour => (
                          <button
                            key={hour}
                            type="button"
                            onClick={() => setSelectedTime(prev => ({ ...prev, hour }))}
                            className={`w-full p-2 text-sm rounded-md transition-colors ${
                              selectedTime.hour === hour
                                ? 'bg-accent-primary text-white'
                                : 'text-primary hover:bg-secondary'
                            }`}
                          >
                            {hour.padStart(2, '0')}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Minutes */}
                    <div>
                      <div className="text-center text-sm font-medium text-secondary mb-3">Min</div>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {minutes.filter((_, i) => i % 5 === 0).map(minute => (
                          <button
                            key={minute}
                            type="button"
                            onClick={() => setSelectedTime(prev => ({ ...prev, minute }))}
                            className={`w-full p-2 text-sm rounded-md transition-colors ${
                              selectedTime.minute === minute
                                ? 'bg-accent-primary text-white'
                                : 'text-primary hover:bg-secondary'
                            }`}
                          >
                            {minute}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* AM/PM */}
                    <div>
                      <div className="text-center text-sm font-medium text-secondary mb-3">Period</div>
                      <div className="space-y-1">
                        {['AM', 'PM'].map(period => (
                          <button
                            key={period}
                            type="button"
                            onClick={() => setSelectedTime(prev => ({ ...prev, period }))}
                            className={`w-full p-2 text-sm rounded-md transition-colors ${
                              selectedTime.period === period
                                ? 'bg-accent-primary text-white'
                                : 'text-primary hover:bg-secondary'
                            }`}
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-4 pt-4 border-t border-primary">
                    <button
                      type="button"
                      onClick={() => setShowTimePicker(false)}
                      className="text-accent-primary text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedTime.hour && selectedTime.minute) {
                          handleTimeSelect(selectedTime.hour, selectedTime.minute, selectedTime.period);
                        }
                      }}
                      disabled={!selectedTime.hour || !selectedTime.minute}
                      className="text-accent-primary text-sm font-medium disabled:text-tertiary"
                    >
                      Set Time
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Place of Birth */}
          <div className="space-y-3">
            <label className="block text-xs uppercase tracking-wider text-secondary">
              PLACE OF ARRIVAL
            </label>
            <div className="relative" ref={placeInputRef}>
              <input
                type="text"
                value={formData.placeOfBirth}
                onChange={(e) => handlePlaceInput(e.target.value)}
                onFocus={() => {
                  if (formData.placeOfBirth.length > 0) {
                    setShowPlaceSuggestions(true);
                  }
                }}
                placeholder="City, Country"
                className="w-full px-0 py-4 bg-transparent border-0 border-b-2 border-primary focus:border-accent-primary focus:outline-none text-primary placeholder:text-tertiary"
                autoComplete="off"
              />
              <div className="absolute right-0 top-4 text-tertiary">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2C8.13,2 5,5.13 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9C19,5.13 15.87,2 12,2M12,11.5C10.62,11.5 9.5,10.38 9.5,9C9.5,7.62 10.62,6.5 12,6.5C13.38,6.5 14.5,7.62 14.5,9C14.5,10.38 13.38,11.5 12,11.5Z"/>
                </svg>
              </div>
              
              {/* Place Suggestions Dropdown */}
              {showPlaceSuggestions && placeSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface-elevated border border-primary rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {placeSuggestions.map((place, index) => (
                    <button
                      key={`${place.place_id || index}`}
                      type="button"
                      onClick={() => {
                        const placeName = formatPlaceName(place);
                        setFormData(prev => ({ ...prev, placeOfBirth: placeName }));
                        setShowPlaceSuggestions(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-secondary transition-colors text-primary border-b border-primary last:border-b-0 focus:outline-none focus:bg-secondary"
                    >
                      <div className="flex items-start space-x-3">
                        <svg className="w-4 h-4 text-accent-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12,2C8.13,2 5,5.13 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9C19,5.13 15.87,2 12,2M12,11.5C10.62,11.5 9.5,10.38 9.5,9C9.5,7.62 10.62,6.5 12,6.5C13.38,6.5 14.5,7.62 14.5,9C14.5,10.38 13.38,11.5 12,11.5Z"/>
                        </svg>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-primary text-sm leading-tight">
                            {place.address?.city || 
                             place.address?.town || 
                             place.address?.village || 
                             place.address?.municipality || 
                             place.address?.hamlet ||
                             place.address?.suburb ||
                             place.name || 
                             place.display_name?.split(',')[0]?.trim()}
                          </div>
                          <div className="text-xs text-tertiary mt-1 leading-tight">
                            {[
                              place.address?.state || place.address?.province || place.address?.region,
                              place.address?.country
                            ].filter(Boolean).join(', ')}
                          </div>
                          {place.type && (
                            <div className="text-xs text-accent-primary mt-1 capitalize">
                              {place.type.replace(/_/g, ' ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                  
                  {formData.placeOfBirth.length >= 2 && placeSuggestions.length === 0 && (
                    <div className="px-4 py-6 text-center">
                      <div className="text-tertiary text-sm mb-2">
                        No places found for "{formData.placeOfBirth}"
                      </div>
                      <div className="text-xs text-tertiary">
                        Try searching for a city, town, or village name
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Loading indicator */}
              {showPlaceSuggestions && placeSuggestions.length === 0 && formData.placeOfBirth.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface-elevated border border-primary rounded-lg shadow-lg z-50">
                  <div className="px-4 py-6 text-center">
                    <div className="inline-flex items-center space-x-2 text-tertiary text-sm">
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Searching places...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-tertiary italic">
              Where the cosmos & earthly realms first met
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="text-center p-4 bg-accent-primary bg-opacity-10 rounded-xl">
              <p className="text-accent-primary font-medium">{successMessage}</p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-8">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-secondary hover:text-primary transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>CANCEL</span>
            </button>
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-full font-medium transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <span>{isSubmitting ? 'Adding to Constellation...' : 'Add to Constellation'}</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-12">
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